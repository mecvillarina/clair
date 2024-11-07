import { AppSettingsStorage, buildDefaultSettings, RelatedIssueDetails } from "./models";
import { APPSETTINGS_STORAGE_KEY } from "./preference-keys";
import { getIssueDetails, searchIssues } from "./services/jiraService";
import { deleteKeyElement, getKeyElement, saveKeyElement } from "./services/keyElementService";
import { storage } from "@forge/api";
import { getSeconds } from "./utils";
import moment from "moment";
import { extractKeyElement } from "./services/nlpService";

export async function getRelatedIssues(issueKey: string, isForce = false) : Promise<RelatedIssueDetails[]> {

    const appSettings: AppSettingsStorage = await storage.get(APPSETTINGS_STORAGE_KEY) ?? buildDefaultSettings();
    const resultRetention = getSeconds(appSettings.resultRetention);
    var currentKeyElement = await getKeyElement(issueKey);
    var relatedIssues: RelatedIssueDetails[] = [];

    if (isForce || !currentKeyElement || +currentKeyElement.fetchAt + resultRetention < moment().unix()) {
        console.log("extracting");

        const details = await getIssueDetails(issueKey);
        console.log(details.summary, details.description, moment().unix());
        const prompt = details.summary.concat(": ", details.description);

        if (details.summary && details.description) {
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
    }

    return relatedIssues;
}