import Resolver from '@forge/resolver';
import { fetchRelatedIssues, fetchRelatedPages, getIssueKeyElement, isIssueDetailsAvailable, updateInsightFetchDetails } from './insightService';
import { relatedIssueJobQueue } from './relatedIssueQueueEvents';
import { InsightDetails, RelatedIssueDetails, RelatedPageDetails } from './models';
import { getIssueDetails } from './services/jiraService';

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

resolver.define('queueItem', async (req) => {
  relatedIssueJobQueue.push({ key: '1234', value: req.payload });
});

export const handler = resolver.getDefinitions();
