import { AppSettingsStorage, buildDefaultSettings, RelatedIssueDetails } from "./models";
import { APPSETTINGS_STORAGE_KEY } from "./preference-keys";
import { getIssueDetails, searchIssues } from "./services/jiraService";
import { deleteKeyElement, getKeyElement, saveKeyElement } from "./services/keyElementService";
import { storage } from "@forge/api";
import { calculate75thPercentile, calculateCosineSimilarity, calculateRecencyScore, getSeconds } from "./utils";
import moment from "moment";
import { extractKeyElement, getEmbedding } from "./services/nlpService";
import { getIssueFetchDetails, updateIssueFetchDetails } from "./services/issueFetchDetailService";

export async function getRelatedIssues(issueKey: string, isForce = false): Promise<RelatedIssueDetails[]> {

    const appSettings: AppSettingsStorage = await storage.get(APPSETTINGS_STORAGE_KEY) ?? buildDefaultSettings();
    var resultRetention = getSeconds(appSettings.resultRetention);

    resultRetention = 0;

    var issueFetchDetails = await getIssueFetchDetails(issueKey);
    var relatedIssues: RelatedIssueDetails[] = [];

    if (isForce || !issueFetchDetails || +issueFetchDetails.updatedAt + resultRetention < moment().unix()) {
        const issueDetails = await getIssueDetails(issueKey);

        console.log(issueDetails.summary, issueDetails.description, moment().unix());
        const prompt = issueDetails.summary.concat(": ", issueDetails.description);

        if (issueDetails.summary && issueDetails.description) {
            const result = await extractKeyElement(prompt);

            if (result) {
                console.log("Key Elements:", result);
                await saveKeyElement(issueKey, result);
            }
            else {
                console.log("Key Elements: No Result");
                await deleteKeyElement(issueKey);
            }
        }

        const currentKeyElement = await getKeyElement(issueKey);

        if (currentKeyElement) {
            var data = currentKeyElement.keyPhrases.concat(currentKeyElement.entities);
            // var data = currentKeyElement.keyPhrases;
            data = data.filter(i => i !== "");
            var issues = await searchIssues(data);

            var issueRankings: RelatedIssueDetails[] = [];

            console.log("Current Issue: ", issueDetails.key, ": ", issueDetails.summary);
            if (issues.length > 0) {
                const currentIssueEmbedding = await getEmbedding(issueDetails.summary.concat(": ", issueDetails.description));

                if (currentIssueEmbedding) {

                    for (const i of issues) {
                        if (i.key !== issueKey) {
                            const relatedIssueEmbedding = await getEmbedding(i.summary.concat(": ", i.description));

                            if (relatedIssueEmbedding) {
                                //get cosine similarities
                                const similarityScore = calculateCosineSimilarity(currentIssueEmbedding, relatedIssueEmbedding);
                                console.log("Cosine Similarity:", i.key, similarityScore);

                                const lambda = 0.002;   // Adjust this to control recency decay rate

                                const recencyScore = calculateRecencyScore(i.updated, lambda);

                                const alpha = 0.8;      // Weight for similarity
                                const beta = 0.2;       // Weight for recency

                                const finalScore = alpha * similarityScore + beta * recencyScore;

                                console.log(i.key, i.summary, similarityScore, recencyScore, finalScore);
                                issueRankings.push({ key: i.key, summary: i.summary, description: i.description, created: i.created, updated: i.updated, similarityScore: similarityScore, recencyScore: recencyScore, finalScore: finalScore });
                            }
                        }
                    }

                    if (issueRankings.length > 0) {
                        var value = calculate75thPercentile(issueRankings.map(i => i.finalScore));
                        console.log("75th Percentile:", value);

                        issueRankings = issueRankings.filter(i => i.finalScore >= value);

                        console.log("Filtered Issues:", issueRankings);

                        //save rankings
                    }
                }
            }
        }

        updateIssueFetchDetails(issueKey);
    }


    return relatedIssues;
}