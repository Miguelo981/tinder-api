import type { Locale, Meta } from "@/types.ts";
import type { Asset, Badge, BadgeType, Image, Spotify, User } from "@/interfaces/search.ts";

export type ProfileScope = 'account'
  | 'available_descriptors'
  | 'boost'
  | 'bouncerbypass'
  | 'contact_cards'
  | 'email_settings'
  | 'feature_access'
  | 'instagram'
  | 'likes'
  | 'profile_meter'
  | 'notifications'
  | 'misc_merchandising'
  | 'offerings'
  | 'onboarding'
  | 'paywalls'
  | 'plus_control'
  | 'purchase'
  | 'readreceipts'
  | 'spotify'
  | 'super_likes'
  | 'tinder_u'
  | 'travel'
  | 'tutorials'
  | 'user'
  | 'all_in_gender'

export interface TinderProfileParams {
    locale?: Locale
    scopes: ProfileScope[]
}

export interface TinderProfileResponse {
    meta: Meta;
    data: TinderProfileData;
}

export interface TinderProfileData {
    account:               Account;
    available_descriptors: AvailableDescriptor[];
    boost:                 PurpleBoost;
    bouncerbypass:         Bouncerbypass;
    contact_cards:         ContactCards;
    email_settings:        DataEmailSettings;
    feature_access:        FeatureAccess;
    instagram:             Instagram;
    likes:                 Likes;
    profile_meter:         ProfileMeter;
    notifications:         any[];
    offerings:             Offerings;
    onboarding:            Onboarding;
    paywalls:              Paywall[];
    plus_control:          PlusControl;
    purchase:              DataPurchase;
    readreceipts:          Readreceipts;
    spotify:               Spotify;
    super_likes:           SuperLikes;
    tinder_u:              TinderU;
    travel:                Travel;
    tutorials:             string[];
    user:                  User;
    all_in_gender:         DataAllInGender[];
    misc_merchandising:    MiscMerchandising;
}

export interface Account {
    account_phone_number: string;
    apple_id_linked:      boolean;
    facebook_id_linked:   boolean;
    google_id_linked:     boolean;
    line_id_linked:       boolean;
    is_email_verified:    boolean;
    account_email:        string;
}

export interface DataAllInGender {
    checked:                           boolean;
    parent_gender_id:                  number;
    subheading:                        string;
    id:                                string;
    name:                              string;
    children:                          Child[];
    legacy_value?:                     number;
    requires_binary_gender_selection?: boolean;
}

export interface Child {
    checked:     boolean;
    id:          string;
    name:        string;
    description: string;
}

export interface AvailableDescriptor {
    prompt?:      string;
    descriptors:  Descriptor[];
    section_id:   string;
    section_name: string;
    display_type: string;
}

export interface Descriptor {
    id:                            string;
    prompt?:                       string;
    type:                          DescriptorType;
    icon_url:                      string;
    icon_urls:                     Image[];
    background_text?:              string;
    measurable_details?:           MeasurableDetails;
    section_id:                    string;
    section_name:                  string;
    match_group_key?:              string;
    discovery_preferences_enabled: boolean;
    name?:                         string;
    choices?:                      Choice[];
    sub_prompt?:                   string;
    should_localize_choices?:      boolean;
    min_selections?:               number;
    max_selections?:               number;
    search_background_text?:       string;
}

export interface Choice {
    id:               string;
    name:             string;
    style?:           string;
    emoji?:           string;
    icon_urls?:       Image[];
    match_group_key?: string;
}

export interface MeasurableDetails {
    min:                     number;
    max:                     number;
    unit_of_measure:         string;
    default_unit_of_measure: string;
}

export enum DescriptorType {
    ChoiceSelectorV1 = "choice_selector_v1",
    Measurement = "measurement",
    MultiSelectionSet = "multi_selection_set",
    SingleSelectionSet = "single_selection_set",
}

