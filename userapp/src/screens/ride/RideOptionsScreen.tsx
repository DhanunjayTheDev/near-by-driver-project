import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView, Alert, StatusBar, TouchableOpacity} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useRideStore} from '../../store/rideStore';
import {getFareEstimate, requestRide} from '../../services/apiService';
import {VEHICLE_TYPES} from '../../utils/constants';
import {formatCurrency} from '../../utils/helpers';
import RideOptionCard from '../../components/ride/RideOptionCard';
import PrimaryButton from '../../components/ui/PrimaryButton';

type Props = NativeStackScreenProps<any, 'RideOptions'>;

interface FareOption {
  vehicle_type: string;
  total_fare: number;
  base_fare: number;
  distance_fare: number;
  time_fare: number;
}

const RideOptionsScreen: React.FC<Props> = ({navigation}) => {
  const {
    pickup,
    drop,
    selectedVehicleType,
    setSelectedVehicleType,
    setFareEstimate,
    setCurrentRide,
  } = useRideStore();
  const [fares, setFares] = useState<Record<string, FareOption>>({});
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  // Estimate distance from coordinates (Haversine)
  const estimateDistance = (): {distance: number; duration: number} => {
    if (!pickup || !drop) {
      return {distance: 5, duration: 15};
    }
    const R = 6371;
    const dLat = ((drop.coordinates[1] - pickup.coordinates[1]) * Math.PI) / 180;
    const dLon = ((drop.coordinates[0] - pickup.coordinates[0]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((pickup.coordinates[1] * Math.PI) / 180) *
        Math.cos((drop.coordinates[1] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = Math.round(R * c * 10) / 10;
    const duration = Math.round(distance * 3); // ~3 min per km
    return {distance: Math.max(distance, 1), duration: Math.max(duration, 5)};
  };

  useEffect(() => {
    const fetchFares = async () => {
      const {distance, duration} = estimateDistance();
      const farePromises = VEHICLE_TYPES.map(async vt => {
        try {
          const res = await getFareEstimate(vt.id, distance, duration);
          return {vehicle_type: vt.id, ...res.data};
        } catch {
          return {
            vehicle_type: vt.id,
            total_fare: distance * 12 + 50,
            base_fare: 50,
            distance_fare: distance * 12,
            time_fare: duration * 1,
          };
        }
      });

      const results = await Promise.all(farePromises);
      const fareMap: Record<string, FareOption> = {};
      results.forEach(r => {
        fareMap[r.vehicle_type] = r;
      });
      setFares(fareMap);
      setLoading(false);
      if (!selectedVehicleType) {
        setSelectedVehicleType('SEDAN');
      }
    };
    fetchFares();
  }, []);

  const handleBookRide = async () => {
    if (!pickup || !drop || !selectedVehicleType) {
      return;
    }

    setBooking(true);
    try {
      const {distance, duration} = estimateDistance();
      const res = await requestRide({
        pickup_location: {
          coordinates: pickup.coordinates,
          address: pickup.address,
        },
        drop_location: {
          coordinates: drop.coordinates,
          address: drop.address,
        },
        city_id: '',
        estimated_distance: distance,
        estimated_duration: duration,
        vehicle_type: selectedVehicleType,
      });

      const ride = res.data.ride || res.data;
      setCurrentRide(ride);
      if (fares[selectedVehicleType]) {
        setFareEstimate({
          base_fare: fares[selectedVehicleType].base_fare,
          distance_fare: fares[selectedVehicleType].distance_fare,
          time_fare: fares[selectedVehicleType].time_fare,
          waiting_charge: 0,
          total_fare: fares[selectedVehicleType].total_fare,
        });
      }
      navigation.navigate('SearchingDriver');
    } catch (error: any) {
      Alert.alert(
        'Booking Failed',
        error?.response?.data?.message || 'Unable to book ride. Try again.',
      );
    } finally {
      setBooking(false);
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
            Choose your ride
          </Text>
        </View>

        {/* Route Summary */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <View className="flex-row items-center mb-3">
            <View className="w-3 h-3 rounded-full bg-accent mr-3" />
            <Text className="text-dark text-sm flex-1" numberOfLines={1}>
              {pickup?.address}
            </Text>
          </View>
          <View className="ml-1.5 border-l border-dashed border-gray-300 h-4 mb-1" />
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-sm bg-primary mr-3" />
            <Text className="text-dark text-sm flex-1" numberOfLines={1}>
              {drop?.address}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="items-center py-10">
            <Text className="text-gray-400 text-base">
              Calculating fares...
            </Text>
          </View>
        ) : (
          VEHICLE_TYPES.map(vt => (
            <RideOptionCard
              key={vt.id}
              vehicleType={vt.id}
              label={vt.label}
              icon={vt.icon}
              seats={vt.seats}
              fare={fares[vt.id]?.total_fare || 0}
              selected={selectedVehicleType === vt.id}
              onPress={() => setSelectedVehicleType(vt.id)}
            />
          ))
        )}
      </ScrollView>

      <View className="px-5 pb-8 pt-4 bg-white border-t border-gray-100">
        <PrimaryButton
          title={`Book ${
            VEHICLE_TYPES.find(v => v.id === selectedVehicleType)?.label || 'Ride'
          } • ${formatCurrency(fares[selectedVehicleType || '']?.total_fare || 0)}`}
          onPress={handleBookRide}
          loading={booking}
          disabled={!selectedVehicleType || loading}
        />
      </View>
    </View>
  );
};

export default RideOptionsScreen;
