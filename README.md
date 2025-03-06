# GooglePlacesAutocomplete Component

## Overview
The `GooglePlacesAutocomplete` component is a customizable React Native component that provides an autocomplete search input for Google Places. It supports fetching location suggestions, displaying search results, and handling user selections.

## Features
- Customizable input field and styles
- Fetches Google Places results based on user input
- Supports predefined places and current location
- Uses debounce for optimized search performance
- Handles API requests and responses
- Supports both Android and iOS platforms


## Usage

```jsx
import React, { useRef } from 'react';
import { GooglePlacesAutocomplete } from './GooglePlacesAutocomplete';

const App = () => {
  const ref = useRef();

  return (
    <GooglePlacesAutocomplete
      ref={ref}
      query={{ key: 'YOUR_GOOGLE_PLACES_API_KEY' }}
      onPress={(data, details) => console.log('Selected:', data, details)}
      predefinedPlaces={[]}
      currentLocation={true}
      currentLocationLabel="Current Location"
    />
  );
};

export default App;
```

## Props
| Prop | Type | Description |
|------|------|-------------|
| `query` | object | Google API query parameters, including `key` (required) |
| `onPress` | function | Callback when a place is selected |
| `predefinedPlaces` | array | List of predefined places |
| `currentLocation` | boolean | Enables fetching the current location |
| `currentLocationLabel` | string | Label for the current location option |
| `listViewDisplayed` | boolean | Controls whether the list is displayed |
| `fetchDetails` | boolean | Fetches additional details for a selected place |
| `enableHighAccuracyLocation` | boolean | Enables high-accuracy geolocation |
| `timeout` | number | Request timeout in milliseconds |
| `onTimeout` | function | Callback when a request times out |
| `onFail` | function | Callback when a request fails |
| `onNotFound` | function | Callback when no results are found |
| `fields` | string | Google Places API fields for additional data |
| `placeholder` | string | Placeholder text for the input field |
| `styles` | object | Custom styles for the input field and list |

## Methods (via Ref)
| Method | Description |
|--------|-------------|
| `setAddressText(address)` | Sets the text input value |
| `getAddressText()` | Gets the current text input value |
| `blur()` | Blurs the input field |
| `focus()` | Focuses the input field |
| `isFocused()` | Checks if the input is focused |
| `clear()` | Clears the input field |
| `getCurrentLocation()` | Fetches the current location |

## Dependencies
- `lodash.debounce`
- `prop-types`
- `uuid`
- `react-native`

## Notes
- Make sure to enable location permissions in your app for `currentLocation` to work.
- You need a valid Google Places API key for `query.key`.
- The component provides methods via `ref` to control the input field externally.

## License
This component is open-source and available under the MIT License.