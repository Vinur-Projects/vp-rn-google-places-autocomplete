import * as React from 'react';
import {
  ImageStyle,
  StyleProp,
  TextInput,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native';

/** @see https://developers.google.com/maps/faq#languagesupport */
type Language =
  | 'af'
  | 'am'
  | 'ar'
  | 'az'
  | 'be'
  | 'bg'
  | 'bn'
  | 'bs'
  | 'ca'
  | 'cs'
  | 'da'
  | 'de'
  | 'el'
  | 'en-AU'
  | 'en-GB'
  | 'en'
  | 'es-419'
  | 'es'
  | 'et'
  | 'eu'
  | 'fa'
  | 'fi'
  | 'fil'
  | 'fr-CA'
  | 'fr'
  | 'gl'
  | 'gu'
  | 'hi'
  | 'hr'
  | 'hu'
  | 'hy'
  | 'id'
  | 'is'
  | 'it'
  | 'iw'
  | 'ja'
  | 'ka'
  | 'kk'
  | 'km'
  | 'kn'
  | 'ko'
  | 'ky'
  | 'lo'
  | 'lt'
  | 'lv'
  | 'mk'
  | 'ml'
  | 'mn'
  | 'mr'
  | 'ms'
  | 'my'
  | 'ne'
  | 'nl'
  | 'no'
  | 'pa'
  | 'pl'
  | 'pt-BR'
  | 'pt-PT'
  | 'pt'
  | 'ro'
  | 'ru'
  | 'si'
  | 'sk'
  | 'sl'
  | 'sq'
  | 'sr'
  | 'sv'
  | 'sw'
  | 'ta'
  | 'te'
  | 'th'
  | 'tr'
  | 'uk'
  | 'ur'
  | 'uz'
  | 'vi'
  | 'zh-CN'
  | 'zh-HK'
  | 'zh-TW'
  | 'zh'
  | 'zu';

/** @see https://developers.google.com/places/web-service/supported_types#table1 */
type PrimaryType =
  | 'accounting'
  | 'airport'
  | 'amusement_park'
  | 'aquarium'
  | 'art_gallery'
  | 'atm'
  | 'bakery'
  | 'bank'
  | 'bar'
  | 'beauty_salon'
  | 'bicycle_store'
  | 'book_store'
  | 'bowling_alley'
  | 'bus_station'
  | 'cafe'
  | 'campground'
  | 'car_dealer'
  | 'car_rental'
  | 'car_repair'
  | 'car_wash'
  | 'casino'
  | 'cemetery'
  | 'church'
  | 'city_hall'
  | 'clothing_store'
  | 'convenience_store'
  | 'courthouse'
  | 'dentist'
  | 'department_store'
  | 'doctor'
  | 'drugstore'
  | 'electrician'
  | 'electronics_store'
  | 'embassy'
  | 'fire_station'
  | 'florist'
  | 'funeral_home'
  | 'furniture_store'
  | 'gas_station'
  | 'gym'
  | 'hair_care'
  | 'hardware_store'
  | 'hindu_temple'
  | 'home_goods_store'
  | 'hospital'
  | 'insurance_agency'
  | 'jewelry_store'
  | 'laundry'
  | 'lawyer'
  | 'library'
  | 'light_rail_station'
  | 'liquor_store'
  | 'local_government_office'
  | 'locksmith'
  | 'lodging'
  | 'meal_delivery'
  | 'meal_takeaway'
  | 'mosque'
  | 'movie_rental'
  | 'movie_theater'
  | 'moving_company'
  | 'museum'
  | 'night_club'
  | 'painter'
  | 'park'
  | 'parking'
  | 'pet_store'
  | 'pharmacy'
  | 'physiotherapist'
  | 'plumber'
  | 'police'
  | 'post_office'
  | 'primary_school'
  | 'real_estate_agency'
  | 'restaurant'
  | 'roofing_contractor'
  | 'rv_park'
  | 'school'
  | 'secondary_school'
  | 'shoe_store'
  | 'shopping_mall'
  | 'spa'
  | 'stadium'
  | 'storage'
  | 'store'
  | 'subway_station'
  | 'supermarket'
  | 'synagogue'
  | 'taxi_stand'
  | 'tourist_attraction'
  | 'train_station'
  | 'transit_station'
  | 'travel_agency'
  | 'university'
  | 'veterinary_care'
  | 'zoo';

/** @see https://developers.google.com/places/web-service/supported_types#table2 */
type PlaceType =
  | 'administrative_area_level_1'
  | 'administrative_area_level_2'
  | 'administrative_area_level_3'
  | 'administrative_area_level_4'
  | 'administrative_area_level_5'
  | 'archipelago'
  | 'colloquial_area'
  | 'continent'
  | 'country'
  | 'establishment'
  | 'finance'
  | 'floor'
  | 'food'
  | 'general_contractor'
  | 'geocode'
  | 'health'
  | 'intersection'
  | 'locality'
  | 'natural_feature'
  | 'neighborhood'
  | 'place_of_worship'
  | 'plus_code'
  | 'point_of_interest'
  | 'political'
  | 'post_box'
  | 'postal_code'
  | 'postal_code_prefix'
  | 'postal_code_suffix'
  | 'postal_town'
  | 'premise'
  | 'room'
  | 'route'
  | 'street_address'
  | 'street_number'
  | 'sublocality'
  | 'sublocality_level_1'
  | 'sublocality_level_2'
  | 'sublocality_level_3'
  | 'sublocality_level_4'
  | 'sublocality_level_5'
  | 'subpremise'
  | 'town_square';

interface Point {
  latitude: number;
  longitude: number;
}

interface StructuredFormat {
  mainText: {
    text: string;
    matches?: { startOffset: number; endOffset: number }[];
  };
  secondaryText: {
    text: string;
  };
}

interface PlacePrediction {
  place: string;
  placeId: string;
  text: {
    text: string;
    matches?: { startOffset: number; endOffset: number }[];
  };
  structuredFormat: StructuredFormat;
  types: PrimaryType[];
}

interface GooglePlaceData {
  description: string;
  place_id: string;
  reference: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: PrimaryType[];
}

interface AddressComponent {
  longText: string;
  shortText: string;
  types: PlaceType[];
}

interface GooglePlaceDetail {
  id: string;
  displayName: {
    text: string;
    languageCode: string;
  };
  formattedAddress: string;
  location: Point;
  addressComponents: AddressComponent[];
  types: PlaceType[];
  // Add more fields as needed based on fields prop
}

interface Query {
  key: string;
  language?: Language;
  country?: string; // ISO 3166-1 alpha-2 code (e.g., 'AM' for Armenia)
}

interface Styles {
  container?: StyleProp<ViewStyle>;
  description?: StyleProp<TextStyle>;
  textInputContainer?: StyleProp<ViewStyle>;
  textInput?: StyleProp<TextStyle>;
  loader?: StyleProp<ViewStyle>;
  listView?: StyleProp<ViewStyle>;
  predefinedPlacesDescription?: StyleProp<TextStyle>;
  poweredContainer?: StyleProp<ViewStyle>;
  powered?: StyleProp<ImageStyle>;
  separator?: StyleProp<ViewStyle>;
  row?: StyleProp<ViewStyle>;
  specialItemRow?: StyleProp<ViewStyle>;
}

interface Place {
  description: string;
  geometry?: { location: Point };
}

interface GooglePlacesAutocompleteProps {
  autoFillOnNotFound?: boolean;
  currentLocation?: boolean;
  currentLocationLabel?: string;
  debounce?: number;
  disableScroll?: boolean;
  enableHighAccuracyLocation?: boolean;
  enablePoweredByContainer?: boolean;
  fetchDetails?: boolean;
  filterReverseGeocodingByTypes?: PlaceType[];
  isRowScrollable?: boolean;
  keyboardShouldPersistTaps?: 'never' | 'always' | 'handled';
  listEmptyComponent?: JSX.Element | React.ComponentType<{}>;
  listLoaderComponent?: JSX.Element | React.ComponentType<{}>;
  listHoverColor?: string;
  listUnderlayColor?: string;
  listViewDisplayed?: 'auto' | boolean;
  keepResultsAfterBlur?: boolean;
  minLength?: number;
  nearbyPlacesAPI?: 'GoogleReverseGeocoding' | 'GooglePlacesSearch' | 'None';
  numberOfLines?: number;
  onFail?: (error: string) => void;
  onNotFound?: (response: any) => void;
  onPress?: (data: GooglePlaceData, detail: GooglePlaceDetail | null) => void;
  onTimeout?: () => void;
  placeholder?: string;
  predefinedPlaces?: Place[];
  predefinedPlacesAlwaysVisible?: boolean;
  preProcess?: (text: string) => string;
  query: Query;
  renderDescription?: (row: GooglePlaceData) => string;
  renderHeaderComponent?: (text: string) => JSX.Element | React.ComponentType<{}>;
  renderLeftButton?: () => JSX.Element | React.ComponentType<{}>;
  renderRightButton?: () => JSX.Element | React.ComponentType<{}>;
  renderRow?: (data: GooglePlaceData, index: number) => JSX.Element | React.ComponentType<{}>;
  styles?: Styles;
  suppressDefaultStyles?: boolean;
  textInputHide?: boolean;
  textInputProps?: TextInputProps;
  timeout?: number;
  maxResults?: number;
  fields?: string;
  children?: React.ReactNode;
}

export interface GooglePlacesAutocompleteRef {
  setAddressText(address: string): void;
  getAddressText(): string;
  getCurrentLocation(): void;
  blur(): void;
  focus(): void;
  isFocused(): boolean;
  clear(): void;
  getResultCount(): number;
}

export const GooglePlacesAutocomplete: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<GooglePlacesAutocompleteProps> &
    React.RefAttributes<GooglePlacesAutocompleteRef>
>;