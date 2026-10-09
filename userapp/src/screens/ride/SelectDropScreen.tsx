import React from 'react';
import {View, Text, TouchableOpacity, StatusBar} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {useRideStore} from '../../store/rideStore';
import {GOOGLE_MAPS_API_KEY} from '../../utils/constants';

type Props = NativeStackScreenProps<any, 'SelectDrop'>;

const SelectDropScreen: React.FC<Props> = ({navigation}) => {
  const {setDrop, pickup} = useRideStore();

  const handleSelectPlace = (data: any, details: any) => {
    if (details?.geometry?.location) {
      setDrop({
        coordinates: [
          details.geometry.location.lng,
          details.geometry.location.lat,
        ],
        address: data.description || details.formatted_address,
      });
      navigation.navigate('RideOptions');
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
            Select Drop-off
          </Text>
        </View>

        {pickup && (
          <View className="flex-row items-center bg-green-50 rounded-2xl px-4 py-3 mb-4">
            <View className="w-3 h-3 rounded-full bg-accent mr-3" />
            <Text className="text-dark text-sm flex-1" numberOfLines={1}>
              {pickup.address}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-1 px-5">
        <GooglePlacesAutocomplete
          placeholder="Search drop-off location..."
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

export default SelectDropScreen;
