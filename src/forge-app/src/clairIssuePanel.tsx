import ForgeUI, { useProductContext, useEffect, useState, IssuePanel, Text, render } from '@forge/ui';
import { storage } from '@forge/api';

const App = () => {

    const context = useProductContext();
    const [issueKey, setIssueKey] = useState(null);

    useEffect(() => {
        console.log(JSON.stringify(context, null, 4));
        setIssueKey(JSON.parse(JSON.stringify(context.platformContext)).issueKey);
        console.log(issueKey);
    }, [context]);
    return (
        <IssuePanel>
            <Text>Hello world! {issueKey}</Text>

        </IssuePanel>
    );
}

export const run = render(<App />);
