export interface GeoPos {
	lon: number;
	lat: number;
}

export interface Location {
	geo: GeoPos;
	title: string;
	group?: string;
	website?: string;
}

export interface Options {
	zoom?: number;
	api_key?: string;
	width?: number;
	height?: number;
	fitToBounds?: boolean;
}
