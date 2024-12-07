import React, { useEffect, useState } from 'react';
import { invoke, view, router, showFlag } from '@forge/bridge';
import Button, { IconButton } from '@atlaskit/button/new';
import { Stack, Box, Text, Inline } from '@atlaskit/primitives';
import Heading from '@atlaskit/heading';
import DynamicTable from '@atlaskit/dynamic-table';
import Link from '@atlaskit/link';
import AddIcon from '@atlaskit/icon/glyph/add';
import { token } from '@atlaskit/tokens';

function App() {
  const [context, setContext] = useState(null);
  const [issue, setIssue] = useState(null);
  const [project, setProject] = useState(null);
  const [siteUrl, setSiteUrl] = useState(null);

  const [relatedIssues, setRelatedIssues] = useState([]);
  const [relatedPages, setRelatedPages] = useState([]);
  const [isFetchingInsights, setIsFetchingInsights] = useState(true);
  const [isAddingToNotes, setIsAddingToNotes] = useState(false);

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
    if (context) {
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

  const addRelatedIssueToNotes = (relatedIssue) => {
    setIsAddingToNotes(true);
    invoke('addRelatedIssueToNotes', { context, relatedIssue, siteUrl }).then(data => {
      const flag = showFlag({
        id: 'related-issue-added',
        title: data ? 'Issue Added to CLAIR Notes' : 'Issue Already in CLAIR Notes',
        type: data ? 'success' : 'error',
        description: data ? 'Selected issue has been added to CLAIR Notes for easy access.' : 'The issue already saved in the CLAIR Notes. If needed, you can refresh the panel using the Refresh button.',
        actions: [],
        isAutoDismiss: true,
      });
      setIsAddingToNotes(false);
    });
  };

  const addRelatedPageToNotes = (relatedPage) => {
    setIsAddingToNotes(true);
    invoke('addRelatedPageToNotes', { context, relatedPage }).then(data => {
      const flag = showFlag({
        id: 'related-page-added',
        title: data ? 'Page Added to CLAIR Notes' : 'Page Already in CLAIR Notes',
        type: data ? 'success' : 'error',
        description: data ? 'Selected page has been added to CLAIR Notes for easy access.' : 'The page already saved in the CLAIR Notes. If needed, you can refresh the panel using the Refresh button.',
        actions: [],
        isAutoDismiss: true
      });

      setIsAddingToNotes(false);
    });
  };

  function navigateToIssue(issueKey) {
    router.open(`/browse/${issueKey}`);
  }

  function navigateToUrl(url) {
    router.open(url);
  }

  const renderTitle = () => {
    return (
      <Inline alignBlock="center" spread="space-between">
        <Heading size="medium">CLAIR Insights</Heading>
        <Button appearance="subtle" isDisabled={isFetchingInsights || isAddingToNotes} onClick={() => getInsights(true)}>Refresh</Button>
      </Inline>
    );
  }

  const renderRelatedIssuesTitle = () => {
    return (
      <Box paddingInline="space.150" paddingBlock="space.100" backgroundColor="color.background.accent.green.subtle">
        <Heading size="small" color="color.text.inverse">Relevant Issues</Heading>
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
          {
            key: 'action',
            content: <IconButton
              isDisabled={isAddingToNotes}
              onClick={() => addRelatedIssueToNotes(issue)}
              label="Add to Notes"
              icon={(iconProps) => (
                <AddIcon
                  {...iconProps}
                  size="small"
                  primaryColor={token('color.icon.accent.green')}
                />
              )} />
          }
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
        {
          key: 'action',
          content: <Text>Action</Text>,
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
        emptyView={<Text>We couldn't identify any related issues for this item.</Text>}
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
        <Heading size="small" color="color.text.inverse">Relevant Pages</Heading>
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
          {
            key: 'action',
            content: <IconButton
              isDisabled={isAddingToNotes}
              onClick={() => addRelatedPageToNotes(page)}
              label="Add to Notes"
              icon={(iconProps) => (
                <AddIcon
                  {...iconProps}
                  size="small"
                  primaryColor={token('color.icon.accent.green')}
                />
              )} />
          }
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
        {
          key: 'action',
          content: <Text>Action</Text>,
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
        emptyView={<Text>We couldn't find any related pages for this issue at the moment.</Text>}
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
