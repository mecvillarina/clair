export interface AppSettingsStorage {
    openAiApiKey: string,
    resultRetention: "24 hours" | "7 days" | "14 days" | "30 days",
    openAiModel: "gpt-3.5-turbo-16k" | "gpt-4"
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
        resultRetention: "24 hours",
        openAiModel: "gpt-3.5-turbo-16k"
    }
}

export interface IssueDetails {
    key: string,
    summary: string,
    description: string,
    created: Date,
    updated: Date,
}

export interface RelatedIssueDetails {
    key: string,
    summary: string,
    created: Date,
    updated: Date,
    similarityScore: number,
    recencyScore: number,
    finalScore: number,
    ranking: number
}

export interface PageDetails {
    id: string,
    title: string,
    description: string,
    url: string,
    updated: Date
}

export interface RelatedPageDetails {
    id: string,
    title: string,
    url: string,
    updated: Date,
    similarityScore: number,
    recencyScore: number,
    finalScore: number,
    ranking: number
}

export interface InsightDetails {
    relatedIssues: RelatedIssueDetails[],
    relatedPages: RelatedPageDetails[]
}

export interface ClairNoteItem {
    contentKey: string,
    contentType: string,
    title: string,
    url: string
}