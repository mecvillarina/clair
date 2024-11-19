import { getRecommendedRelatedIssues } from "./recommenderService";

export async function issueCreated(event: any, context: any) {
    console.log("New issue created");
    getRecommendedRelatedIssues(event.issue.key);
}

export async function issueUpdated(event: any, context: any) {
    console.log("Old issue updated");
    getRecommendedRelatedIssues(event.issue.key);
}
