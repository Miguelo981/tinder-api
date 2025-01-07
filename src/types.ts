export type RequestMethod = 'GET' | 'POST';
export type Endpoint = `/${string}`

export type Locale = 'es-ES' | 'en-US' | 'fr-FR' | 'pt-BR' | 'de-DE' | 'it-IT' | 'ja-JP' | 'ko-KR' | 'zh-CN' | 'zh-TW' | 'ru-RU' | 'pl-PL' | 'tr-TR'

export type TinderResponse<T> = { data: T, response: Response }

export interface ConfigurationOptions {
    headers?: Headers | Record<string, string>;
    defaultLocale: Locale
}

export interface ConfigurationParameters {
    xAuthToken: string
    baseOptions?: ConfigurationOptions
}

export type RequestParams = GetRquestParams | PostRquestParams

export type GetRquestParams = {
    method: 'GET',
    params?: URLSearchParams
    endpoint: Endpoint
} 

export type PostRquestParams = {
    method: 'POST',
    data: any
    params?: URLSearchParams
    endpoint: Endpoint
} 

export interface Meta {
    status: number;
}