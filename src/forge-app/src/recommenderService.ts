import { AppSettingsStorage, buildDefaultSettings, RelatedIssueDetails } from "./models";
import { APPSETTINGS_STORAGE_KEY } from "./preference-keys";
import { getIssueDetails, searchIssues } from "./services/jiraService";
import { deleteKeyElement, getKeyElement, saveKeyElement } from "./services/keyElementService";
import { storage } from "@forge/api";
import { calculate75thPercentile, calculateCosineSimilarity, calculateRecencyScore, getSeconds } from "./utils";
import moment from "moment";
import { extractKeyElement, getEmbedding } from "./services/nlpService";
import { getIssueFetchDetails, updateIssueFetchDetails } from "./services/issueFetchDetailService";
import { getRelatedIssues, updateRelatedIssues } from "./services/relatedIssueService";

export async function getRecommendedRelatedIssues(issueKey: string, isForce = false): Promise<RelatedIssueDetails[]> {

    //Fetch App Settings - Result Retention
    const appSettings: AppSettingsStorage = await storage.get(APPSETTINGS_STORAGE_KEY) ?? buildDefaultSettings();
    var resultRetention = getSeconds(appSettings.resultRetention);

    // resultRetention = 0;

    //Get Issue Fetch Details for Last Updated Time
    var issueFetchDetails = await getIssueFetchDetails(issueKey);
    var relatedIssues: RelatedIssueDetails[] = [];

    //Check if the issue details need to be fetched based on resultRentention value
    if (isForce || !issueFetchDetails || +issueFetchDetails.updatedAt + resultRetention < moment().unix()) {

        //Get Issue Details - JIRA API
        const issueDetails = await getIssueDetails(issueKey);

        if (issueDetails.summary && issueDetails.description) {

            //Construct Prompt
            const prompt = issueDetails.summary.concat(": ", issueDetails.description);

            //Extract Key Elements
            const result = await extractKeyElement(prompt);

            //Save Key Elements
            if (result) {
                console.log("Key Elements:", result);
                await saveKeyElement(issueKey, result);
            }
            else {
                console.log("Key Elements: No Result");
                await deleteKeyElement(issueKey);
            }
        }

        //Get Key Elements
        const currentKeyElement = await getKeyElement(issueKey);

        if (currentKeyElement) {
            var data = currentKeyElement.keyPhrases.concat(currentKeyElement.entities);
            data = data.filter(i => i !== "");

            //Search Issues - JIRA API
            var issues = await searchIssues(data);

            var filteredRelatedIssues : RelatedIssueDetails[] = [];

            console.log("Current Issue: ", issueDetails.key, ": ", issueDetails.summary);

            if (issues.length > 0) {
                //Get Embedding for Current Issue
                const currentIssueEmbedding = await getEmbedding(issueDetails.summary.concat(": ", issueDetails.description));

                if (currentIssueEmbedding) {

                    for (const i of issues) {
                        if (i.key !== issueKey) {
                            //Get Embedding for Related Issue
                            const relatedIssueEmbedding = await getEmbedding(i.summary.concat(": ", i.description));

                            if (relatedIssueEmbedding) {
                                //Get Cosine Similarity
                                const similarityScore = calculateCosineSimilarity(currentIssueEmbedding, relatedIssueEmbedding);
                                console.log("Cosine Similarity:", i.key, similarityScore);

                                const lambda = 0.002;   // Adjust this to control recency decay rate

                                //Get Recency Score
                                const recencyScore = calculateRecencyScore(i.updated, lambda);

                                const alpha = 0.8;      // Weight for similarity
                                const beta = 0.2;       // Weight for recency

                                const finalScore = alpha * similarityScore + beta * recencyScore;

                                // console.log(i.key, i.summary, similarityScore, recencyScore, finalScore);
                                filteredRelatedIssues.push({ key: i.key, summary: i.summary, description: "", created: i.created, updated: i.updated, similarityScore: similarityScore, recencyScore: recencyScore, finalScore: finalScore });
                            }
                        }
                    }

                    if (filteredRelatedIssues.length > 0) {
                        //Calculate 75th Percentile
                        var value = calculate75thPercentile(filteredRelatedIssues.map(i => i.finalScore));
                        console.log("75th Percentile:", value);

                        //Filter Issues based on 75th Percentile
                        filteredRelatedIssues = filteredRelatedIssues.filter(i => i.finalScore > 0.75 && i.finalScore >= value);

                        //Sort Issues based on Final Score
                        filteredRelatedIssues = filteredRelatedIssues.sort((a, b) => b.finalScore - a.finalScore);

                        console.log("Filtered Issues:", filteredRelatedIssues);

                        updateRelatedIssues(issueKey, filteredRelatedIssues);

                        relatedIssues = filteredRelatedIssues;
                    }
                }
            }
        }

        updateIssueFetchDetails(issueKey);
    }
    else{
        relatedIssues = await getRelatedIssues(issueKey);
    }

    console.log("Related Issues:", relatedIssues);

    return relatedIssues;
}