export interface PurpleBoost {
    allotment:                   number;
    allotment_used:              number;
    allotment_remaining:         number;
    internal_remaining:          number;
    is_super_boost:              boolean;
    purchased_remaining:         number;
    resets_at:                   number;
    remaining:                   number;
    duration:                    number;
    boost_refresh_amount:        number;
    boost_refresh_interval:      number;
    boost_refresh_interval_unit: string;
    compound_boost:              CompoundBoost[];
    boost_ended:                 boolean;
    result_viewed_at:            number;
    boost_id:                    string;
    multiplier:                  number;
    consumed_from:               number;
}

export interface CompoundBoost {
    quantity: number;
    duration: number;
}

export interface Bouncerbypass {
    purchased_bouncer_bypass_remaining: number;
    internal_bouncer_bypass_remaining:  number;
    allotment_bouncer_bypass_remaining: number;
    total_bouncer_bypass_remaining:     number;
    user_is_bounced:                    boolean;
}

export interface ContactCards {
    populated_cards: PopulatedCard[];
    available_cards: string[];
}

export interface PopulatedCard {
    contact_type: string;
    contact_id:   string;
    deeplink?:    string;
    default?:     boolean;
}

export interface DataEmailSettings {
    email:          string;
    email_settings: EmailSettingsEmailSettings;
}

export interface EmailSettingsEmailSettings {
    promotions:  boolean;
    messages:    boolean;
    new_matches: boolean;
}

export interface FeatureAccess {
    likes_you:          DirectMessages;
    passport:           Passport;
    preference_filters: DirectMessages;
    rewind:             Passport;
    primetimeboost:     DirectMessages;
    likes_you_annuity:  LikesYouAnnuity;
    match_extension:    MatchExtension;
    direct_messages:    DirectMessages;
    likes_you_alc:      LikesYouAlc;
    swipe_note:         DirectMessages;
}

export interface DirectMessages {
    unlimited: boolean;
    amount:    number;
}

export interface LikesYouAlc {
    amount:               number;
    show_paywall_on_card: number;
    min_likes_count:      number;
}

export interface LikesYouAnnuity {
    entry_points: string;
}

export interface MatchExtension {
    duration: number;
    amount:   number;
}

export interface Passport {
    unlimited: boolean;
}

export interface Instagram {
}

export interface Likes {
    likes_remaining: number;
}

export interface MiscMerchandising {
    sub_expiration_banner:      SubExpirationBanner;
    subscription_card_ordering: string[];
    landing_card:               string;
}

export interface SubExpirationBanner {
    heading:     string;
    description: string;
}

export interface Offerings {
    plus:           Plus;
    gold:           Gold;
    platinum:       Gold;
    swipenote:      Primetimeboost;
    boost:          OfferingsBoost;
    readreceipt:    Primetimeboost;
    superboost:     Primetimeboost;
    superlike:      OfferingsBoost;
    primetimeboost: Primetimeboost;
}

export interface OfferingsBoost {
    purchase_type: string;
    product_data:  BoostProductDatum[];
    merchandising: BoostMerchandising;
}

export interface BoostMerchandising {
    upsell: string;
}

export interface BoostProductDatum {
    amount:               number;
    offer_type:           OfferType;
    tags?:                Tag[];
    icon_url?:            string;
    payment_methods:      PaymentMethod[];
    original_product_id?: string;
    duration?:            number;
}

export enum OfferType {
    Discount = "DISCOUNT",
    Regular = "REGULAR",
}

export interface PaymentMethod {
    platform:          Platform;
    sku_id:            string;
    discount:          number;
    require_zip:       boolean;
    price:             number;
    is_vat:            boolean;
    tax_rate:          number;
    currency:          Currency;
    adjustment_price?: number;
}

export enum Currency {
    Eur = "EUR",
}

export enum Platform {
    CreditCard = "credit_card",
}

