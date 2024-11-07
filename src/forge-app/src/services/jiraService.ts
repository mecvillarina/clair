import api, { route } from "@forge/api";
import { IssueDetails } from "../models";
import { findAllValuesByKey } from "../utils";

export async function getIssueDetails(issueIdOrKey): Promise<IssueDetails> {
    const res = await api.asApp().requestJira(route`/rest/api/3/issue/${issueIdOrKey}?fields=summary,description`);
    const data = await res.json();
    return { summary: data.fields.summary, description: findAllValuesByKey(data, "text").join(" ") };
}

export async function searchIssues(queryTerms: string[]) {

    if (queryTerms === undefined || queryTerms.length == 0) {
        return;
    }

    var pTerms = [];
    queryTerms.forEach(element => {
        pTerms.push(`text ~ "${element}"`);
    });

    console.log(pTerms);
    const jql = pTerms.join(" OR ");
    // let jql = `text ~ "${query}"`;
    // jql = encodeURIComponent(jql); 

    console.log(jql);
    const res = await api.asApp().requestJira(route`/rest/api/3/search/jql?jql=${jql}&maxResults=5000&fields=summary,description,created,updated`, {
        headers: {
            'Accept': 'application/json'
        }
    });

    const data = await res.json();
    console.log(JSON.stringify(data, null, 4));
}