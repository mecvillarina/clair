import ForgeUI, { render, useProductContext, useEffect, useState, IssuePanel, Text, Heading, Button, Table, Head, Cell, Row, Link } from '@forge/ui';
import { storage } from '@forge/api';
import { getNoteItems, removeNoteItem } from './services/noteService';

const App = () => {

    const context = useProductContext();
    const [issueKey, setIssueKey] = useState(null);
    const [noteItems, setNoteItems] = useState([]);
    const [isDeletingFromNotes, setIsDeletingFromNotes] = useState(false);

    useEffect(async () => {
        console.log(JSON.stringify(context, null, 4));
        const contextIssueKey = JSON.parse(JSON.stringify(context.platformContext)).issueKey;
        setIssueKey(contextIssueKey);
        await getNotes(contextIssueKey);
    }, [context]);

    const getNotes = async (contextIssueKey: string = null) => {

        if (!contextIssueKey && issueKey) {
            contextIssueKey = issueKey
        };

        var items = await getNoteItems(contextIssueKey);
        console.log("Notes:", items);
        console.log("Issue Key:", contextIssueKey);

        items = items.sort((a, b) => {
            var textA = a.contentType.toUpperCase();
            var textB = b.contentType.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        setNoteItems(items);
    };

    const removeItemFromNotes = async (item) => {
        setIsDeletingFromNotes(true);
        await removeNoteItem(issueKey, item);
        await getNotes();
        setIsDeletingFromNotes(false);
    };

    return (
        <IssuePanel>

            <Button text="Refresh" onClick={getNotes} disabled={isDeletingFromNotes} />

            <Table>
                <Head>
                    <Cell>
                        <Text>Summary/Title</Text>
                    </Cell>
                    <Cell>
                        <Text>Type</Text>
                    </Cell>

                    <Cell>
                        <Text>Action</Text>
                    </Cell>
                </Head>
                {noteItems.map(item => (
                    <Row>
                        <Cell>
                            <Text>
                                <Link openNewTab href={item.url}>{item.title}</Link>
                            </Text>
                        </Cell>
                        <Cell>
                            <Text>{item.contentType}</Text>
                        </Cell>
                        <Cell>
                            <Button disabled={isDeletingFromNotes} text="Remove" appearance="danger" onClick={async () => {
                                await removeItemFromNotes(item);
                            }} />
                        </Cell>
                    </Row>
                ))}
            </Table>
        </IssuePanel>
    );
}

export const run = render(<App />);
