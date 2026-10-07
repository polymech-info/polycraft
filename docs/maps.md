# StaticMap Component for Astro

## Static Map Options

| Provider | API Key | Features | Limitations | Example URL |
|----------|---------|----------|-------------|------------|
| Google Maps Static API | Required | Multiple marker styles, road/satellite/hybrid views | Limited free tier | `https://maps.googleapis.com/maps/api/staticmap?center=-2.2697,40.9025&zoom=14&size=600x400&markers=color:red%7C-2.2697,40.9025&key=YOUR_API_KEY` |
| Mapbox Static Maps | Required | Highly customizable styles, multiple layers | Complex URL structure | `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(-2.2697,40.9025)/-2.2697,40.9025,14,0/600x400?access_token=YOUR_API_KEY` |
| OpenStreetMap Static | Not required | Free, simple implementation | Limited styling | `https://staticmap.openstreetmap.de/staticmap.php?center=-2.2697,40.9025&zoom=14&size=600x400&markers=-2.2697,40.9025,red` |
| MapTiler | Required | Custom styles, vector tiles | Less common | `https://api.maptiler.com/maps/streets/static/40.9025,-2.2697,14/600x400.png?markers=40.9025,-2.2697,red&key=YOUR_API_KEY` |
| HERE Maps | Required | Good international coverage | Less flexible styling | `https://image.maps.ls.hereapi.com/mia/1.6/mapview?c=-2.2697,40.9025&z=14&w=600&h=400&poi=-2.2697,40.9025&apiKey=YOUR_API_KEY` |

## Astro Component

Here's a complete Astro component that supports all the providers mentioned above:

