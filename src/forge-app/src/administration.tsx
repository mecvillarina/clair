import ForgeUI, { AdminPage, render, Text, TextField, Form, RadioGroup, Radio, useState, SectionMessage, Code, Strong } from '@forge/ui';
import { storage } from '@forge/api';
import { AppSettingsStorage } from './models';
import { APPSETTINGS_STORAGE_KEY } from './preference-keys';

const App = () => {
    const [formState, setFormState] = useState<AppSettingsStorage>(async () => storage.get(APPSETTINGS_STORAGE_KEY));
    const [saved, setSaved] = useState<boolean>(false);

    const onSubmit = async (formData: AppSettingsStorage) => {
        await storage.set(APPSETTINGS_STORAGE_KEY, formData)
        setFormState(formData);
        setSaved(true)
    };

    return (
        <AdminPage>
             {saved &&
                <SectionMessage title={"Saved"} appearance={"confirmation"}>
                    <Text>Setting are now saved</Text>
                </SectionMessage>}

            <Form onSubmit={onSubmit}>
                <TextField name='openAiApiKey' isRequired defaultValue={formState ? formState.openAiApiKey : ""} label='OpenAI API Key' placeholder='Enter OpenAI API Key'></TextField>
            </Form>
        </AdminPage>
    );
};

export const run = render(
    <App />
);