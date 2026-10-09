import React from 'react';
import {View, Text, StatusBar} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useRideStore} from '../../store/rideStore';
import {formatCurrency} from '../../utils/helpers';
import PrimaryButton from '../../components/ui/PrimaryButton';

type Props = NativeStackScreenProps<any, 'RideCompleted'>;

const RideCompletedScreen: React.FC<Props> = ({navigation}) => {
  const {currentRide, fareEstimate} = useRideStore();

  const baseFare = currentRide?.base_fare || fareEstimate?.base_fare || 0;
  const distanceFare =
    currentRide?.distance_fare || fareEstimate?.distance_fare || 0;
  const waitingCharge =
    currentRide?.waiting_charge || fareEstimate?.waiting_charge || 0;
  const totalFare = currentRide?.total_fare || fareEstimate?.total_fare || 0;

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-accent/10 items-center justify-center mb-4">
            <Text style={{fontSize: 36}}>✅</Text>
          </View>
          <Text className="text-dark text-2xl font-bold">Ride Completed!</Text>
          <Text className="text-gray-500 text-base mt-2">
            You've arrived at your destination
          </Text>
        </View>

        {/* Fare Breakdown */}
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-dark text-lg font-bold mb-4">
            Fare Breakdown
          </Text>

          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500 text-base">Base Fare</Text>
            <Text className="text-dark text-base font-medium">
              {formatCurrency(baseFare)}
            </Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-500 text-base">Distance Fare</Text>
            <Text className="text-dark text-base font-medium">
              {formatCurrency(distanceFare)}
            </Text>
          </View>

          {waitingCharge > 0 && (
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-500 text-base">Waiting Charge</Text>
              <Text className="text-dark text-base font-medium">
                {formatCurrency(waitingCharge)}
              </Text>
            </View>
          )}

          <View className="border-t border-gray-100 mt-2 pt-4 flex-row justify-between">
            <Text className="text-dark text-lg font-bold">Total</Text>
            <Text className="text-primary text-xl font-bold">
              {formatCurrency(totalFare)}
            </Text>
          </View>
        </View>

        <View className="mt-8">
          <PrimaryButton
            title="Proceed to Payment"
            onPress={() => navigation.navigate('Payment')}
          />
        </View>
      </View>
    </View>
  );
};

export default RideCompletedScreen;
