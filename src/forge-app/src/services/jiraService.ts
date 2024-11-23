import api, { route } from "@forge/api";
import { IssueDetails, RelatedIssueDetails } from "../models";
import { findAllValuesByKey } from "../utils";

export async function getIssueDetails(issueIdOrKey): Promise<IssueDetails> {
    const res = await api.asApp().requestJira(route`/rest/api/3/issue/${issueIdOrKey}?fields=summary,description`);
    // const res = await api.asApp().requestJira(route`/rest/api/3/issue/${issueIdOrKey}`);
    const data = await res.json();
    // console.log(JSON.stringify(data));
    return { key: issueIdOrKey, summary: data.fields.summary, description: findAllValuesByKey(data, "text").join(" ") };
}

export async function searchIssues(queryTerms: string[]): Promise<RelatedIssueDetails[]> {

    try {
        if (queryTerms === undefined || queryTerms.length == 0) {
            return;
        }

        const pTerms = [];
        queryTerms.forEach(element => {
            pTerms.push(`text ~ "${element}"`);
        });

        console.log(pTerms);
        const jql = pTerms.join(" OR ");
        // let jql = `text ~ "${query}"`;
        // jql = encodeURIComponent(jql); 

        console.log(jql);
        const res = await api.asApp().requestJira(route`/rest/api/3/search/jql?jql=${jql}&maxResults=100&fields=summary,description,created,updated`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        // const res = await api.asApp().requestJira(route`/rest/api/3/search/jql?jql=${jql}&maxResults=100`, {
        //     headers: {
        //         'Accept': 'application/json'
        //     }
        // });

        const data = await res.json();

        // console.log(JSON.stringify(data));
        const result: RelatedIssueDetails[] = [];

        data.issues.forEach(element => {
            result.push({ key: element.key, summary: element.fields.summary, description: findAllValuesByKey(element.fields, "text").join(" "), created: element.fields.created, updated: element.fields.updated, similarityScore: 0, recencyScore: 0, finalScore: 0, ranking: 0 });
        });

        // console.log(JSON.stringify(data, null, 4));

        return result;
    }
    catch (e) {
        console.log(e);
    }

    return [];
}