export interface AppSettingsStorage {
    openAiApiKey: string
}

export interface KeyElement {
    keyPhrases: string[],
    entities: string[],
    intent: string,
    fetchAt: string
}

export function buildDefaultSettings(): AppSettingsStorage {
    return {
        openAiApiKey: ""
    }
}

export interface IssueDetails {
    summary: string;
    description: string;
}