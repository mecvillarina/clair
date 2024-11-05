import { getIssueDetails } from "./services/jiraService";
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
    var details = await getIssueDetails(event.issue.key);
    console.log(details.summary);
    console.log(details.description);
    const prompt = details.summary.concat(": ", details.description);

    if (details.summary && details.description) {
        var result = await getKeyElements(prompt);
        console.log(result);
    }
}
