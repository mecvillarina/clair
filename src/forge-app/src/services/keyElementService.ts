import { storage, WhereConditions } from '@forge/api';
import { KeyElement } from 'src/models';
import moment from 'moment';

async function getKeyElementFromStorage(issueKey: string) {
    const data = await storage.entity("keyelement")
        .query()
        .index('issueKey')
        .where(WhereConditions.equalsTo(issueKey))
        .getOne();

    return data;
}

export async function getKeyElement(issueKey: string): Promise<KeyElement | undefined> {
    const data = await getKeyElementFromStorage(issueKey);

    if (data) {
        return { keyPhrases: JSON.parse(data.value["dataKeyPhrases"]), entities: JSON.parse(data.value["dataEntities"]), intent: data.value["dataIntent"], fetchAt: data.value["updatedAt"] }
    }
}

export async function saveKeyElement(issueKey: string, newKeyElement: KeyElement) {
    const storedKeyElement = await getKeyElementFromStorage(issueKey);

    const epoch = moment().unix().toString(); //in seconds

    // newKeyElement.keyPhrases = [];
    // newKeyElement.entities = [];
    // newKeyElement.intent = "";

    if (!storedKeyElement) {
        console.log("insert");

        await storage.entity("keyelement").set(issueKey, {
            issueKey: issueKey,
            dataKeyPhrases: newKeyElement.keyPhrases.length > 0 ? JSON.stringify(newKeyElement.keyPhrases) : "[]",
            dataEntities: newKeyElement.entities.length > 0 ? JSON.stringify(newKeyElement.entities) : "[]",
            dataIntent: newKeyElement.intent !== "" ? newKeyElement.intent : "|",
            createdAt: epoch,
            updatedAt: epoch
        });
    }
    else {

        console.log("update");

        await storage.entity("keyelement").set(issueKey, {
            issueKey: issueKey,
            dataKeyPhrases: newKeyElement.keyPhrases.length > 0 ? JSON.stringify(newKeyElement.keyPhrases) : "[]",
            dataEntities: newKeyElement.entities.length > 0 ? JSON.stringify(newKeyElement.entities) : "[]",
            dataIntent: newKeyElement.intent !== "" ? newKeyElement.intent : "|",
            createdAt: storedKeyElement.value["createdAt"],
            updatedAt: epoch
        });
    }
}

export async function deleteKeyElement(issueKey: string) {
    await storage.entity("keyelement").delete(issueKey);
}