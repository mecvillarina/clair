export interface AppSettingsStorage {
    openAiApiKey: string,
    resultRetention: "30 minutes" | "1 hour" | "3 hours" | "6 hours" | "12 hours" | "1 day"
}

export interface KeyElement {
    keyPhrases: string[],
    entities: string[],
    intent: string,
    fetchAt: string
}

export function buildDefaultSettings(): AppSettingsStorage {
    return {
        openAiApiKey: "",
        resultRetention: "1 hour"
    }
}

export interface IssueDetails {
    summary: string;
    description: string;
}

export interface RelatedIssueDetails extends IssueDetails {
    key: string,
    created: Date,
    updated: Date
}