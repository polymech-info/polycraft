# Google Maps Static API Astro Component

This documentation explains how to use the `map.astro` component which displays locations on a static Google Map.

## Setting up Google Maps Static API key

Before using this component, you need to obtain a Google Maps API key with access to the Static Maps API:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to APIs & Services > Library
4. Search for "Maps Static API" and enable it
5. Navigate to Credentials and create an API key
6. Make sure to restrict the API key to only the Static Maps API and your domain for production use

## Usage

Import the component in your Astro page and use it as follows:

```astro
---
import Map from '../path/to/map.astro';
import type { Location } from '../path/to/map-types';

// Define your locations
const myLocations: Location[] = [
  {
    geo: { lat: 37.7749296, lon: -122.4194155 },
    title: 'Golden Gate Bridge'
  },
  {
    geo: { lat: 37.7749, lon: -122.4314 },
    title: 'Palace of Fine Arts'
  }
];
---

<h1>Explore San Francisco</h1>

<Map 
  locations={myLocations} 
  options={{ zoom: 13, api_key: import.meta.env.GOOGLE_MAPS_API_KEY }} 
/>
```

## Props

The `Map` component accepts the following props:

- `locations`: An array of `Location` objects, each containing:
  - `geo`: An object with `lat` and `lon` properties for the coordinates
  - `title`: A string describing the location
- `options`: An object with optional configurations:
  - `zoom`: The zoom level of the map (default: 12)
  - `api_key`: Your Google Maps API key (required for production use)

## Environment Variables

For security, it's recommended to store your API key as an environment variable. Create an `.env` file in the root of your Astro project with:

```
GOOGLE_MAPS_API_KEY=your_api_key_here
```

Then access it in your component with `import.meta.env.GOOGLE_MAPS_API_KEY`.

## Default Values

If no locations are provided, the component defaults to showing two locations in Lamu, Kenya:

1. Lamu Old Town (-2.269456, 40.902096)
2. Shela Beach (-2.272012, 40.890586)

## Error Handling

The component includes a simple error message if no API key is provided, reminding users to set up their Google Maps API key.

## Styling

The component uses Tailwind CSS for styling, ensuring a responsive design that fits into various layouts. The map container has a fixed aspect ratio of 6 to 4 and a max height of 400px.
`}