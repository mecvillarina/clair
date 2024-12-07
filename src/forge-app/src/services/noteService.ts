import { storage, WhereConditions } from '@forge/api';
import { ClairNoteItem } from 'src/models';

const entityKey = "clairnote";

async function getNoteFromStorage(issueKey: string) {
    const data = await storage.entity(entityKey)
        .query()
        .index('issueKey')
        .where(WhereConditions.equalsTo(issueKey))
        .getOne();

    return data;
}

export async function getNoteItems(issueKey: string): Promise<ClairNoteItem[] | undefined> {

    try {
        const cache = await getNoteFromStorage(issueKey);

        if (cache) {
            return JSON.parse(cache.value["data"]);
        }
    }
    catch (e) {
        console.log(e);
    }

    return [];
}

export async function addNoteItem(issueKey: string, newNoteItem: ClairNoteItem): Promise<boolean> {

    var items = await getNoteItems(issueKey);

    if (!items.some(item => item.contentKey === newNoteItem.contentKey && item.contentType === newNoteItem.contentType)) {
        items.push(newNoteItem);

        await storage.entity(entityKey).set(issueKey, {
            issueKey: issueKey,
            data: JSON.stringify(items),
        });

        return true;
    }

    return false;
}

export async function removeNoteItem(issueKey: string, currentNoteItem: ClairNoteItem): Promise<boolean> {

    var items = await getNoteItems(issueKey);

    items = items.filter(item => !(item.contentKey === currentNoteItem.contentKey));

    await storage.entity(entityKey).set(issueKey, {
        issueKey: issueKey,
        data: JSON.stringify(items),
    });
    
    return true;
}