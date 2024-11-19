import React, { useEffect, useState } from 'react';
import { invoke, view} from '@forge/bridge';
// import Button from '@atlaskit/button';

function App() {
  const [relatedIssues, setRelatedIssues] = useState(null);
  const [issue, setIssue] = useState(null);
  const [project, setProject] = useState(null);
  const [context, setContext] = useState(null);

  useEffect(() => {
    view.getContext().then(setContext);

    // invoke('getText', { example: 'my-invoke-variable' }).then(setData);
    // invoke('getTested', {}).then(setData);
    // invoke('getTested', {}).then(setData);

    // view.getContext().then((context) => { invoke('getTested', context).then(setData); });
    // view.getContext().then((context) => {
    //   setContext(context);
    //   setIssue(context.extension.issue);
    //   setProject(context.extension.project);
    // });

  }, []);

  useEffect(() => {
    invoke('getRecommendedRelatedIssues', context).then(setRelatedIssues);
  }, [context]);

  return (
    <div>
      {relatedIssues ? JSON.stringify(relatedIssues) : 'Loading...'}<br/>
      {/* <Button>Hello world</Button> */}
      {/* {context ? JSON.stringify(context) : 'Loading...'} <br/> */}
      {/* {project ? JSON.stringify(issue) : 'Loading...'}<br/> */}
    </div>
  );
}

export default App;
