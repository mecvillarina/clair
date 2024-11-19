import Resolver from '@forge/resolver';
import { getRecommendedRelatedIssues } from './recommenderService';

const resolver = new Resolver();

resolver.define('getText', (req) => {
  // console.log(req);

  return 'Hello, world1!';
});

resolver.define('getRecommendedRelatedIssues', async (req) => {
  // console.log(req);
  const issueKey = req.payload.extension.issue.key;
  // const projectKey = req.payload.extension.project.key;
  // const siteUrl = req.payload.siteUrl;

  console.log(req);
  const result = await getRecommendedRelatedIssues(issueKey, false);
  console.log(result);
  // return `123Issue Key: ${issueKey}, Project Key: ${projectKey}, Site URL: ${siteUrl}`;
  return result;
});

export const handler = resolver.getDefinitions();
