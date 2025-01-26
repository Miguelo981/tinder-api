import type { Asset, Badge, CompanyOrTitle, CropInfo, Image } from '@/interfaces/shared.ts';

export interface TinderUserParams {
    username: string;
    locale?: string;
}

export interface TinderUserResponse {
    _id: string;
    badges: Badge[];
    bio: string;
    birth_date: string;
    birth_date_info: string;
    connection_count: number;
    common_connections: any[];
    interest_count: number;
    common_interests: any[];
    distance_mi: number;
    jobs: Array<{
        company: CompanyOrTitle;
        title: CompanyOrTitle;
    }>;
    name: string;
    photos: Array<{
        id: string;
        assets: Asset[];
        type: string;
        crop_info: CropInfo;
        url: string;
        processedFiles: Image[];
        fileName: string;
        extension: string;
        webp_qf: number[];
        phash: {
            version: string;
            value: number;
        };
        dhash: {
            version: string;
            value: number;
        };
    }>;
    ping_time: string;
    schools: null | any[];
    teaser: {
        string: string;
    };
    hide_age: boolean;
    hide_distance: boolean;
    status: number;
}
