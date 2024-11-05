import api, { route } from "@forge/api";
import { IssueDetails } from "../models";
import { findAllValuesByKey } from "../utils";

export async function getIssueDetails(issueIdOrKey) : Promise<IssueDetails> {
    const res = await api.asApp().requestJira(route`/rest/api/3/issue/${issueIdOrKey}?fields=summary,description`);
    const data = await res.json();
    return { summary: data.fields.summary, description: findAllValuesByKey(data, "text").join("|") };
}

