import { Queue } from "@forge/events";
import Resolver from "@forge/resolver";

export const relatedIssueJobQueue = new Queue({ key: 'relatedIssueJobQueue' });

const asyncResolver = new Resolver();

asyncResolver.define("related-issue-job-event-listener", async (queueItem) => {
    console.log("Received queue item", queueItem);
  });

  export const issueJobHandler = asyncResolver.getDefinitions();
