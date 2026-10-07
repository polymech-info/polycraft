# map.astro Component Documentation

## Overview
`map.astro` is an Astro component that renders a Google Maps static map displaying multiple locations with markers. The component centers the map based on the average coordinates of all locations.

## Component Structure
- **File Location**: `C:\Users\zx\Desktop\polymech\polymech-site\src\components\polymech\map.astro`
- **Dependencies**: Imports types from `map-types.ts`

## Props
The component accepts the following props:

### `locations` (optional)
An array of location objects with the following structure:
```typescript
interface Location {
  geo: {
    lat: number;  // Latitude
    lon: number;  // Longitude
  };
  title: string;  // Location title/name
}
```

If not provided, it defaults to sample locations in Lamu, Kenya.

### `options` (optional)
Configuration options for the map:
```typescript
interface Options {
  zoom?: number;    // Map zoom level (default: 9)
  api_key?: string; // Google Maps API key (required for map to display)
}
```

## Features
1. **Automatic Map Centering**: Calculates the average of all location coordinates to center the map
2. **Labeled Markers**: Adds alphabetical labels (A, B, C, etc.) to each marker
3. **Location Legend**: Displays a list of locations with corresponding marker labels
4. **Error Handling**: Shows an error message when no API key is provided

## Example Usage
```astro
---
import Map from '../components/polymech/map.astro';
---

<Map 
  locations={[
    {
      geo: { lat: 37.7749, lon: -122.4194 },
      title: 'San Francisco'
    },
    {
      geo: { lat: 34.0522, lon: -118.2437 },
      title: 'Los Angeles'
    }
  ]}
  options={{
    zoom: 7,
    api_key: 'YOUR_GOOGLE_MAPS_API_KEY'
  }}
/>
```

## Notes
- **API Key Required**: A Google Maps API key is necessary for the map to function
- **Responsive Design**: The map container uses responsive classes for proper display on various screen sizes
- **Style Customization**: The component includes a style tag for additional CSS customization

