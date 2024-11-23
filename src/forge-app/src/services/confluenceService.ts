import api, { route } from "@forge/api";
import { findAllValuesByKey } from "../utils";
import { PageDetails } from "src/models";


export async function getPageDetails(id): Promise<PageDetails> {

    try{
        const res = await api.asApp().requestConfluence(route`/wiki/api/v2/pages/${id}?body-format=ATLAS_DOC_FORMAT`);
        // const res = await api.asApp().requestJira(route`/rest/api/3/issue/${issueIdOrKey}`);
        const data = await res.json();
        // console.log(JSON.stringify(data, null, 4));

        return { id: id, title: data.title, description: findAllValuesByKey(JSON.parse(data.body.atlas_doc_format.value), "text").join(" "), url: data._links.base.concat(data._links.webui), updated: data.version.createdAt };
    }
    catch(e){
        console.log(e);
    }

    return null;
}

export async function searchPages(queryTerms: string[]) :  Promise<PageDetails[]> {

    try {
        if (queryTerms === undefined || queryTerms.length == 0) {
            return;
        }

        console.log("Search Pages");

        const pTerms = [];
        queryTerms.forEach(element => {
            pTerms.push(`text ~ "${element}"`);
        });

        console.log(pTerms);
        let cql = pTerms.join(" OR ");
        cql = "(type=page) AND ".concat(cql);

        console.log(cql);
        const res = await api.asApp().requestConfluence(route`/wiki/rest/api/search?cql=${cql}&limit=50`, {
            headers: {
                'Accept': 'application/json'
            }
        });

        const data = await res.json();
        // console.log(JSON.stringify(data, null, 4));
        const result: PageDetails[] = [];

        data.results.forEach(element => {
            result.push({ id: element.content.id, title: element.content.title, description: element.excerpt, url: element.url, updated: element.lastModified });
        });

        return result;

    }
    catch (e) {
        console.log(e);
    }

    return [];
}