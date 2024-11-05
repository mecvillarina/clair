import api, { storage, fetch, route } from "@forge/api";
import { AppSettingsStorage, buildDefaultSettings, KeyElements } from "../models";
import { APPSETTINGS_STORAGE_KEY } from "../preference-keys";

export async function getKeyElements(prompt): Promise<KeyElements> {
    const appSettings: AppSettingsStorage = await storage.get(APPSETTINGS_STORAGE_KEY) ?? buildDefaultSettings();

    if (appSettings.openAiApiKey) {
        const apiKey = appSettings.openAiApiKey;
        const url = "https://api.openai.com/v1/chat/completions";

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        };

        const body = JSON.stringify({
            model: "gpt-3.5-turbo-16k",  // Or gpt-4
            messages: [
                { role: "user", content: `Extract key phrases, entities, and intent from the following text:\n"${prompt}"` }
            ],
            functions: [
                {
                    name: "extract_elements",
                    description: "Extracts key phrases, entities, and intent from text.",
                    parameters: {
                        type: "object",
                        properties: {
                            key_phrases: { type: "array", items: { type: "string" } },
                            entities: { type: "array", items: { type: "string" } },
                            intent: { type: "string" }
                        },
                        required: ["key_phrases", "entities", "intent"]
                    }
                }
            ],
            function_call: { "name": "extract_elements" }
        });

        // console.log(body);

        try {
            // Make the request using fetch
            const response = await fetch(url, {
                method: "POST",
                headers: headers,
                body: body
            });

            // Parse and process the response
            const data = await response.json();

            // console.log(data);
            if (data.choices && data.choices[0].message.function_call) {
                const result = JSON.parse(data.choices[0].message.function_call.arguments);
                // console.log("Extracted Elements:", result);
                return { keyPhrases: result.key_phrases, entities: result.entities, intent: result.intent }
            } else {
                console.log("No structured response found.");
            }

        } catch (error) {
            console.error("Error fetching from OpenAI API:", error);
        }
    }
    else {
        console.log("OpenAI Api Key Not Found");
    }


    return { keyPhrases: [], entities: [], intent: "" };
}