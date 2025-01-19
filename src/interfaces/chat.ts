import type { Locale, Meta } from "@/types.ts";

export interface TinderSendMessageParams {
    locale?: Locale
    matchId: string
    message: string
}

export interface TinderSendMessaResponse {
    _id:          string;
    from:         string;
    to:           string;
    match_id:     string;
    sent_date:    Date;
    message:      string;
    media:        Media;
    created_date: Date;
}

export interface Media {
    width:  null;
    height: null;
}

export interface TinderChatMessagesParams {
    locale?: Locale
    count?: number
    matchId: string
}

export interface TinderChatMessagesResponse {
    meta: Meta;
    data: {
        messages: TinderMessage[]
    }
}

export interface TinderMessage {
    _id:          string;
    match_id:     string;
    sent_date:    Date;
    message:      string;
    to:           string;
    from:         string;
    created_date: Date;
    timestamp:    number;
    matchId:      string;
    is_liked?:    boolean;
}