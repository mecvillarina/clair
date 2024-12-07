import { storage, WhereConditions } from '@forge/api';
import { IssueFetchDetails, KeyElement } from 'src/models';
import moment from 'moment';

async function getIssueFetchDetailsFromStorage(issueKey: string) {
    const data = await storage.entity("issuefetchdetail")
        .query()
        .index('issueKey')
        .where(WhereConditions.equalsTo(issueKey))
        .getOne();

    return data;
}

export async function getIssueFetchDetails(issueKey: string): Promise<IssueFetchDetails | undefined> {
    const data = await getIssueFetchDetailsFromStorage(issueKey);

    if (data) {
        return { key: issueKey, updatedAt: +data.value["updatedAt"] }
    }
}

export async function updateIssueFetchDetails(issueKey: string) : Promise<IssueFetchDetails | undefined> {
    const epoch = moment().unix().toString(); //in seconds

    await storage.entity("issuefetchdetail").set(issueKey, {
        issueKey: issueKey,
        updatedAt: epoch
    });

    return await getIssueFetchDetails(issueKey);
}
