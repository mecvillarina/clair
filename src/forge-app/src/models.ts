export interface AppSettingsStorage {
    openAiApiKey: string
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