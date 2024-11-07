import { getRelatedIssues } from "./recommenderService";

export async function issueCreated(event: any, context: any) {
    console.log("New issue created");
    getRelatedIssues(event.issue.key);
}

export async function issueUpdated(event: any, context: any) {
    console.log("Old issue updated");
    getRelatedIssues(event.issue.key);
}
