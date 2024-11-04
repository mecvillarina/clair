import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, Heading, Box, useProductContext } from '@forge/react';
import { invoke, requestJira } from '@forge/bridge';

const App = () => {
  const context = useProductContext();

  const [data, setData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [description, setDescription] = useState(null);
  // useEffect(() => {
  //   invoke('getText', { example: 'my-invoke-variable' }).then(setData);
  // }, []);

  useEffect(() => {
    if(context) {
      const issueId = context.extension.issue.id;

      fetchIssueDetails(issueId).then(issueDetails => {
        setData(issueDetails);
        setSummary(issueDetails.summary);
        setDescription(issueDetails.descripton);
      });
    }
  },[context]);

  return (
    <>
      <Box
        padding='space.200'
        backgroundColor='color.background.accent.green.subtlest'>
          <Heading as="h4">Jira Issues</Heading>
      </Box>
      <Text>{summary ? summary : 'Loading Summary...'}</Text>
      <Text>{description ? description : 'Loading Description...'}</Text>

      <Box
        padding='space.200'
        backgroundColor='color.background.accent.green.subtlest'>
          <Heading as="h4">Pages</Heading>
      </Box>
    </>
  );
};

const fetchIssueDetails = async(issueIdOrKey) => {
  const res = await requestJira(`/rest/api/3/issue/${issueIdOrKey}?fields=summary,description`);
  const data = await res.json();
  console.log(data.fields.summary);
  console.log(findAllValuesByKey(data, "text"));
  return { summary: data.fields.summary, descripton: findAllValuesByKey(data, "text").join(" ") };
}

const findAllValuesByKey = (obj, key) => {
  let values = [];

  function recursiveSearch(obj) {
    if (obj.hasOwnProperty(key)) {
      values.push(obj[key]);
    }

    for (let k in obj) {
      if (typeof obj[k] === "object" && obj[k] !== null) {
        recursiveSearch(obj[k]);
      }
    }
  }

  recursiveSearch(obj);
  return values;
}

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
