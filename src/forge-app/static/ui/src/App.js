import React, { useEffect, useState } from 'react';
import { invoke, view, router } from '@forge/bridge';
import Button, { LinkButton } from '@atlaskit/button/new';
import { Grid, Stack, Box, Text, Inline } from '@atlaskit/primitives';
import PageHeader from '@atlaskit/page-header';
import Spinner from '@atlaskit/spinner';
import Heading from '@atlaskit/heading';
import { render } from '@forge/ui';
import DynamicTable from '@atlaskit/dynamic-table';
import Link from '@atlaskit/link';

function App() {
  const [context, setContext] = useState(null);
  const [issue, setIssue] = useState(null);
  const [project, setProject] = useState(null);
  const [siteUrl, setSiteUrl] = useState(null);

  const [relatedIssues, setRelatedIssues] = useState([]);
  const [isFetchingResults, setIsFetchingResults] = useState(true);

  useEffect(() => {
    view.getContext().then((context) => {
      setContext(context);
      setIssue(context.extension.issue);
      setProject(context.extension.project);
      setSiteUrl(context.siteUrl);

      console.log(JSON.stringify(context));
    });
  }, []);

  useEffect(() => {
    if(context) {
      fetchResults(false);
    }
  }, [context]);

  const fetchResults = (isForce) => {
    setIsFetchingResults(true);
    invoke('getRecommendedRelatedIssues', { context, isForce: isForce }).then((data) => {
      setRelatedIssues(data);
      setIsFetchingResults(false);
    });
  };

  function navigateToIssue(issueKey) {
    router.open(`/browse/${issueKey}`);
  }

  const renderTitle = () => {
    return (
      <Inline alignBlock="center" spread="space-between">
        <Heading size="medium">CLAIR Insights</Heading>
        <Button appearance="subtle" isDisabled={isFetchingResults} onClick={() => fetchResults(true)}>Refresh</Button>
      </Inline>
    );
  }

  const renderRelatedIssuesTitle = () => {
    return (
      <Box paddingInline="space.150" paddingBlock="space.100" backgroundColor="color.background.accent.green.subtle">
        <Heading size="small" color="color.text.inverse">Related Issues</Heading>
      </Box>
    );
  }

  const renderRelatedIssuesBody = () => {

    const rows = relatedIssues.map((issue) => {
      return {
        cells: [
          {
            key: 'rank',
            content: <Text align='center'>{issue.ranking}</Text>,
          },
          {
            key: 'issue',
            content: 
            <Link onClick={() => navigateToIssue(issue.key)}>
            [{issue.key}]
		        </Link>
          },
          {
            key: 'summary',
            content: <Text>{issue.summary}</Text>,
          },
          {
            key: 'score',
            content: <Text>{(issue.finalScore * 100).toFixed(2)}%</Text>,
          },
          // {
          //   key: 'action',
          //   content: <LinkButton onClick={() => navigateToIssue(issue.key)}>View</LinkButton>
          // },
        ],
      };
    });

    const head = {
      cells: [
        {
          key: 'rank',
          content: <Text>Rank</Text>,
        },
        {
          key: 'issue',
          content: <Text>Issue</Text>,
        },
        {
          key: 'summary',
          content: <Text>Summary</Text>,
        },
        {
          key: 'score',
          content: <Text>Context Fit (%)</Text>,
        },
        // {
        //   key: 'action',
        //   content: <Text>Actions</Text>
        // },
      ],
    };

    return (
      <DynamicTable
        head={head}
        rows={rows}
        rowsPerPage={20}
        defaultPage={1}
        isLoading={isFetchingResults}
        loadingSpinnerSize="large"
      />
    );
  }

  const renderRelatedIssue = () => {
    return (
      <Stack space="space.050">
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
