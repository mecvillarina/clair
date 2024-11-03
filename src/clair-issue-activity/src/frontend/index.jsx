import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, Heading, Box } from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
  const [data, setData] = useState(null);
  useEffect(() => {
    invoke('getText', { example: 'my-invoke-variable' }).then(setData);
  }, []);
  return (
    <>
      <Box
        padding='space.200'
        backgroundColor='color.background.accent.green.subtlest'>
          <Heading as="h4">Jira Issues</Heading>
      </Box>
      <Text>{data ? data : 'Loading...'}</Text>

      <Box
        padding='space.200'
        backgroundColor='color.background.accent.green.subtlest'>
          <Heading as="h4">Pages</Heading>
      </Box>
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
