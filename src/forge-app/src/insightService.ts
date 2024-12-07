import { AppSettingsStorage, buildDefaultSettings, IssueDetails, KeyElement, RelatedIssueDetails, RelatedPageDetails } from "./models";
import { APPSETTINGS_STORAGE_KEY } from "./preferenceKeys";
import { getIssueDetails, searchIssues } from "./services/jiraService";
import { deleteKeyElement, getKeyElement, saveKeyElement } from "./services/keyElementService";
import { storage } from "@forge/api";
import { calculate75thPercentile, calculateCosineSimilarity, calculateRecencyScore, getSeconds } from "./utils";
import moment from "moment";
import { extractKeyElement, getEmbedding } from "./services/nlpService";
import { getIssueFetchDetails, updateIssueFetchDetails } from "./services/issueFetchDetailService";
import { getRelatedIssues, updateRelatedIssues } from "./services/relatedIssueService";
import { getPageDetails, searchPages } from "./services/confluenceService";
import { getRelatedPages, updateRelatedPages } from "./services/relatedPageService";

export async function isIssueDetailsAvailable(issueKey: string) {

    const appSettings: AppSettingsStorage = await storage.get(APPSETTINGS_STORAGE_KEY) ?? buildDefaultSettings();
    const resultRetention = getSeconds(appSettings.resultRetention);
    const issueFetchDetails = await getIssueFetchDetails(issueKey);

    return issueFetchDetails && +issueFetchDetails.updatedAt + resultRetention >= moment().unix();
}

export async function updateInsightFetchDetails(issueKey: string) {
    await updateIssueFetchDetails(issueKey);
}

export async function getIssueKeyElement(issueDetails: IssueDetails, isFetch = false) {

    if (issueDetails) {

        if (isFetch) {

            if (issueDetails.summary && issueDetails.description) {

                //Construct Prompt
                const prompt = issueDetails.summary.concat(": ", issueDetails.description);

                //Extract Key Elements
                const result = await extractKeyElement(prompt);

                //Save Key Elements
                if (result) {
                    console.log("Key Elements:", result);
                    await saveKeyElement(issueDetails.key, result);
                }
                else {
                    console.log("Key Elements: No Result");
                    await deleteKeyElement(issueDetails.key);
                }
            }
        }

        return await getKeyElement(issueDetails.key);
    }

    return null;
}


export async function fetchRelatedIssues(issueDetails: IssueDetails, keyElement: KeyElement, isFetch = false): Promise<RelatedIssueDetails[]> {

    let relatedIssues: RelatedIssueDetails[] = [];

    if (issueDetails) {
        const issueKey = issueDetails.key;

        if (isFetch) {

            if (keyElement) {
                let data = keyElement.keyPhrases.concat(keyElement.entities);
                data = data.filter(i => i !== "");

                //Search Issues - JIRA API
                const issues = await searchIssues(data);

                let filteredRelatedIssues: RelatedIssueDetails[] = [];

                if (issues.length > 0) {
                    //Get Embedding for Current Issue
                    const currentIssueEmbedding = await getEmbedding(issueDetails.summary.concat(": ", issueDetails.description));

                    if (currentIssueEmbedding) {

                        const filteredRelatedIssuePromises = issues.map(async (i) => {
                            if (i.key !== issueKey) {
                                //Get Embedding for Related Issue
                                const relatedIssueEmbedding = await getEmbedding(i.summary.concat(": ", i.description));

                                if (relatedIssueEmbedding) {
                                    //Get Cosine Similarity
                                    const similarityScore = calculateCosineSimilarity(currentIssueEmbedding, relatedIssueEmbedding);
                                    // console.log("Cosine Similarity:", i.key, similarityScore);

                                    const lambda = 0.002;   // Adjust this to control recency decay rate

                                    //Get Recency Score
                                    const recencyScore = calculateRecencyScore(i.updated, lambda);

                                    const alpha = 0.8;      // Weight for similarity
                                    const beta = 0.2;       // Weight for recency

                                    const finalScore = alpha * similarityScore + beta * recencyScore;

                                    console.log("Final Score:", i.key, finalScore);

                                    // console.log(i.key, i.summary, similarityScore, recencyScore, finalScore);
                                    filteredRelatedIssues.push({ key: i.key, summary: i.summary, created: i.created, updated: i.updated, similarityScore: similarityScore, recencyScore: recencyScore, finalScore: finalScore, ranking: 0 });

                                }
                            }
                        });

                        await Promise.all(filteredRelatedIssuePromises);

                        if (filteredRelatedIssues.length > 0) {
                            //Calculate 75th Percentile
                            const value = calculate75thPercentile(filteredRelatedIssues.map(i => i.finalScore));
                            console.log("75th Percentile:", value);

                            //Filter Issues based on 75th Percentile
                            filteredRelatedIssues = filteredRelatedIssues.filter(i => i.finalScore >= value);

                            //Sort Issues based on Final Score
                            filteredRelatedIssues = filteredRelatedIssues.sort((a, b) => b.finalScore - a.finalScore);

                            //Add Ranking
                            filteredRelatedIssues.forEach(function (issue, index) {
                                issue.ranking = index + 1;
                            });

                            //Get Top 50 Issues
                            filteredRelatedIssues = filteredRelatedIssues.slice(0, 50);

                            // console.log("Filtered Issues:", filteredRelatedIssues);

                            await updateRelatedIssues(issueKey, filteredRelatedIssues);

                            relatedIssues = filteredRelatedIssues;
                        }
                    }
                }
            }
        }
        else {
            relatedIssues = await getRelatedIssues(issueKey);

            const relatedIssuesPromises = relatedIssues.map(async (issue) => {
                const issueDetails = await getIssueDetails(issue.key);

                if (issueDetails) {
                    issue.summary = issueDetails.summary;
                }
            });

            await Promise.all(relatedIssuesPromises);

            await updateRelatedIssues(issueKey, relatedIssues);
        }

    }

    console.log("Related Issues:", relatedIssues);

    return relatedIssues;
}

