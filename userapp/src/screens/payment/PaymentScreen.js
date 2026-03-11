import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import PrimaryButton from '../../components/ui/PrimaryButton';
import useRideStore from '../../store/rideStore';
import { formatCurrency } from '../../utils/helpers';

const PAYMENT_METHODS = [
  { id: 'CASH', label: 'Cash', icon: '💵', desc: 'Pay with cash' },
  { id: 'UPI', label: 'UPI', icon: '📲', desc: 'Google Pay, PhonePe, etc.' },
  { id: 'CARD', label: 'Card', icon: '💳', desc: 'Credit / Debit card' },
  { id: 'WALLET', label: 'Wallet', icon: '👛', desc: 'App wallet balance' },
];

export default function PaymentScreen({ navigation }) {
  const { currentRide, payForCurrentRide } = useRideStore();
  const [selected, setSelected] = useState('CASH');
  const [loading, setLoading] = useState(false);
  const totalFare = currentRide?.total_fare || 0;

  const handlePay = async () => {
    setLoading(true);
    try {
      const paymentData = { payment_method: selected };
      await payForCurrentRide(paymentData);
      navigation.replace('RateDriver');
    } catch (e) {
      Alert.alert('Payment Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-2 pb-4">
        <Text className="text-2xl font-bold text-dark">Payment</Text>
        <Text className="text-sm text-gray-500 mt-1">Choose a payment method</Text>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* Amount */}
        <Animated.View entering={FadeInDown.duration(400)} className="bg-primary/5 rounded-2xl p-6 items-center mb-6">
          <Text className="text-sm text-gray-500">Total Amount</Text>
          <Text className="text-4xl font-bold text-primary mt-1">{formatCurrency(totalFare)}</Text>
        </Animated.View>

        {/* Methods */}
        {PAYMENT_METHODS.map((method, i) => (
          <Animated.View key={method.id} entering={FadeInDown.delay(i * 100).duration(400)}>
            <TouchableOpacity
              onPress={() => setSelected(method.id)}
              activeOpacity={0.7}
              className={`flex-row items-center p-4 rounded-2xl mb-3 border-2 ${
                selected === method.id ? 'border-primary bg-blue-50' : 'border-gray-100 bg-white'
              }`}
            >
              <View className="w-12 h-12 bg-gray-50 rounded-xl items-center justify-center">
                <Text style={{ fontSize: 24 }}>{method.icon}</Text>
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-base font-semibold text-dark">{method.label}</Text>
                <Text className="text-xs text-gray-400 mt-0.5">{method.desc}</Text>
              </View>
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  selected === method.id ? 'border-primary bg-primary' : 'border-gray-300'
                }`}
              >
                {selected === method.id && <View className="w-2.5 h-2.5 bg-white rounded-full" />}
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      <View className="px-5 pb-6 pt-3">
        <PrimaryButton
          title={`Pay ${formatCurrency(totalFare)}`}
          onPress={handlePay}
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
}
