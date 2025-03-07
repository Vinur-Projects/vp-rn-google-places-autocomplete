/* eslint-disable react-native/no-inline-styles */
import debounce from "lodash.debounce";
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";
import React, { forwardRef, useMemo, useEffect, useImperativeHandle, useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const defaultStyles = {
  container: {
    flex: 1,
  },
  textInputContainer: {
    flexDirection: "row",
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    height: 44,
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 15,
    flex: 1,
    marginBottom: 5,
  },
  listView: {},
  row: {
    backgroundColor: "#FFFFFF",
    padding: 13,
    minHeight: 44,
    flexDirection: "row",
  },
  loader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    height: 20,
  },
  description: {},
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#c8c7cc",
  },
  poweredContainer: {
    justifyContent: "flex-end",
    alignItems: "center",
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
    borderColor: "#c8c7cc",
    borderTopWidth: 0.5,
  },
  powered: {},
};

export const GooglePlacesAutocomplete = forwardRef((props, ref) => {
  let _results = [];
  let _requests = [];

  const hasNavigator = () => {
    if (navigator?.geolocation) {
      return true;
    } else {
      console.warn(
        "If you are using React Native v0.60.0+ you must follow these instructions to enable currentLocation: https://git.io/Jf4AR"
      );
      return false;
    }
  };

  const buildRowsFromResults = useCallback(
    (results, text) => {
      let res = [];
      const shouldDisplayPredefinedPlaces = text ? results.length === 0 && text.length === 0 : results.length === 0;
      if (shouldDisplayPredefinedPlaces || props.predefinedPlacesAlwaysVisible === true) {
        res = [...props.predefinedPlaces.filter((place) => place?.description.length)];

        if (props.currentLocation === true && hasNavigator()) {
          res.unshift({
            description: props.currentLocationLabel,
            isCurrentLocation: true,
          });
        }
      }

      res = res.map((place) => ({
        ...place,
        isPredefinedPlace: true,
      }));

      return [...res, ...results];
    },
    [props.currentLocation, props.currentLocationLabel, props.predefinedPlaces, props.predefinedPlacesAlwaysVisible]
  );

  const [stateText, setStateText] = useState("");
  const [dataSource, setDataSource] = useState(buildRowsFromResults([]));
  const [listViewDisplayed, setListViewDisplayed] = useState(
    props.listViewDisplayed === "auto" ? false : props.listViewDisplayed
  );
  const [url] = useState("https://places.googleapis.com");
  const [listLoaderDisplayed, setListLoaderDisplayed] = useState(false);

  const inputRef = useRef();
  const [sessionToken, setSessionToken] = useState(uuidv4());

  useEffect(() => {
    if (stateText) {
      _handleChangeText(stateText);
    }
    return () => {
      _abortRequests();
    };
  }, [props.query]);

  useEffect(() => {
    setDataSource(buildRowsFromResults([]));
  }, [buildRowsFromResults, props.predefinedPlaces]);

  useImperativeHandle(ref, () => ({
    setAddressText: (address) => setStateText(address),
    getAddressText: () => stateText,
    blur: () => inputRef.current.blur(),
    focus: () => inputRef.current.focus(),
    isFocused: () => inputRef.current.isFocused(),
    clear: () => inputRef.current.clear(),
    getCurrentLocation,
  }));

  const _abortRequests = () => {
    _requests.map((i) => {
      i.onreadystatechange = null;
      i.abort();
    });
    _requests = [];
  };

  const supportedPlatform = () => {
    if (Platform.OS === "web" && !props.requestUrl) {
      console.warn("This library cannot be used for the web unless you specify the requestUrl prop.");
      return false;
    }
    return true;
  };

  const getCurrentLocation = () => {
    let options = {
      enableHighAccuracy: false,
      timeout: 20000,
      maximumAge: 1000,
    };

    if (props.enableHighAccuracyLocation && Platform.OS === "android") {
      options = { enableHighAccuracy: true, timeout: 20000 };
    }

    const getCurrentPosition =
      navigator.geolocation.getCurrentPosition || navigator.geolocation.default.getCurrentPosition;

    getCurrentPosition &&
      getCurrentPosition(
        (position) => {
          if (props.nearbyPlacesAPI === "None") {
            let currentLocation = {
              description: props.currentLocationLabel,
              geometry: {
                location: {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                },
              },
            };
            _disableRowLoaders();
            props.onPress(currentLocation, currentLocation);
          } else {
            _requestNearby(position.coords.latitude, position.coords.longitude);
          }
        },
        (error) => {
          _disableRowLoaders();
          console.error(error.message);
        },
        options
      );
  };

  const _onPress = (rowData) => {
    if (rowData.isPredefinedPlace !== true && props.fetchDetails === true) {
      if (rowData.isLoading === true) return;

      Keyboard.dismiss();
      _abortRequests();
      _enableRowLoader(rowData);

      const request = new XMLHttpRequest();
      _requests.push(request);
      request.timeout = props.timeout;
      request.ontimeout = props.onTimeout;
      request.onreadystatechange = () => {
        if (request.readyState !== 4) return;

        if (request.status === 200) {
          const responseJSON = JSON.parse(request.responseText);
          if (responseJSON.id) {
            _disableRowLoaders();
            _onBlur();
            setStateText(_renderDescription(rowData));
            delete rowData.isLoading;
            props.onPress(rowData, responseJSON);
          } else {
            _disableRowLoaders();
            if (props.autoFillOnNotFound) {
              setStateText(_renderDescription(rowData));
              delete rowData.isLoading;
            }
            if (!props.onNotFound) {
              console.warn("google places autocomplete: request failed");
            } else {
              props.onNotFound(responseJSON);
            }
          }
        } else {
          _disableRowLoaders();
          if (!props.onFail) {
            console.warn("google places autocomplete: request failed");
          } else {
            props.onFail("request could not be completed or has been aborted");
          }
        }
      };

      request.open("GET", `${url}/v1/places/${rowData.place_id}`);
      request.setRequestHeader("X-Goog-Api-Key", props.query.key);
      request.setRequestHeader("Content-Type", "application/json");
      if (props.fields) {
        request.setRequestHeader("X-Goog-FieldMask", props.fields);
      }
      if (props.query.language) {
        request.setRequestHeader("Accept-Language", props.query.language); // Set language for localized response
      }
      setSessionToken(uuidv4());
      request.send();
    } else if (rowData.isCurrentLocation === true) {
      _enableRowLoader(rowData);
      setStateText(_renderDescription(rowData));
      delete rowData.isLoading;
      getCurrentLocation();
    } else {
      setStateText(_renderDescription(rowData));
      _onBlur();
      delete rowData.isLoading;
      let predefinedPlace = _getPredefinedPlace(rowData);
      props.onPress(predefinedPlace, predefinedPlace);
    }
  };

  const _enableRowLoader = (rowData) => {
    let rows = buildRowsFromResults(_results);
    for (let i = 0; i < rows.length; i++) {
      if (
        rows[i].place_id === rowData.place_id ||
        (rows[i].isCurrentLocation === true && rowData.isCurrentLocation === true)
      ) {
        rows[i].isLoading = true;
        setDataSource(rows);
        break;
      }
    }
  };

  const _disableRowLoaders = () => {
    for (let i = 0; i < _results.length; i++) {
      if (_results[i].isLoading === true) {
        _results[i].isLoading = false;
      }
    }
    setDataSource(buildRowsFromResults(_results));
  };

  const _getPredefinedPlace = (rowData) => {
    if (rowData.isPredefinedPlace !== true) return rowData;

    for (let i = 0; i < props.predefinedPlaces.length; i++) {
      if (props.predefinedPlaces[i].description === rowData.description) {
        return props.predefinedPlaces[i];
      }
    }
    return rowData;
  };

  const _filterResultsByPlacePredictions = (unfilteredResults) => {
    const results = [];
    for (let i = 0; i < unfilteredResults.length; i++) {
      if (unfilteredResults[i].placePrediction) {
        results.push({
          description: unfilteredResults[i].placePrediction.text?.text,
          place_id: unfilteredResults[i].placePrediction.placeId,
          reference: unfilteredResults[i].placePrediction.placeId,
          structured_formatting: {
            main_text: unfilteredResults[i].placePrediction.structuredFormat?.mainText?.text,
            secondary_text: unfilteredResults[i].placePrediction.structuredFormat?.secondaryText?.text,
          },
          types: unfilteredResults[i].placePrediction.types ?? [],
        });
      }
    }
    return results;
  };

  const _requestNearby = (latitude, longitude) => {
    _abortRequests();
    if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null) {
      // Simplified for brevity; you can expand this if needed
      console.log("Nearby request not implemented in this example");
    } else {
      _results = [];
      setDataSource(buildRowsFromResults([]));
    }
  };

  const _request = (text) => {
    _abortRequests();
    if (!url || !supportedPlatform() || !text || text.length < props.minLength) {
      _results = [];
      setDataSource(buildRowsFromResults([]));
      return;
    }

    const request = new XMLHttpRequest();
    _requests.push(request);
    request.timeout = props.timeout;
    request.ontimeout = props.onTimeout;
    request.onreadystatechange = () => {
      if (request.readyState !== 4) {
        setListLoaderDisplayed(true);
        return;
      }
      setListLoaderDisplayed(false);
      if (request.status === 200) {
        const responseJSON = JSON.parse(request.responseText);
        if (typeof responseJSON.suggestions !== "undefined") {
          const results = _filterResultsByPlacePredictions(responseJSON.suggestions);
          _results = results;
          setDataSource(buildRowsFromResults(results, text));
        }
        if (typeof responseJSON.error !== "undefined") {
          if (!props.onFail) {
            console.warn("google places autocomplete: " + responseJSON.error.message);
          } else {
            props.onFail(responseJSON.error.message);
          }
        }
      }
    };

    if (props.preProcess) {
      setStateText(props.preProcess(text));
    }

    request.open("POST", `${url}/v1/places:autocomplete`);
    request.setRequestHeader("X-Goog-Api-Key", props.query.key);
    request.setRequestHeader("Content-Type", "application/json");

    const requestBody = {
      input: text,
      sessionToken,
    };

    if (props.query.language) {
      requestBody.languageCode = props.query.language;
    }

    if (props.query.country) {
      requestBody.includedRegionCodes = [props.query.country];
    }

    request.send(JSON.stringify(requestBody));
  };

  const debounceData = useMemo(() => debounce(_request, props.debounce), [props.query, props.debounce]);

  const _onChangeText = (text) => {
    setStateText(text);
    debounceData(text);
  };

  const _handleChangeText = (text) => {
    _onChangeText(text);
    const onChangeText = props?.textInputProps?.onChangeText;
    if (onChangeText) {
      onChangeText(text);
    }
  };

  const _getRowLoader = () => <ActivityIndicator animating={true} size="small" />;

  const _renderRowData = (rowData, index) => {
    if (props.renderRow) return props.renderRow(rowData, index);

    return (
      <Text
        style={[
          props.suppressDefaultStyles ? {} : defaultStyles.description,
          props.styles.description,
          rowData.isPredefinedPlace ? props.styles.predefinedPlacesDescription : {},
        ]}
        numberOfLines={props.numberOfLines}
      >
        {_renderDescription(rowData)}
      </Text>
    );
  };

  const _renderDescription = (rowData) => {
    if (props.renderDescription) return props.renderDescription(rowData);
    return rowData.description || rowData.formatted_address || rowData.name;
  };

  const _renderLoader = (rowData) => {
    if (rowData.isLoading === true) {
      return (
        <View style={[props.suppressDefaultStyles ? {} : defaultStyles.loader, props.styles.loader]}>
          {_getRowLoader()}
        </View>
      );
    }
    return null;
  };

  const _renderRow = (rowData = {}, index) => {
    return (
      <ScrollView
        contentContainerStyle={props.isRowScrollable ? { minWidth: "100%" } : { width: "100%" }}
        scrollEnabled={props.isRowScrollable}
        keyboardShouldPersistTaps={props.keyboardShouldPersistTaps}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={({ hovered, pressed }) => [
            props.isRowScrollable ? { minWidth: "100%" } : { width: "100%" },
            {
              backgroundColor: pressed ? props.listUnderlayColor : hovered ? props.listHoverColor : undefined,
            },
          ]}
          onPress={() => _onPress(rowData)}
          onBlur={_onBlur}
        >
          <View
            style={[
              props.suppressDefaultStyles ? {} : defaultStyles.row,
              props.styles.row,
              rowData.isPredefinedPlace ? props.styles.specialItemRow : {},
            ]}
          >
            {_renderLoader(rowData)}
            {_renderRowData(rowData, index)}
          </View>
        </Pressable>
      </ScrollView>
    );
  };

  const _renderSeparator = (sectionID, rowID) => {
    if (rowID === dataSource.length - 1) return null;
    return (
      <View
        key={`${sectionID}-${rowID}`}
        style={[props.suppressDefaultStyles ? {} : defaultStyles.separator, props.styles.separator]}
      />
    );
  };

  const _onBlur = (e) => {
    if (!props.keepResultsAfterBlur) {
      setListViewDisplayed(false);
    }
    inputRef?.current?.blur();
  };

  const _onFocus = () => setListViewDisplayed(true);

  const _renderPoweredLogo = () => {
    if (!props.enablePoweredByContainer || dataSource.length === 0) return null;

    return (
      <View style={[props.suppressDefaultStyles ? {} : defaultStyles.poweredContainer, props.styles.poweredContainer]}>
        <Image
          style={[props.suppressDefaultStyles ? {} : defaultStyles.powered, props.styles.powered]}
          resizeMode="contain"
          source={require("./images/powered_by_google_on_white.png")}
        />
      </View>
    );
  };

  const _getFlatList = () => {
    const keyGenerator = () => Math.random().toString(36).substr(2, 10);

    if (
      supportedPlatform() &&
      (stateText !== "" || props.predefinedPlaces.length > 0 || props.currentLocation === true) &&
      listViewDisplayed === true
    ) {
      return (
        <FlatList
          nativeID="result-list-id"
          key="result-list-id"
          scrollEnabled={!props.disableScroll}
          style={[props.suppressDefaultStyles ? {} : defaultStyles.listView, props.styles.listView]}
          data={dataSource}
          keyExtractor={keyGenerator}
          extraData={[dataSource, props]}
          ItemSeparatorComponent={_renderSeparator}
          renderItem={({ item, index }) => _renderRow(item, index)}
          ListEmptyComponent={
            listLoaderDisplayed
              ? props.listLoaderComponent
              : stateText.length > props.minLength && props.listEmptyComponent
          }
          ListFooterComponent={_renderPoweredLogo}
          {...props}
        />
      );
    }
    return null;
  };

  let { onFocus, onBlur, onChangeText, clearButtonMode, InputComp, ...userProps } = props.textInputProps;
  const TextInputComp = InputComp || TextInput;

  return (
    <View
      style={[props.suppressDefaultStyles ? {} : defaultStyles.container, props.styles.container]}
      pointerEvents="box-none"
    >
      {!props.textInputHide && (
        <View
          style={[props.suppressDefaultStyles ? {} : defaultStyles.textInputContainer, props.styles.textInputContainer]}
        >
          <TextInputComp
            ref={inputRef}
            style={[props.suppressDefaultStyles ? {} : defaultStyles.textInput, props.styles.textInput]}
            value={stateText}
            placeholder={props.placeholder}
            onFocus={
              onFocus
                ? (e) => {
                    _onFocus();
                    onFocus(e);
                  }
                : _onFocus
            }
            onBlur={
              onBlur
                ? (e) => {
                    _onBlur(e);
                    onBlur(e);
                  }
                : _onBlur
            }
            clearButtonMode={clearButtonMode || "while-editing"}
            onChangeText={_handleChangeText}
            {...userProps}
          />
        </View>
      )}
      {_getFlatList()}
      {props.children}
    </View>
  );
});

