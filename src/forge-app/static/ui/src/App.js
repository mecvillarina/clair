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
  const [relatedPages, setRelatedPages] = useState([]);
  const [isFetchingInsights, setIsFetchingInsights] = useState(true);

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
      getInsights(false);
    }
  }, [context]);

  const getInsights = (isForceFetching) => {
    setIsFetchingInsights(true);
    invoke('getInsights', { context, isForceFetching: isForceFetching }).then((data) => {
      setRelatedIssues(data.relatedIssues);
      setRelatedPages(data.relatedPages);
      setIsFetchingInsights(false);
    });
  };

  function navigateToIssue(issueKey) {
    router.open(`/browse/${issueKey}`);
  }

  function navigateToUrl(url){
    router.open(url);
  }

  const renderTitle = () => {
    return (
      <Inline alignBlock="center" spread="space-between">
        <Heading size="medium">CLAIR Insights</Heading>
        <Button appearance="subtle" isDisabled={isFetchingInsights} onClick={() => getInsights(true)}>Refresh</Button>
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
        rowsPerPage={50}
        defaultPage={1}
        isLoading={isFetchingInsights}
        loadingSpinnerSize="large"
      />
    );
  }

  const renderRelatedIssues = () => {
    return (
      <Stack space="space.050">
        {renderRelatedIssuesTitle()}
        {renderRelatedIssuesBody()}
      </Stack>
    );

  }

  
  const renderRelatedPagesTitle = () => {
    return (
      <Box paddingInline="space.150" paddingBlock="space.100" backgroundColor="color.background.accent.gray.subtle">
        <Heading size="small" color="color.text.inverse">Related Pages</Heading>
      </Box>
    );
  }

  const renderRelatedPagesBody = () => {
    const rows = relatedPages.map((page) => {
      return {
        cells: [
          {
            key: 'rank',
            content: <Text align='center'>{page.ranking}</Text>,
          },
          {
            key: 'title',
            content: 
            <Link onClick={() => navigateToUrl(page.url)}>
            {page.title}
		        </Link>
          },
          {
            key: 'score',
            content: <Text>{(page.finalScore * 100).toFixed(2)}%</Text>,
          },
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
          key: 'title',
          content: <Text>Title</Text>,
        },
        {
          key: 'score',
          content: <Text>Context Fit (%)</Text>,
        },
      ],
    };

    return (
      <DynamicTable
        head={head}
        rows={rows}
        rowsPerPage={50}
        defaultPage={1}
        isLoading={isFetchingInsights}
        loadingSpinnerSize="large"
      />
    );
  }

  const renderRelatedPages = () => {
    return (
      <Stack space="space.050">
        {renderRelatedPagesTitle()}
        {renderRelatedPagesBody()}
      </Stack>
    )
  }
  return (
    <div>
      <Stack space="space.200">
        {renderTitle()}
        {renderRelatedIssues()}
        {renderRelatedPages()}
      </Stack>
    </div>
  );
}

export default App;