```astro
---
// src/components/StaticMap.astro
export interface GeoPos {
  lon: number;
  lat: number;
}

export interface Location {
  geo: GeoPos;
  title: string;
}

export interface Options {
  zoom?: number;
  width?: number;
  height?: number;
  apiKey?: string;
  provider?: 'google' | 'mapbox' | 'openstreetmap' | 'maptiler' | 'here';
  mapType?: string;
  markerColor?: string;
}

const DEFAULT_LOCATION: Location = {
  geo: {
    lat: -2.2697, // Latitude for Lamu, Kenya
    lon: 40.9025  // Longitude for Lamu, Kenya
  },
  title: "Lamu, Kenya"
};

const DEFAULT_OPTIONS: Options = {
  zoom: 14,
  width: 600,
  height: 400,
  provider: 'google',
  mapType: 'roadmap',
  markerColor: 'red'
};

interface Props {
  locations?: Location[];
  options?: Options;
}

const { 
  locations = [DEFAULT_LOCATION],
  options = {}
} = Astro.props;

const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
const { zoom, width, height, apiKey, provider, mapType, markerColor } = mergedOptions;

// Function to build URL based on provider
function buildMapUrl(provider: string, locations: Location[], options: Options): string {
  const { zoom, width, height, apiKey, mapType, markerColor } = options;
  
  switch (provider) {
    case 'google':
      let googleUrl = 'https://maps.googleapis.com/maps/api/staticmap?';
      
      // Center map on the first location if available
      if (locations.length > 0) {
        googleUrl += `center=${locations[0].geo.lat},${locations[0].geo.lon}&`;
      }
      
      // Add zoom, size and map type
      googleUrl += `zoom=${zoom}&size=${width}x${height}&maptype=${mapType}&`;
      
      // Add markers
      locations.forEach(location => {
        googleUrl += `markers=color:${markerColor}%7C${location.geo.lat},${location.geo.lon}&`;
      });
      
      // Add API key if available
      if (apiKey) {
        googleUrl += `key=${apiKey}`;
      }
      
      return googleUrl;
      
    case 'mapbox':
      let mapboxUrl = 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/';
      
      // Add markers
      if (locations.length > 0) {
        locations.forEach((location, index) => {
          if (index > 0) mapboxUrl += ',';
          const color = markerColor.startsWith('#') ? markerColor.substring(1) : markerColor;
          mapboxUrl += `pin-s+${color}(${location.geo.lon},${location.geo.lat})`;
        });
        mapboxUrl += '/';
      }
      
      // Add center coordinates, zoom and size
      const firstLocation = locations[0];
      mapboxUrl += `${firstLocation.geo.lon},${firstLocation.geo.lat},${zoom},0/${width}x${height}`;
      
      // Add API key
      if (apiKey) {
        mapboxUrl += `?access_token=${apiKey}`;
      }
      
      return mapboxUrl;
      
    case 'openstreetmap':
      let osmUrl = 'https://staticmap.openstreetmap.de/staticmap.php?';
      
      // Add center, zoom and size
      if (locations.length > 0) {
        osmUrl += `center=${locations[0].geo.lat},${locations[0].geo.lon}&zoom=${zoom}&size=${width}x${height}&`;
      }
      
      // Add markers
      locations.forEach(location => {
        osmUrl += `markers=${location.geo.lat},${location.geo.lon},${markerColor}&`;
      });
      
      return osmUrl;
      
    case 'maptiler':
      let maptilerUrl = 'https://api.maptiler.com/maps/streets/static/';
      
      // Add center coordinates, zoom and size
      const firstLocMaptiler = locations[0];
      maptilerUrl += `${firstLocMaptiler.geo.lon},${firstLocMaptiler.geo.lat},${zoom}/${width}x${height}.png?`;
      
      // Add markers
      if (locations.length > 0) {
        locations.forEach((location, index) => {
          maptilerUrl += `markers=${location.geo.lon},${location.geo.lat},${markerColor}&`;
        });
      }
      
      // Add API key
      if (apiKey) {
        maptilerUrl += `key=${apiKey}`;
      }
      
      return maptilerUrl;
      
    case 'here':
      let hereUrl = 'https://image.maps.ls.hereapi.com/mia/1.6/mapview?';
      
      // Add center, zoom and size
      if (locations.length > 0) {
        hereUrl += `c=${locations[0].geo.lat},${locations[0].geo.lon}&z=${zoom}&w=${width}&h=${height}&`;
      }
      
      // Add markers
      locations.forEach((location, index) => {
        hereUrl += `poi=${location.geo.lat},${location.geo.lon}&`;
      });
      
      // Add API key
      if (apiKey) {
        hereUrl += `apiKey=${apiKey}`;
      }
      
      return hereUrl;
      
    default:
      return '';
  }
}

const mapUrl = buildMapUrl(provider!, locations, mergedOptions);
---

<div class="static-map w-full">
  <img 
    src={mapUrl} 
    alt="Static Map" 
    class="w-full h-auto max-w-full border border-gray-300 rounded shadow" 
    width={width} 
    height={height}
  />
</div>
```

## Example Usage

```astro
---
import StaticMap from '../components/StaticMap.astro';

const locations = [
  {
    geo: { lat: -2.2697, lon: 40.9025 },
    title: "Lamu Old Town"
  },
  {
    geo: { lat: -2.2723, lon: 40.9018 },
    title: "Lamu Fort"
  }
];

const options = {
  zoom: 15,
  width: 800,
  height: 500,
  apiKey: import.meta.env.GOOGLE_MAPS_API_KEY,
  provider: 'google'
};
---

<div class="container mx-auto my-8 px-4">
  <h1 class="text-2xl font-bold mb-4">Map of Lamu</h1>
  <StaticMap locations={locations} options={options} />
</div>
```

## References

- [Google Maps Static API](https://developers.google.com/maps/documentation/maps-static/overview)
- [Mapbox Static Images API](https://docs.mapbox.com/api/maps/static-images/)
- [OpenStreetMap Static API](https://wiki.openstreetmap.org/wiki/Static_map_images)
- [MapTiler Static Maps](https://docs.maptiler.com/cloud/api/static-maps/)
- [HERE Map Image API](https://developer.here.com/documentation/map-image/dev_guide/topics/introduction.html)