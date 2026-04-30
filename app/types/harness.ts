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

export type SocialPlatform = "instagram" | "youtube";

export type SocialPostInput = {
    platform: SocialPlatform;
    imageUrl?: string;
    postBrief?: string;
    videoUrl?: string;
    videoDetails?: string;
};

export type GeneratedSocialPost = {
    platform: SocialPlatform;
    content: string;
    hashtags: string[];
    title?: string;
    description?: string;
};

export type SocialPostResult = {
    success: boolean;
    data?: GeneratedSocialPost;
    text?: string;
    remainingCount?: number;
    limit?: number;
    isLimitReached?: boolean;
    isCreditUsed?: boolean;
    currentCredits?: number;
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
