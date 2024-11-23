import { storage, WhereConditions } from '@forge/api';
import { RelatedIssueDetails } from 'src/models';
import moment from 'moment';

async function getRelatedIssuesFromStorage(issueKey: string) {
    const data = await storage.entity("relatedissue")
        .query()
        .index('issueKey')
        .where(WhereConditions.equalsTo(issueKey))
        .getOne();

    return data;
}

export async function getRelatedIssues(issueKey: string) : Promise<RelatedIssueDetails[] | undefined> {
    const cache = await getRelatedIssuesFromStorage(issueKey);

    if (cache) {
        return JSON.parse(cache.value["data"]);
    }

    return [];
}

export async function updateRelatedIssues(issueKey: string, relatedIssues: RelatedIssueDetails[]) : Promise<RelatedIssueDetails[] | undefined> {
    const epoch = moment().unix().toString(); //in seconds

    await storage.entity("relatedissue").set(issueKey, {
        issueKey: issueKey,
        data: JSON.stringify(relatedIssues),
        createdAt: epoch,
        updatedAt: epoch
    });

    return await getRelatedIssues(issueKey);
}