GooglePlacesAutocomplete.propTypes = {
  autoFillOnNotFound: PropTypes.bool,
  currentLocation: PropTypes.bool,
  currentLocationLabel: PropTypes.string,
  debounce: PropTypes.number,
  disableScroll: PropTypes.bool,
  enableHighAccuracyLocation: PropTypes.bool,
  enablePoweredByContainer: PropTypes.bool,
  fetchDetails: PropTypes.bool,
  isRowScrollable: PropTypes.bool,
  keyboardShouldPersistTaps: PropTypes.oneOf(["never", "always", "handled"]),
  listEmptyComponent: PropTypes.element,
  listLoaderComponent: PropTypes.element,
  listHoverColor: PropTypes.string,
  listUnderlayColor: PropTypes.string,
  listViewDisplayed: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(["auto"])]),
  keepResultsAfterBlur: PropTypes.bool,
  minLength: PropTypes.number,
  nearbyPlacesAPI: PropTypes.string,
  numberOfLines: PropTypes.number,
  onFail: PropTypes.func,
  onNotFound: PropTypes.func,
  onPress: PropTypes.func,
  onTimeout: PropTypes.func,
  placeholder: PropTypes.string,
  predefinedPlaces: PropTypes.array,
  predefinedPlacesAlwaysVisible: PropTypes.bool,
  preProcess: PropTypes.func,
  query: PropTypes.shape({
    key: PropTypes.string.isRequired,
    language: PropTypes.string,
    country: PropTypes.string,
  }),
  renderDescription: PropTypes.func,
  styles: PropTypes.object,
  suppressDefaultStyles: PropTypes.bool,
  textInputHide: PropTypes.bool,
  textInputProps: PropTypes.object,
  timeout: PropTypes.number,
  fields: PropTypes.string,
};

GooglePlacesAutocomplete.defaultProps = {
  autoFillOnNotFound: false,
  currentLocation: false,
  currentLocationLabel: "Current location",
  debounce: 0,
  disableScroll: false,
  enableHighAccuracyLocation: true,
  enablePoweredByContainer: true,
  fetchDetails: false,
  isRowScrollable: true,
  keyboardShouldPersistTaps: "always",
  listHoverColor: "#ececec",
  listUnderlayColor: "#c8c7cc",
  listViewDisplayed: "auto",
  keepResultsAfterBlur: false,
  minLength: 0,
  nearbyPlacesAPI: "None",
  numberOfLines: 1,
  onFail: () => {},
  onNotFound: () => {},
  onPress: () => {},
  onTimeout: () => console.warn("google places autocomplete: request timeout"),
  placeholder: "",
  predefinedPlaces: [],
  predefinedPlacesAlwaysVisible: false,
  query: {
    key: "missing api key",
  },
  styles: {},
  suppressDefaultStyles: false,
  textInputHide: false,
  textInputProps: {},
  timeout: 20000,
  fields: "*",
};

GooglePlacesAutocomplete.displayName = "GooglePlacesAutocomplete";

export default { GooglePlacesAutocomplete };
