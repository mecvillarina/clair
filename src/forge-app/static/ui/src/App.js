import React, { useEffect, useState } from 'react';
import { invoke, view } from '@forge/bridge';
import Button from '@atlaskit/button/new';
import { Grid, Stack, Box, Text } from '@atlaskit/primitives';
import PageHeader from '@atlaskit/page-header';
import Spinner from '@atlaskit/spinner';
import Heading from '@atlaskit/heading';
import { render } from '@forge/ui';

function App() {
  const [relatedIssues, setRelatedIssues] = useState(null);
  const [issue, setIssue] = useState(null);
  const [project, setProject] = useState(null);
  const [context, setContext] = useState(null);
  const [isFetchingResults, setIsFetchingResults] = useState(true);

  useEffect(() => {
    view.getContext().then((context) => {
      setContext(context);
      setIssue(context.extension.issue);
      setProject(context.extension.project);
    });
  }, []);

  useEffect(() => {
    invoke('getRecommendedRelatedIssues', context).then((data) => {
      setRelatedIssues(data);
      setIsFetchingResults(false);
    });
  }, [context]);

  const renderTitle = () => {
    return <Heading size="medium">CLAIR Recommendations</Heading>
  }

  const renderRelatedIssuesTitle = () => {
    return (
      <Box paddingInline='space.150' paddingBlock='space.100' backgroundColor="color.background.accent.green.subtle">
        <Heading size="small" color="color.text.inverse">Related Issues</Heading>
      </Box>
    );
  }

  const renderRelatedIssuesBody = () => {
    if (isFetchingResults) {
      return <Spinner interactionName="load" label="Loading" />
    }
    else {
      return (<Text weight="bold">{relatedIssues ? JSON.stringify(relatedIssues) : "Loading..."}</Text>)
    }
  }

  const renderRelatedIssue = () => {
    return (
      <Stack>
        {renderRelatedIssuesTitle()}
        {renderRelatedIssuesBody()}
      </Stack>
    );

  }
  return (
    <div>
      <Stack space="space.200">
        {renderTitle()}
        {renderRelatedIssue()}
      </Stack>
    </div>
  );
}

export default App;
