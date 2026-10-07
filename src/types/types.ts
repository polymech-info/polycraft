
/* eslint-disable @typescript-eslint/naming-convention*/

export interface IConvertedFileMeta {
    photoData: Blob
    objectUrl: string
    name: string
    type: string
}

export interface IUploadedFileMeta {
    downloadUrl: string
    contentType?: string | null
    fullPath: string
    name: string
    type: string
    size: number
    timeCreated: string
    updated: string
}

// Types for moderation status
export type IModerationStatus =
    | 'draft'
    | 'awaiting-moderation'
    | 'rejected'
    | 'accepted'

export interface IModerable {
    moderation: IModerationStatus
    _createdBy?: string
    _id?: string
}

export type ISODateString = string;

export interface IUserState {
    user?: IUser
}
// IUser retains most of the fields from legacy users (omitting passwords),
// and has a few additional fields. Note 'email' is excluded
// _uid is unique/fixed identifier
// ALL USER INFO BELOW IS PUBLIC
export interface IUser {
    // authID is additional id populated by firebase auth, required for some auth operations
    _authID: string
    _lastActive?: ISODateString
    // userName is same as legacy 'mention_name', e.g. @my-name. It will also be the doc _id and
    // firebase auth displayName property
    userName: string
    displayName: string
    moderation: IModerationStatus
    // note, user avatar url is taken direct from userName so no longer populated here
    // avatar:string
    verified: boolean
    badges?: IUserBadges
    // images will be in different formats if they are pending upload vs pulled from db
    coverImages: IUploadedFileMeta[] | IConvertedFileMeta[]
    links: IExternalLink[]
    userRoles?: string[]
    about?: string | null
    DHSite_id?: number
    DHSite_mention_name?: string
    country?: string | null
    // location?: ILocation | null
    year?: ISODateString
    stats?: IUserStats
    /** keep a map of all howto ids that a user has voted as useful */
    votedUsefulHowtos?: { [howtoId: string]: boolean }
    /** keep a map of all Research ids that a user has voted as useful */
    votedUsefulResearch?: { [researchId: string]: boolean }
    notifications?: INotification[]
}

interface IUserBadges {
    verified: boolean
}

interface IExternalLink {
    url: string
    label:
    | 'email'
    | 'website'
    | 'discord'
    | 'bazar'
    | 'forum'
    | 'social media'
    | 'facebook'
    | 'instagram'
}

/**
 * Track the ids and moderation status as summary for user stats
 */
interface IUserStats {
    userCreatedHowtos: { [id: string]: IModerationStatus }
    userCreatedResearch: { [id: string]: IModerationStatus }
    userCreatedEvents: { [id: string]: IModerationStatus }
}

export type IUserDB = IUser;

export interface INotification {
    _id: string
    _created: string
    triggeredBy: {
        displayName: string
        userId: string
    }
    relevantUrl?: string
    type: NotificationType
    read: boolean
}

export type NotificationType =
    | 'new_comment'
    | 'howto_useful'
    | 'new_comment_research'
    | 'research_useful'


export type PlasticTypeLabel =
    | 'pet'
    | 'hdpe'
    | 'pvc'
    | 'ldpe'
    | 'pp'
    | 'ps'
    | 'other'

export type MachineBuilderXpLabel =
    | 'electronics'
    | 'machining'
    | 'welding'
    | 'assembling'
    | 'mould-making'

export type WorkspaceType =
    | 'shredder'
    | 'sheetpress'
    | 'extrusion'
    | 'injection'
    | 'mix'

export interface IPlasticType {
    label: PlasticTypeLabel
    number: string
    imageSrc?: string
}

export interface IProfileType {
    label: string;
    imageSrc?: string
    cleanImageSrc?: string
    cleanImageVerifiedSrc?: string
    textLabel?: string
}
export interface IWorkspaceType {
    label: WorkspaceType
    imageSrc?: string
    textLabel?: string
    subText?: string
}

export interface IMAchineBuilderXp {
    label: MachineBuilderXpLabel
}

export interface IOpeningHours {
    day: string
    openFrom: string
    openTo: string
}

/**
 * PP users can have a bunch of custom meta fields depending on profile type
 */
export interface IUserPP extends IUser {
    profileType: string;
    workspaceType?: WorkspaceType | null
    mapPinDescription?: string | null
    openingHours?: IOpeningHours[]
    collectedPlasticTypes?: PlasticTypeLabel[] | null
    machineBuilderXp?: IMAchineBuilderXp[] | null
    isExpert?: boolean | null
    isV4Member?: boolean | null
}

///////////////////////////////////////////////////////////////////
//
//      OSR Specific Namespace

export interface Location {
    lng: number;
    lat: number;
}

export interface Detail {
    lastActive: Date;
    profilePicUrl: string;
    shortDescription: string;
    heroImageUrl: string;
    name: string;
    profileUrl: string;
}

export interface Administrative {
    name: string;
    description: string;
    isoName: string;
    order: number;
    adminLevel: number;
    isoCode: string;
    wikidataId: string;
    geonameId: number;
}

export interface Informative {
    name: string;
    description: string;
    order: number;
    isoCode: string;
    wikidataId: string;
    geonameId: number;
}

export interface LocalityInfo {
    administrative: Administrative[];
    informative: Informative[];
}

export interface Geo {
    latitude: number;
    longitude: number;
    continent: string;
    lookupSource: string;
    continentCode: string;
    localityLanguageRequested: string;
    city: string;
    countryName: string;
    postcode: string;
    countryCode: string;
    principalSubdivision: string;
    principalSubdivisionCode: string;
    plusCode: string;
    locality: string;
    localityInfo: LocalityInfo;
}

export interface Url {
    name: string;
    url: string;
}

export interface Service {
    welding: boolean;
    assembling: boolean;
    machining: boolean;
    electronics: boolean;
    molds: boolean;
}

export interface Image {
    url: string;
}

export interface Data {
    urls: Url[];
    description: string;
    services: Service[];
    title: string;
    images: Image[];
}

export interface I_PC_USER {
    _created: Date;
    location: Location;
    _modified: Date;
    _id: string;
    detail: Detail;
    type: string;
    _deleted: boolean;
    moderation: string;
    geo: Geo;
    data: Data;
}

export interface I_PC_USER_SHORT {
    name: string;
    email: string;
    bazar: string;
    web: string;
    social: string;
    censored: string;
    lastActive: Date;
    ig: string;
}

export * from './types_vendor.js'
