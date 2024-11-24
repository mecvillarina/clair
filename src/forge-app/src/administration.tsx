import ForgeUI, { AdminPage, render, Text, TextField, Form, RadioGroup, Radio, useState, SectionMessage, Heading } from '@forge/ui';
import { storage } from '@forge/api';
import { AppSettingsStorage } from './models';
import { APPSETTINGS_STORAGE_KEY } from './preferenceKeys';

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
                <Heading size='medium'>OpenAI Configuration</Heading>

                <TextField name='openAiApiKey' isRequired defaultValue={formState ? formState.openAiApiKey : ""} label='OpenAI API Key' placeholder='Enter OpenAI API Key'></TextField>
            
                <RadioGroup name="openAiModel" label="OpenAI Model">
                    <Radio defaultChecked={formState ? formState.openAiModel === "gpt-3.5-turbo-16k" : true} label="GPT-3.5 Turbo" value="gpt-3.5-turbo-16k" />
                    <Radio defaultChecked={formState?.openAiModel === "gpt-4"} label="GPT-4" value="gpt-4" />
                </RadioGroup>

                <Heading size='medium'>CLAIR Insight Configuration</Heading>

                <RadioGroup name="resultRetention" label="CLAIR Insight Result Retention">
                    <Radio defaultChecked={formState ? formState.resultRetention === "24 hours" : true} label="24 hours" value="24 hours" />
                    <Radio defaultChecked={formState?.resultRetention === "7 days"} label="7 days" value="7 days" />
                    <Radio defaultChecked={formState?.resultRetention === "14 days"} label="14 days" value="14 days" />
                    <Radio defaultChecked={formState?.resultRetention === "30 days"} label="30 days" value="30 days" />
                </RadioGroup>
            </Form>
        </AdminPage>
    );
};

export const run = render(
    <App />
);