export enum Tag {
    BaseGroup = "BASE_GROUP",
    BestValue = "BEST_VALUE",
    MostPopular = "MOST_POPULAR",
    Primary = "PRIMARY",
}

export interface Gold {
    purchase_type: string;
    product_data:  GoldProductDatum[];
    merchandising: GoldMerchandising;
}

export interface GoldMerchandising {
    data:                                        PurpleData;
    ordering:                                    Ordering;
    subscription_merchandising_comparison_chart: SubscriptionMerchandisingComparisonChart;
    sub_page_data:                               PurpleSubPageData;
}

export interface PurpleData {
    superlike:             SwipeNoteClass;
    boost:                 SwipeNoteClass;
    hide_ads:              Badge;
    hide_age:              Badge;
    hide_distance:         Badge;
    like:                  Badge;
    control_who_sees_you:  Badge;
    passport:              Badge;
    rewind:                Badge;
    superboost_alc_access: Badge;
    control_who_you_see:   Badge;
    toppicks:              SwipeNoteClass;
    toppicks_alc_access:   Badge;
    likes_you:             Badge;
    preference_filters:    Badge;
    my_likes_lookback?:    MyLikesLookback;
    priority_likes?:       Badge;
    swipe_note?:           SwipeNoteClass;
}

export interface SwipeNoteClass {
    type:         string;
    renewal_data: RenewalData;
}

export interface RenewalData {
    balance:               number;
    refresh_interval:      number;
    refresh_interval_unit: string;
}

export interface MyLikesLookback {
    type:     BadgeType;
    duration: number;
}

export interface Ordering {
    carousel:    string[];
    plus_screen: string[];
}

export interface PurpleSubPageData {
    cta:      string;
    termed:   boolean;
    sections: Section[];
}

export interface Section {
    type:     string;
    heading:  string;
    benefits: Benefit[];
}

export interface Benefit {
    key:          string;
    heading:      string;
    included:     boolean;
    description?: string;
    deeplink?:    string;
}

export interface SubscriptionMerchandisingComparisonChart {
    base_subscription: string;
    features:          Feature[];
}

export interface Feature {
    text:                       string;
    base_subscription_included: boolean;
}

export interface GoldProductDatum {
    amount:                number;
    offer_type:            OfferType;
    refresh_interval:      number;
    refresh_interval_unit: string;
    tags:                  Tag[];
    icon_url:              string;
    payment_methods:       PaymentMethod[];
}

export interface Plus {
    purchase_type: string;
    product_data:  GoldProductDatum[];
    merchandising: PlusMerchandising;
}

export interface PlusMerchandising {
    data:          FluffyData;
    ordering:      Ordering;
    sub_page_data: FluffySubPageData;
}

export interface FluffyData {
    superlike:             SwipeNoteClass;
    boost:                 SwipeNoteClass;
    hide_ads:              Badge;
    hide_age:              Badge;
    hide_distance:         Badge;
    like:                  Badge;
    control_who_sees_you:  Badge;
    passport:              Badge;
    rewind:                Badge;
    superboost_alc_access: Badge;
    control_who_you_see:   Badge;
}

export interface FluffySubPageData {
    termed:   boolean;
    sections: Section[];
}

export interface Primetimeboost {
    purchase_type: string;
    product_data:  BoostProductDatum[];
    merchandising: Instagram;
}

export interface Onboarding {
    tutorials: Tutorial[];
}

export interface Tutorial {
    name:   string;
    assets: Asset[];
}

export interface Paywall {
    instanceID:              string;
    templateID:              string;
    productType:             string;
    entryPoint:              string;
    carouselSubscriptionV2?: CarouselSubscriptionV2;
    carouselBV2?:            CarouselBV2;
}

export interface CarouselBV2 {
    heroImage:       HeroImage;
    upsellPrimary:   UpsellPrimary;
    upsellSecondary: UpsellSecondary;
    title:           string;
    body:            string;
    discountTag:     string;
}

export interface HeroImage {
    kind:    string;
    iconUrl: IconURL;
}

