export type GenerateResult = {
    success: boolean;
    data?: {
        danggeun: string;
        joonggonara: string;
        bungae: string;
        seo_tags: string[];
    };
    text?: string;
    remainingCount?: number;
    limit?: number;
    isLimitReached?: boolean;
    isCreditUsed?: boolean;
    currentCredits?: number;
};

export type GeneratedCopy = {
    danggeun: string;
    joonggonara: string;
    bungae: string;
    seo_tags: string[];
};

export interface AgentContext {
    apiKey: string;
    userEmail: string | null;
}

export interface GeneratorParams {
    birthYear: number;
    gender: string;
    itemName: string;
    itemDetails: string;
    imageUrl?: string;
}
