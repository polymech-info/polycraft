export interface IUser {
    _modified: string
    _id: string
    subType: string
    moderation: string
    _deleted: boolean
    verified: boolean
    type: string
    location: ILocation
    _created: string
    geo: IGeo
    data: any
    detail: any
    brief?: string
}

export interface ILocation {
    lat: number
    lng: number
}

export interface IGeo {
    latitude: number
    lookupSource: string
    longitude: number
    localityLanguageRequested: string
    continent: string
    continentCode: string
    countryName: string
    countryCode: string
    principalSubdivision: string
    principalSubdivisionCode: string
    city: string
    locality: string
    postcode: string
    plusCode: string
    localityInfo: any
}