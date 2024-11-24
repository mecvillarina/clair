import { storage, WhereConditions } from '@forge/api';
import { RelatedPageDetails } from 'src/models';
import moment from 'moment';

const entityKey = "relatedpage";

async function getRelatedPageFromStorage(issueKey: string) {
    const data = await storage.entity(entityKey)
        .query()
        .index('issueKey')
        .where(WhereConditions.equalsTo(issueKey))
        .getOne();

    return data;
}

export async function getRelatedPages(issueKey: string): Promise<RelatedPageDetails[] | undefined> {

    try {
        const cache = await getRelatedPageFromStorage(issueKey);

        if (cache) {
            return JSON.parse(cache.value["data"]);
        }
    }
    catch (e) {
        console.log(e);
    }

    return [];
}

export async function updateRelatedPages(issueKey: string, relatedIssues: RelatedPageDetails[]): Promise<RelatedPageDetails[] | undefined> {
    const epoch = moment().unix().toString(); //in seconds

    await storage.entity(entityKey).set(issueKey, {
        issueKey: issueKey,
        data: JSON.stringify(relatedIssues),
        createdAt: epoch,
        updatedAt: epoch
    });

    return await getRelatedPages(issueKey);
}
