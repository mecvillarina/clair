import  { getIssueDetails } from "./services/jiraService";
import { getChatCompletion } from "./services/nlpService";

export async function issueCreated(event: any, context: any)
{
    console.log("New issue created");
    var details = await getIssueDetails(event.issue.key);
    console.log(details.summary);
    console.log(details.description);
}

export async function issueUpdated(event: any, context: any)
{
    console.log("Old issue updated");
    console.log(event);
    var details = await getIssueDetails(event.issue.key);
    console.log(details.summary);
    console.log(details.description);
    const prompt = details.summary.concat("|", details.description);
    await getChatCompletion(prompt);
}
