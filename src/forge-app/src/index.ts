import Resolver from '@forge/resolver';
import { getRecommendedRelatedIssues } from './recommenderService';
import { relatedIssueJobQueue } from './relatedIssueQueueEvents';
import { RelatedIssueDetails } from './models';

const resolver = new Resolver();

resolver.define('getText', (req) => {
  // console.log(req);

  return 'Hello, world1!';
});

resolver.define('getRecommendedRelatedIssues', async (req) => {
  let result: RelatedIssueDetails[] = [];

  if (req.payload.context) {
    // console.log(JSON.stringify(req));
    const extension = req.payload.context.extension;
    const issueKey = extension.issue.key;
    const projectKey = extension.project.key;
    const siteUrl = extension.siteUrl;

    console.log("SiteUrl:", siteUrl);

    result = await getRecommendedRelatedIssues(issueKey, req.payload.isForce);
    console.log(result);
  }

  return result;
});

// resolver.define('getContextExtension', async (req) => {

//   if(req.payload)
//   return req.context.extension;
// });

resolver.define('queueItem', async (req) => {
  relatedIssueJobQueue.push({ key: '1234', value: req.payload });
});

export const handler = resolver.getDefinitions();
