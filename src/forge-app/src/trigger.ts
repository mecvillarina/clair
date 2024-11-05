import { getIssueDetails } from "./services/jiraService";
import { GetKeyElementByIssueKey, SaveKeyElement } from "./services/keyElementService";
import { getKeyElements } from "./services/nlpService";

export async function issueCreated(event: any, context: any) {
    console.log("New issue created");
    GetIssueDetailsAndCaptureKeyElements(event);
}

export async function issueUpdated(event: any, context: any) {
    console.log("Old issue updated");
    GetIssueDetailsAndCaptureKeyElements(event);
}

async function GetIssueDetailsAndCaptureKeyElements(event) {
    const issueKey = event.issue.key;

    const details = await getIssueDetails(issueKey);
    console.log(details.summary);
    console.log(details.description);
    GetKeyElementByIssueKey(issueKey);
    const prompt = details.summary.concat(": ", details.description);

    if (details.summary && details.description) {
        var result = await getKeyElements(prompt);

        if(result){
            console.log(result);
            SaveKeyElement(issueKey, result);
        }
        else{
            console.log("no result");
        }
    }
}
