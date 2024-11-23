import { fetchRelatedIssues } from "./insightService";

export async function issueCreated(event: any, context: any) {
    console.log("New issue created");
    // fetchRelatedIssues(event.issue.key);
}

export async function issueUpdated(event: any, context: any) {
    console.log("Old issue updated");
    // fetchRelatedIssues(event.issue.key);
}
