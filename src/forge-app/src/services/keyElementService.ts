import { storage, WhereConditions } from '@forge/api';
import { KeyElement } from 'src/models';
import moment from 'moment';
import { getKeyElements } from './nlpService';

export async function GetKeyElementByIssueKey(issueKey : string): Promise<KeyElement> {
    var data = await storage.entity("keyelement")
        .query()
        .index('issueKey')
        .where(WhereConditions.equalsTo(issueKey))
        .getOne();

    if(data){
        console.log("has data");
    }
    else{
        console.log("no data");
    }
    
    return null;
}

export async function SaveKeyElement(issueKey : string, newKeyElement : KeyElement) {
    var keyelement = await GetKeyElementByIssueKey(issueKey);

    if(!newKeyElement)
    {
        console.log("insert");
        var epoch = moment().unix().toString();
        await storage.entity("keyelement").set(issueKey, {
            issueKey: issueKey,
            dataKeyPhrases: newKeyElement.keyPhrases.join("|"),
            dataEntities: newKeyElement.entities.join("|"),
            dataIntent: newKeyElement.intent,
            createdAt: epoch,
            updatedAt: epoch
        });    
    }
    

}