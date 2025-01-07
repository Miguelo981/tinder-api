import type { Locale, RequestMethod, Meta } from "@/types.ts";

export interface TinderSearchParams {
    locale?: Locale
}

export interface TinderSearchResponse {
    meta: Meta;
    data: TinderSearchData;
}

export interface TinderSearchData {
    results: TinderProfile[];
}

export interface TinderProfile {
    type:                   ResultType;
    user:                   User;
    facebook:               Facebook;
    spotify:                Spotify;
    distance_mi:            number;
    content_hash:           string;
    s_number:               number;
    teaser:                 ResultTeaser;
    teasers:                ResultTeaser[];
    experiment_info?:       ExperimentInfo;
    is_superlike_upsell:    boolean;
    live_ops?:              LiveOps;
    tappy_content:          TappyContent[];
    profile_detail_content: ProfileDetailContent[];
    ui_configuration:       UIConfiguration;
    user_posts:             any[];
    mutuals?:               Mutuals;
}

export interface ExperimentInfo {
    user_interests: UserInterests;
}

export interface UserInterests {
    selected_interests: SelectedInterest[];
}

export interface SelectedInterest {
    id:        string;
    name:      string;
    is_common: boolean;
}

export interface Facebook {
    common_connections: any[];
    connection_count:   number;
    common_interests:   any[];
}

export interface LiveOps {
    template_name: string;
    teaser:        LiveOpsTeaser;
    vibes:         Vibe[];
}

export interface LiveOpsTeaser {
    type:        string;
    string:      string;
    sub_string:  string;
    response_id: string;
}

export interface Vibe {
    round:   number;
    prompts: VibePrompt[];
}

export interface VibePrompt {
    is_mutual:   boolean;
    prompt:      string;
    response:    string;
    response_id: string;
}

export interface Mutuals {
    mutuals_count:   number;
    user_opt_in:     boolean;
    rec_opt_in:      boolean;
    mutuals:         any[];
    mystery_mutuals: MysteryMutuals;
}

export interface MysteryMutuals {
    count: number;
}

export interface ProfileDetailContent {
    content:         any[];
    page_content_id: string;
}

export interface Spotify {
    spotify_connected:    boolean;
    spotify_top_artists:  SpotifyTopArtist[];
    spotify_theme_track?: Track;
}

export interface Track {
    id:          string;
    name:        string;
    album:       Album;
    artists:     AllInGender[];
    preview_url: string;
    uri:         string;
}

export interface Album {
    id:     string;
    name:   string;
    images: Image[];
}

export interface Image {
    height:   number;
    width:    number;
    url:      string;
    quality?: Quality;
}

export enum Quality {
    The1X = "1x",
    The2X = "2x",
    The3X = "3x",
}

export interface AllInGender {
    id?:  string;
    name: string;
}

export interface SpotifyTopArtist {
    id:        string;
    name:      string;
    top_track: Track;
    selected:  boolean;
    images:    any[];
}

export interface TappyContent {
    content: Content[];
}

export interface Content {
    id:    LocalAssetEnum;
    type?: string;
}

export enum LocalAssetEnum {
    Anthem = "anthem",
    Bio = "bio",
    City = "city",
    Descriptors = "descriptors",
    Distance = "distance",
    Job = "job",
    LiveOps = "live_ops",
    Passions = "passions",
    School = "school",
    TopArtists = "top_artists",
}

export interface ResultTeaser {
    string: string;
    type?:  TeaserType;
}

export enum TeaserType {
    Job = "job",
    JobPosition = "jobPosition",
    School = "school",
}

export enum ResultType {
    User = "user",
}

export interface UIConfiguration {
    id_to_component_map: IDToComponentMap;
}

export interface IDToComponentMap {
    distance: Distance;
}

export interface Distance {
    text_v1: TextV1;
}

export interface TextV1 {
    content: string;
    icon:    Icon;
    style:   TextV1Style;
}

export interface Icon {
    local_asset: LocalAssetEnum;
}

export enum TextV1Style {
    IdentityV1 = "identity_v1",
}

export interface User {
    _id:                     string;
    badges:                  Badge[];
    bio:                     string;
    birth_date:              Date;
    name:                    string;
    photos:                  Photo[];
    gender:                  -1 | 0 | 1;
    jobs:                    Job[];
    schools:                 AllInGender[];
    city?:                   City;
    show_gender_on_profile?: boolean;
    online_now?:             boolean;
    selected_descriptors?:   SelectedDescriptor[];
    is_traveling?:           boolean;
    sparks_quizzes?:         SparksQuizz[];
    relationship_intent?:    RelationshipIntent;
    user_prompts?:           UserPrompts;
    bumper_sticker_enabled?: boolean;
    sexual_orientations?:    AllInGender[];
    all_in_gender?:          AllInGender[];
    custom_gender?:          string;
    hide_age?:               boolean;
    hide_distance?:          boolean;
}

export interface Badge {
    type: BadgeType;
}

