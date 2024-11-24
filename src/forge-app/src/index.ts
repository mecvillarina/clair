import Resolver from '@forge/resolver';
import { fetchRelatedIssues, fetchRelatedPages, getIssueKeyElement, isIssueDetailsAvailable, updateInsightFetchDetails } from './insightService';
import { relatedIssueJobQueue } from './relatedIssueQueueEvents';
import { InsightDetails, RelatedIssueDetails, RelatedPageDetails } from './models';
import { getIssueDetails } from './services/jiraService';
import { addNoteItem } from './services/noteService';

const resolver = new Resolver();

resolver.define('getInsights', async (req) => {
  let insightDetails: InsightDetails = { relatedIssues: [], relatedPages: [] };

  if (req.payload.context) {
    const extension = req.payload.context.extension;
    const issueKey = extension.issue.key;

    const isForceFetching = req.payload.isForceFetching;
    const isDataAvailable = await isIssueDetailsAvailable(issueKey);
    const isFetch = isForceFetching || !isDataAvailable;

    const issueDetails = await getIssueDetails(issueKey);
    const keyElement = await getIssueKeyElement(issueDetails, isFetch);

    await Promise.all<unknown>(
      [
        fetchRelatedIssues(issueDetails, keyElement, isFetch), 
        fetchRelatedPages(issueDetails, keyElement, isFetch)]
      )
      .then(results => {
        insightDetails.relatedIssues = results[0] as RelatedIssueDetails[];
        insightDetails.relatedPages = results[1] as RelatedPageDetails[];
    });

    // const relatedIssues = await fetchRelatedIssues(issueDetails, keyElement, isFetch);
    // insightDetails.relatedIssues = relatedIssues;

    // const relatedPages = await fetchRelatedPages(issueDetails, keyElement, isFetch);
    // insightDetails.relatedPages = relatedPages;

    if (isFetch && (insightDetails.relatedIssues.length > 0 || insightDetails.relatedPages.length > 0)) {
      updateInsightFetchDetails(issueKey);
    }
  }

  return insightDetails;
});

resolver.define('addRelatedIssueToNotes', async (req) => {
    if(req.payload.context && req.payload.relatedIssue && req.payload.siteUrl) {

      const extension = req.payload.context.extension;
      const issueKey = extension.issue.key;
      const relatedIssue = req.payload.relatedIssue;
      const siteUrl = req.payload.siteUrl;

      console.log(`Adding related issue ${relatedIssue.key} to notes`);

      return await addNoteItem(issueKey, { contentKey: relatedIssue.key, contentType: 'Issue', title: `[${relatedIssue.key}]`.concat(" ", relatedIssue.summary), url: `${siteUrl}/browse/${relatedIssue.key}` });
    }
});

resolver.define('addRelatedPageToNotes', async (req) => {
  if(req.payload.context && req.payload.relatedPage) {

    const extension = req.payload.context.extension;
    const issueKey = extension.issue.key;
    const relatedPage = req.payload.relatedPage;

    console.log(`Adding related page ${relatedPage.id} to notes`);

    return await addNoteItem(issueKey, { contentKey: relatedPage.id, contentType: 'Page', title: relatedPage.title, url: relatedPage.url });
  }
});

resolver.define('queueItem', async (req) => {
  relatedIssueJobQueue.push({ key: '1234', value: req.payload });
});

export const handler = resolver.getDefinitions();
