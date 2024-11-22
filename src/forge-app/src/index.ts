import Resolver from '@forge/resolver';
import { getRecommendedRelatedIssues } from './recommenderService';
import { relatedIssueJobQueue } from './relatedIssueQueueEvents';

const resolver = new Resolver();

resolver.define('getText', (req) => {
  // console.log(req);

  return 'Hello, world1!';
});

resolver.define('getRecommendedRelatedIssues', async (req) => {

  if(req.payload.extension) {
    console.log(req.payload.extension);
    const issueKey = req.payload.extension.issue.key;
    const projectKey = req.payload.extension.project.key;
    const siteUrl = req.payload.siteUrl;

    const result = await getRecommendedRelatedIssues(issueKey, false);
    console.log(result);

    return result;
  }

  // const projectKey = req.payload.extension.project.key;
  // const siteUrl = req.payload.siteUrl;

  // console.log(req);
  // const result = await getRecommendedRelatedIssues(issueKey, false);
  // console.log(result);
  // return `123Issue Key: ${issueKey}, Project Key: ${projectKey}, Site URL: ${siteUrl}`;
  // return 'hello world';
});

resolver.define('queueItem', async (req) => {
  relatedIssueJobQueue.push({ key: '1234', value: req.payload });
});

export const handler = resolver.getDefinitions();
