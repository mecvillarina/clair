import { storage, WhereConditions } from '@forge/api';
import { KeyElement } from 'src/models';
import moment from 'moment';
import { extractKeyElement } from './nlpService';

export async function getKeyElementFromStorage(issueKey: string) {
    var data = await storage.entity("keyelement")
        .query()
        .index('issueKey')
        .where(WhereConditions.equalsTo(issueKey))
        .getOne();

    return data;
}

export async function getKeyElement(issueKey: string): Promise<KeyElement | undefined> {
    var data = await getKeyElementFromStorage(issueKey);

    if (data) {
        return { keyPhrases: data.value["dataKeyPhrases"].split('|'), entities: data.value["dataEntities"].split('|'), intent: data.value["dataIntent"], fetchAt: data.value["updatedAt"] }
    }
}

export async function saveKeyElement(issueKey: string, newKeyElement: KeyElement) {
    var storedKeyElement = await getKeyElementFromStorage(issueKey);

    var epoch = moment().unix().toString(); //in seconds

    if (!storedKeyElement) {
        console.log("insert");

        await storage.entity("keyelement").set(issueKey, {
            issueKey: issueKey,
            dataKeyPhrases: newKeyElement.keyPhrases.join("|"),
            dataEntities: newKeyElement.entities.join("|"),
            dataIntent: newKeyElement.intent,
            createdAt: epoch,
            updatedAt: epoch
        });
    }
    else {
        console.log("update");

        await storage.entity("keyelement").set(issueKey, {
            issueKey: issueKey,
            dataKeyPhrases: newKeyElement.keyPhrases.join("|"),
            dataEntities: newKeyElement.entities.join("|"),
            dataIntent: newKeyElement.intent,
            createdAt: storedKeyElement.value["createdAt"],
            updatedAt: epoch
        });
    }


}