export enum BadgeType {
    IDDobNotVerified = "id_dob_not_verified",
    SelfieNotVerified = "selfie_not_verified",
    Unlimited = "UNLIMITED",
}

export interface City {
    name: string;
}

export interface Job {
    company?: City;
    title:    City;
}

export interface Photo {
    id:              string;
    crop_info:       CropInfo;
    url:             string;
    processedFiles:  Image[];
    processedVideos: any[];
    fileName?:       string;
    extension:       Extension;
    assets:          Asset[];
    media_type:      Type;
}

export interface Asset {
    url:          string;
    asset_type:   Type;
    width:        number;
    height:       number;
    enhancements: Enhancement[];
}

export enum Type {
    Image = "image",
}

export enum Enhancement {
    Blurred = "blurred",
}

export interface CropInfo {
    user?:                 Algo;
    algo?:                 Algo;
    processed_by_bullseye: boolean;
    user_customized:       boolean;
    faces?:                Face[];
}

export interface Algo {
    width_pct:    number;
    x_offset_pct: number;
    height_pct:   number;
    y_offset_pct: number;
}

export interface Face {
    algo:                    Algo;
    bounding_box_percentage: number;
}

export enum Extension {
    Jpg = "jpg",
    JpgWebp = "jpg,webp",
}

export interface RelationshipIntent {
    descriptor_choice_id: string;
    emoji:                string;
    image_url:            string;
    title_text:           string;
    body_text:            string;
    style:                string;
    hidden_intent:        HiddenIntent;
    tapped_action:        RelationshipIntentTappedAction;
}

export interface HiddenIntent {
    emoji:      string;
    image_url:  string;
    title_text: string;
    body_text:  string;
}

export enum Emoji {
    Empty = "\ud83d\udc40",
}

export interface RelationshipIntentTappedAction {
    method:       RequestMethod;
    url:          string;
    query_params: PurpleQueryParams;
}

export interface PurpleQueryParams {
    component_id: string;
}

export interface SelectedDescriptor {
    id:                    string;
    name?:                 string;
    prompt?:               string;
    type:                  SelectedDescriptorType;
    icon_url:              string;
    icon_urls:             Image[];
    choice_selections?:    ChoiceSelection[];
    section_id:            SectionID;
    section_name:          SectionName;
    measurable_selection?: MeasurableSelection;
}

export interface ChoiceSelection {
    id:               string;
    name:             string;
    match_group_key?: string;
}

export interface MeasurableSelection {
    value:           number;
    min:             number;
    max:             number;
    unit_of_measure: UnitOfMeasure;
}

export enum UnitOfMeasure {
    CM = "cm",
}

export enum SectionID {
    SEC1 = "sec_1",
    SEC2 = "sec_2",
    SEC3 = "sec_3",
    SEC4 = "sec_4",
    SEC5 = "sec_5",
    SEC6 = "sec_6",
}

export enum SectionName {
    Basics = "Basics",
    Height = "Height",
    LanguagesIKnow = "Languages I Know",
    Lifestyle = "Lifestyle",
    Pronouns = "Pronouns",
    RelationshipType = "Relationship Type",
}

export enum SelectedDescriptorType {
    Measurement = "measurement",
    MultiSelectionSet = "multi_selection_set",
    SingleSelectionSet = "single_selection_set",
}

export interface SparksQuizz {
    quizzes:            Quiz[];
    section_id:         string;
    section_name:       string;
    similarity_score:   SimilarityScore;
    locked_button_text: string;
}

export interface Quiz {
    id:               QuizID;
    name:             string;
    answers:          string[];
    answer_details:   AnswerDetail[];
    image_url:        string;
    locked_image_url: string;
    similarity_score: SimilarityScore;
}

export interface AnswerDetail {
    emoji:       string;
    prompt_text: string;
    answer_id:   string;
    answer_text: string;
}

export enum QuizID {
    Qz1 = "qz_1",
    Qz2 = "qz_2",
    Qz3 = "qz_3",
}

export interface SimilarityScore {
    text:             string;
    style:            SimilarityScoreStyle;
    image_url:        string;
    title_text:       string;
    prompt_text:      string;
    you_prefer_text:  string;
    they_prefer_text: string;
}

export enum SimilarityScoreStyle {
    Blue = "blue",
    Pink = "pink",
    Yellow = "yellow",
}

export interface UserPrompts {
    section_name: string;
    prompts:      UserPromptsPrompt[];
    add_prompt:   AddPrompt;
}

export interface AddPrompt {
    text:          string;
    tapped_action: AddPromptTappedAction;
}

export interface AddPromptTappedAction {
    method:       RequestMethod;
    url:          string;
    query_params: FluffyQueryParams;
}

export interface FluffyQueryParams {
    component_id: string;
    type:         string;
}

export interface UserPromptsPrompt {
    id:            string;
    question_text: string;
    answer_id:     string;
    answer_text:   string;
    image_url:     string;
}
