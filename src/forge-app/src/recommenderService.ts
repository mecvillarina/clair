import { AppSettingsStorage, buildDefaultSettings, RelatedIssueDetails } from "./models";
import { APPSETTINGS_STORAGE_KEY } from "./preference-keys";
import { getIssueDetails, searchIssues } from "./services/jiraService";
import { deleteKeyElement, getKeyElement, saveKeyElement } from "./services/keyElementService";
import { storage } from "@forge/api";
import { cosineSimilarity, getSeconds } from "./utils";
import moment from "moment";
import { extractKeyElement, getEmbedding } from "./services/nlpService";

export async function getRelatedIssues(issueKey: string, isForce = false): Promise<RelatedIssueDetails[]> {

    const appSettings: AppSettingsStorage = await storage.get(APPSETTINGS_STORAGE_KEY) ?? buildDefaultSettings();
    const resultRetention = getSeconds(appSettings.resultRetention);
    
    //update caching last fetch on other entity and remove it from keyElement entity

    var currentKeyElement = await getKeyElement(issueKey);
    var relatedIssues: RelatedIssueDetails[] = [];

    const issueDetails = await getIssueDetails(issueKey);

    if (isForce || !currentKeyElement || +currentKeyElement.fetchAt + resultRetention < moment().unix()) {
        console.log("extracting");

        console.log(issueDetails.summary, issueDetails.description, moment().unix());
        const prompt = issueDetails.summary.concat(": ", issueDetails.description);

        if (issueDetails.summary && issueDetails.description) {
            const result = await extractKeyElement(prompt);

            if (result) {
                console.log("result", result);
                await saveKeyElement(issueKey, result);
            }
            else {
                console.log("no result");
                await deleteKeyElement(issueKey);
            }
        }
    }

    currentKeyElement = await getKeyElement(issueKey);

    if (currentKeyElement) {
        var data = currentKeyElement.keyPhrases.concat(currentKeyElement.entities);
        data = data.filter(i => i !== "");
        relatedIssues = await searchIssues(data);

        //do logic for ranking and filtering based on Relevance, Recency and Popularity

        if (relatedIssues.length > 0) {
            const issueDetailsEmbedding = await getEmbedding(issueDetails.summary.concat(": ", issueDetails.description));

            if (issueDetailsEmbedding) {
                relatedIssues.forEach(async i => {
                    const relatedIssueEmbedding = await getEmbedding(i.summary.concat(": ", i.description));

                    if(relatedIssueEmbedding) {
                        const similarity = cosineSimilarity(issueDetailsEmbedding, relatedIssueEmbedding);
                        console.log("Cosine Similarity:", i.key, similarity);

                        if(similarity >= 0.70) {
                            
                        }
                    }
                });
            }
        }
    }

    return relatedIssues;
}