export interface SmsSentResponse {
    phone: string;
    otpLength: number;
    deliveryMethod: number;
}

export interface LoginSuccessResponse {
    apiToken: string;
    refreshToken: string;
    userId: string;
    createdAt: number;
}

export interface CaptchaChallenge {
    jwt: string;
    publicKey: string;
    blob: string;
}

export interface EmailRequiredChallenge {
    jwt: string;
    emailMasked: string;
    otpLength: number;
}