export async function fetchRelatedPages(issueDetails: IssueDetails, keyElement: KeyElement, isFetch = false): Promise<RelatedPageDetails[]> {

    let relatedPages: RelatedPageDetails[] = [];

    console.log("Issue Details:", issueDetails);
    console.log("Key Element:", keyElement);
    console.log("Is Fetch:", isFetch);
    if (issueDetails) {
        const issueKey = issueDetails.key;

        if (isFetch) {

            if (keyElement) {
                let data = keyElement.keyPhrases.concat(keyElement.entities);
                data = data.filter(i => i !== "");

                //Search Issues - JIRA API
                const pages = await searchPages(data);

                pages.forEach(async element => {
                    const pageDetails = await getPageDetails(element.id);
                    if (pageDetails) {
                        element.description = pageDetails.description;
                        element.updated = pageDetails.updated;
                        element.url = pageDetails.url;
                    }
                });

                let filteredRelatedPages: RelatedPageDetails[] = [];

                if (pages.length > 0) {
                    const currentIssueEmbedding = await getEmbedding(issueDetails.summary.concat(": ", issueDetails.description));

                    if (currentIssueEmbedding) {
                        const filteredRelatedPagePromises = pages.map(async (p) => {
                            //Get Embedding for Related Issue
                            const relatedPageEmbedding = await getEmbedding(p.title.concat(": ", p.description));

                            if (relatedPageEmbedding) {
                                //Get Cosine Similarity
                                const similarityScore = calculateCosineSimilarity(currentIssueEmbedding, relatedPageEmbedding);
                                // console.log("Cosine Similarity:", i.key, similarityScore);

                                const lambda = 0.002;   // Adjust this to control recency decay rate

                                //Get Recency Score
                                const recencyScore = calculateRecencyScore(p.updated, lambda);

                                const alpha = 0.8;      // Weight for similarity
                                const beta = 0.2;       // Weight for recency

                                const finalScore = alpha * similarityScore + beta * recencyScore;

                                console.log("Final Score:", p.id, ":", p.title, finalScore);

                                // console.log(i.key, i.summary, similarityScore, recencyScore, finalScore);
                                filteredRelatedPages.push({ id: p.id, title: p.title, url: p.url, updated: p.updated, similarityScore: similarityScore, recencyScore: recencyScore, finalScore: finalScore, ranking: 0 });

                            }
                        });

                        await Promise.all(filteredRelatedPagePromises);

                        if (filteredRelatedPages.length > 0) {
                            //Calculate 75th Percentile
                            const value = calculate75thPercentile(filteredRelatedPages.map(i => i.finalScore));
                            console.log("75th Percentile:", value);

                            //Filter Pages based on 75th Percentile
                            filteredRelatedPages = filteredRelatedPages.filter(i => i.finalScore >= value);

                            //Sort Pages based on Final Score
                            filteredRelatedPages = filteredRelatedPages.sort((a, b) => b.finalScore - a.finalScore);

                            //Add Ranking
                            filteredRelatedPages.forEach(function (issue, index) {
                                issue.ranking = index + 1;
                            });

                            //Get Top 50 Pages
                            filteredRelatedPages = filteredRelatedPages.slice(0, 50);

                            // updateRelatedIssues(issueKey, filteredRelatedIssues);

                            updateRelatedPages(issueKey, filteredRelatedPages);

                            relatedPages = filteredRelatedPages;
                        }
                    }

                }
            }
        }
        else {
            relatedPages = await getRelatedPages(issueKey);

            const relatedPagesPromises = relatedPages.map(async (page) => {
                const issueDetails = await getPageDetails(page.id);

                if (issueDetails) {
                    page.title = issueDetails.title;
                    page.url = issueDetails.url;
                }
            });

            await Promise.all(relatedPagesPromises);

            await updateRelatedPages(issueKey, relatedPages);
        }
    }

    console.log("Related Pages:", relatedPages);

    return relatedPages;
}