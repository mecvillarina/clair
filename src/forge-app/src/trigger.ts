import moment from "moment";
import { getIssueDetails, searchIssues } from "./services/jiraService";
import { getKeyElement, saveKeyElement } from "./services/keyElementService";
import { extractKeyElement } from "./services/nlpService";

export async function issueCreated(event: any, context: any) {
    console.log("New issue created");
    getIssueDetailsAndCaptureKeyElements(event);
}

export async function issueUpdated(event: any, context: any) {
    console.log("Old issue updated");
    getIssueDetailsAndCaptureKeyElements(event);
}

async function getIssueDetailsAndCaptureKeyElements(event) {

    const issueKey = event.issue.key;

    //insert checking when to fetch key elements from NLP Service

    let currentKeyElement = await getKeyElement(issueKey);

    if (!currentKeyElement || +currentKeyElement.fetchAt + 3600 < moment().unix()) {
        console.log("extracting");

        const details = await getIssueDetails(issueKey);
        console.log(details.summary);
        console.log(details.description);
        console.log(moment().unix());
        const prompt = details.summary.concat(": ", details.description);

        if (details.summary && details.description) {
            var result = await extractKeyElement(prompt);

            if (result) {
                console.log(result);
                await saveKeyElement(issueKey, result);
            }
            else {
                console.log("no result");
                return;
            }
        }
    }

    currentKeyElement = await getKeyElement(issueKey);

    if (currentKeyElement) {
        console.log(currentKeyElement);
        await searchIssues(currentKeyElement.keyPhrases.concat(currentKeyElement.entities));
    }
}