export interface IconURL {
    dark:    string;
    default: string;
}

export interface UpsellPrimary {
    title:                 string;
    subtitle:              string;
    deeplink:              string;
    imageUrl:              IconURL;
    productType:           string;
    headerBackgroundColor: BorderColor;
    borderColor:           BorderColor;
    button:                Button;
}

export interface BorderColor {
    type:     BorderColorType;
    name:     string;
    fallback: string;
}

export enum BorderColorType {
    Color = "color",
    Gradient = "gradient",
}

export interface Button {
    text:         string;
    textColor:    BorderColor;
    background:   BorderColor;
    borderColor?: BorderColor;
}

export interface UpsellSecondary {
    heroImage:   HeroImage;
    title:       string;
    subtitle:    string;
    deeplink:    string;
    imageUrl:    IconURL;
    productType: string;
    cardHeader:  string;
    description: string;
    borderColor: BorderColor;
    button:      Button;
}

export interface CarouselSubscriptionV2 {
    header:               Header;
    title:                Title;
    disclosureText:       string;
    allotmentDisclosure?: AllotmentDisclosure;
    discountTag:          string;
    skuCard:              SkuCard;
    button:               Button;
}

export interface AllotmentDisclosure {
    boost: AllotmentDisclosureBoost;
}

export interface AllotmentDisclosureBoost {
    weeklySub: string;
}

export interface Header {
    background: BorderColor;
    iconUrl:    IconURL;
}

export interface SkuCard {
    borderColor:            PurpleBorderColor;
    merchandisingTextColor: BorderColor;
    iconUrl:                SkuCardIconURL;
}

export interface PurpleBorderColor {
    selected:   BorderColor;
    unselected: BorderColor;
}

export interface SkuCardIconURL {
    newSub:  IconURL;
    upgrade: IconURL;
}

export interface Title {
    text:      Text;
    textColor: BorderColor;
}

export interface Text {
    boost?:                    string;
    control_who_sees_you?:     string;
    default:                   string;
    hide_ads?:                 string;
    hide_age_and_distance?:    string;
    like?:                     string;
    likes_you?:                string;
    likes_you_filtering?:      string;
    passport?:                 string;
    preference_filters?:       string;
    rewind?:                   string;
    superlike?:                string;
    toppicks?:                 string;
    my_type?:                  string;
    priority_likes?:           string;
    superlike_attach_message?: string;
}

export interface PlusControl {
    hide_ads: boolean;
}

export interface ProfileMeter {
    percent_achieved:      number;
    incomplete_components: IncompleteComponent[];
}

export interface IncompleteComponent {
    key:          string;
    red_dot?:     boolean;
    display_text: string;
}

export interface DataPurchase {
    purchases:            PurchaseElement[];
    subscription_expired: boolean;
    payment_state:        number;
}

export interface PurchaseElement {
    id:               string;
    expire_date:      number;
    payment_pending:  boolean;
    product_type:     string;
    purchase_type:    string;
    product_id:       string;
    terms:            number;
    terms_unit:       string;
    platform:         string;
    is_grace_period:  boolean;
    is_incentives:    boolean;
    incentives_type:  string;
    email:            string;
    is_auto_renewing: boolean;
}

export interface Readreceipts {
    internal_remaining:  number;
    purchased_remaining: number;
    remaining:           number;
}

export interface SuperLikes {
    remaining:                       number;
    alc_remaining:                   number;
    new_alc_remaining:               number;
    allotment:                       number;
    superlike_refresh_amount:        number;
    superlike_refresh_interval:      number;
    superlike_refresh_interval_unit: string;
    resets_at:                       Date;
}

export interface TinderU {
    status:    string;
    status_v2: string;
}

export interface Travel {
    is_traveling: boolean;
}

export interface Country {
    name:   string;
    cc:     string;
    alpha3: string;
}

export interface Province {
    name: string;
    code: string;
}