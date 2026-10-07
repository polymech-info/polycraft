## Map

- skip checked todos
- dont comment
- simple markup, for errors, use a dedicated error component

- [ ] complete & self-containing Astro component, tailwind: Google Maps Static API, pass location array & Options as props, default to 2 locations in Lamu, save in ../src/components/polymech/map.astro
- [ ] document all in ../src/components/polymech/map.md, including API key setup
- [ ] save all TS types in ../src/components/polymech/map-types.ts
- [ ] center the map (center of all locations)
- [ ] add options: satalite, terrain (default)

export interface GeoPos {
	lon: number
	lat: number
}

export interface Location {
    geo:GeoPos
    title:string
}

export interface Options{
    zoom?:number
    api_key?:string
}
