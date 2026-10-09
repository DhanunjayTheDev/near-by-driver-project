import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {useRideStore} from '../../store/rideStore';
import locationService from '../../services/locationService';
import {GOOGLE_MAPS_API_KEY} from '../../utils/constants';

type Props = NativeStackScreenProps<any, 'SelectPickup'>;

const SelectPickupScreen: React.FC<Props> = ({navigation}) => {
  const {setPickup} = useRideStore();
  const [loading, setLoading] = useState(false);

  const handleSelectPlace = (data: any, details: any) => {
    if (details?.geometry?.location) {
      setPickup({
        coordinates: [
          details.geometry.location.lng,
          details.geometry.location.lat,
        ],
        address: data.description || details.formatted_address,
      });
      navigation.navigate('SelectDrop');
    }
  };

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    try {
      const hasPermission = await locationService.requestPermission();
      if (!hasPermission) {
        return;
      }
      const position = await locationService.getCurrentPosition();
      setPickup({
        coordinates: [position.coords.longitude, position.coords.latitude],
        address: 'Current Location',
      });
      navigation.navigate('SelectDrop');
    } catch {
      // Error getting location
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View className="px-5 pt-14 pb-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-dark text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="text-dark text-xl font-bold ml-4">
            Select Pickup
          </Text>
        </View>

        <TouchableOpacity
          className="flex-row items-center bg-white rounded-2xl px-4 py-4 mb-4 border border-gray-100"
          onPress={handleUseCurrentLocation}>
          <Text style={{fontSize: 18}} className="mr-3">📍</Text>
          <View className="flex-1">
            <Text className="text-dark text-base font-medium">
              Use current location
            </Text>
            <Text className="text-gray-400 text-xs mt-0.5">
              Detect your current position
            </Text>
          </View>
          {loading && <ActivityIndicator size="small" color="#2563EB" />}
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-5">
        <GooglePlacesAutocomplete
          placeholder="Search pickup location..."
          onPress={handleSelectPlace}
          fetchDetails
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: 'en',
            components: 'country:in',
          }}
          styles={{
            textInput: {
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              color: '#111827',
              borderWidth: 1,
              borderColor: '#E5E7EB',
            },
            listView: {
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              marginTop: 8,
            },
            row: {
              paddingVertical: 14,
              paddingHorizontal: 16,
            },
            description: {
              color: '#111827',
              fontSize: 14,
            },
          }}
          enablePoweredByContainer={false}
        />
      </View>
    </View>
  );
};

export default SelectPickupScreen;
