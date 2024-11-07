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
            
                <RadioGroup name="resultRetention" label="Result Retention">
                    <Radio defaultChecked={formState ? formState.resultRetention === "30 minutes" : true} label="30 minutes" value="30 minutes" />
                    <Radio defaultChecked={formState?.resultRetention === "1 hour"} label="1 hour" value="1 hour" />
                    <Radio defaultChecked={formState?.resultRetention === "3 hours"} label="3 hours" value="3 hours" />
                    <Radio defaultChecked={formState?.resultRetention === "6 hours"} label="6 hours" value="6 hours" />
                    <Radio defaultChecked={formState?.resultRetention === "12 hours"} label="12 hours" value="12 hours" />
                    <Radio defaultChecked={formState?.resultRetention === "1 day"} label="1 day" value="1 day" />
                </RadioGroup>
            </Form>
        </AdminPage>
    );
};

export const run = render(
    <App />
);