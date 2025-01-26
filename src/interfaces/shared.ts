import type { RequestMethod } from '@/types.ts';

export interface Image {
    height: number;
    width: number;
    url: string;
    quality?: Quality;
}

export enum Quality {
    The1X = '1x',
    The2X = '2x',
    The3X = '3x',
}

export interface Asset {
    url: string;
    asset_type: Type;
    width: number;
    height: number;
    enhancements: Enhancement[];
}

export enum Type {
    Image = 'image',
}

export enum Enhancement {
    Blurred = 'blurred',
}

export interface Badge {
    type: BadgeType;
}

export enum BadgeType {
    IDDobNotVerified = 'id_dob_not_verified',
    SelfieNotVerified = 'selfie_not_verified',
    Unlimited = 'UNLIMITED',
}

export interface Spotify {
    spotify_connected: boolean;
    spotify_top_artists: SpotifyTopArtist[];
    spotify_theme_track?: Track;
}

export interface Track {
    id: string;
    name: string;
    album: Album;
    artists: AllInGender[];
    preview_url: string;
    uri: string;
}

export interface Album {
    id: string;
    name: string;
    images: Image[];
}

export interface SpotifyTopArtist {
    id: string;
    name: string;
    top_track: Track;
    selected: boolean;
    images: any[];
}

export interface User {
    _id: string;
    badges: Badge[];
    bio: string;
    birth_date: Date;
    name: string;
    photos: Photo[];
    gender: -1 | 0 | 1;
    jobs: Job[];
    schools: School[];
    city?: City;
    show_gender_on_profile?: boolean;
    online_now?: boolean;
    selected_descriptors?: SelectedDescriptor[];
    is_traveling?: boolean;
    sparks_quizzes?: SparksQuizz[];
    relationship_intent?: RelationshipIntent;
    user_prompts?: UserPrompts;
    bumper_sticker_enabled?: boolean;
    sexual_orientations?: AllInGender[];
    all_in_gender?: AllInGender[];
    custom_gender?: string;
    hide_age?: boolean;
    hide_distance?: boolean;
}

export interface AllInGender {
    id?: string;
    name: string;
}

export interface City {
    name: string;
    region?: string;
}

export interface CompanyOrTitle {
    name: string;
    displayed?: boolean;
}

export type School = CompanyOrTitle;

export interface Job {
    company?: CompanyOrTitle;
    title: CompanyOrTitle;
}

export interface Photo {
    id: string;
    crop_info: CropInfo;
    url: string;
    processedFiles: Image[];
    fileName?: string;
    extension: Extension;
    assets: Asset[];
    media_type: Type;
}

export interface CropInfo {
    user?: Algo;
    algo?: Algo;
    processed_by_bullseye: boolean;
    user_customized: boolean;
    faces?: Face[];
}

export interface Algo {
    width_pct: number;
    x_offset_pct: number;
    height_pct: number;
    y_offset_pct: number;
}

export interface Face {
    algo: Algo;
    bounding_box_percentage: number;
}

export enum Extension {
    Jpg = 'jpg',
    JpgWebp = 'jpg,webp',
}

export interface SelectedDescriptor {
    id: string;
    name?: string;
    prompt?: string;
    type: SelectedDescriptorType;
    icon_url: string;
    icon_urls: Image[];
    choice_selections?: ChoiceSelection[];
    section_id: SectionID;
    section_name: SectionName;
    measurable_selection?: MeasurableSelection;
}

export interface ChoiceSelection {
    id: string;
    name: string;
    match_group_key?: string;
}

export interface MeasurableSelection {
    value: number;
    min: number;
    max: number;
    unit_of_measure: UnitOfMeasure;
}

export enum UnitOfMeasure {
    CM = 'cm',
}

export enum SectionID {
    SEC1 = 'sec_1',
    SEC2 = 'sec_2',
    SEC3 = 'sec_3',
    SEC4 = 'sec_4',
    SEC5 = 'sec_5',
    SEC6 = 'sec_6',
}

export enum SectionName {
    Basics = 'Basics',
    Height = 'Height',
    LanguagesIKnow = 'Languages I Know',
    Lifestyle = 'Lifestyle',
    Pronouns = 'Pronouns',
    RelationshipType = 'Relationship Type',
}

export enum SelectedDescriptorType {
    Measurement = 'measurement',
    MultiSelectionSet = 'multi_selection_set',
    SingleSelectionSet = 'single_selection_set',
}

export interface SparksQuizz {
    quizzes: Quiz[];
    section_id: string;
    section_name: string;
    similarity_score: SimilarityScore;
    locked_button_text: string;
}

export interface Quiz {
    id: QuizID;
    name: string;
    answers: string[];
    answer_details: AnswerDetail[];
    image_url: string;
    locked_image_url: string;
    similarity_score: SimilarityScore;
}

export interface AnswerDetail {
    emoji: string;
    prompt_text: string;
    answer_id: string;
    answer_text: string;
}

export enum QuizID {
    Qz1 = 'qz_1',
    Qz2 = 'qz_2',
    Qz3 = 'qz_3',
}

export interface SimilarityScore {
    text: string;
    style: SimilarityScoreStyle;
    image_url: string;
    title_text: string;
    prompt_text: string;
    you_prefer_text: string;
    they_prefer_text: string;
}

export enum SimilarityScoreStyle {
    Blue = 'blue',
    Pink = 'pink',
    Yellow = 'yellow',
}

export interface RelationshipIntent {
    descriptor_choice_id: string;
    emoji: string;
    image_url: string;
    title_text: string;
    body_text: string;
    style: string;
    hidden_intent: HiddenIntent;
    tapped_action: RelationshipIntentTappedAction;
}

export interface HiddenIntent {
    emoji: string;
    image_url: string;
    title_text: string;
    body_text: string;
}

export interface RelationshipIntentTappedAction {
    method: RequestMethod;
    url: string;
    query_params: PurpleQueryParams;
}

export interface PurpleQueryParams {
    component_id: string;
}

export interface UserPrompts {
    section_name: string;
    prompts: UserPromptsPrompt[];
    add_prompt: AddPrompt;
}

export interface AddPrompt {
    text: string;
    tapped_action: AddPromptTappedAction;
}

export interface AddPromptTappedAction {
    method: RequestMethod;
    url: string;
    query_params: FluffyQueryParams;
}

export interface FluffyQueryParams {
    component_id: string;
    type: string;
}

export interface UserPromptsPrompt {
    id: string;
    question_text: string;
    answer_id: string;
    answer_text: string;
    image_url: string;
}
