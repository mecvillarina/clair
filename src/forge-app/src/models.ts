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

export interface IssueFetchDetails {
    key: string,
    updatedAt: number,
}

export function buildDefaultSettings(): AppSettingsStorage {
    return {
        openAiApiKey: "",
        resultRetention: "1 hour"
    }
}

export interface IssueDetails {
    key: string,
    summary: string;
    description: string;
}

export interface RelatedIssueDetails extends IssueDetails {
    created: Date,
    updated: Date,
    similarityScore: number,
    recencyScore: number,
    finalScore: number
}