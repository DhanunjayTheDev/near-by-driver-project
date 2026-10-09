import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Alert, StatusBar} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import RazorpayCheckout from 'react-native-razorpay';
import type {NativeModules} from 'react-native';
import {useRideStore} from '../../store/rideStore';
import {useAuthStore} from '../../store/authStore';
import {payForRide} from '../../services/apiService';
import {formatCurrency} from '../../utils/helpers';
import PrimaryButton from '../../components/ui/PrimaryButton';

type Props = NativeStackScreenProps<any, 'Payment'>;

const PAYMENT_METHODS = [
  {id: 'CASH', label: 'Cash', icon: '💵', desc: 'Pay cash to driver'},
  {id: 'UPI', label: 'UPI', icon: '📱', desc: 'Pay via UPI'},
  {id: 'CARD', label: 'Card', icon: '💳', desc: 'Debit / Credit Card'},
  {id: 'WALLET', label: 'Wallet', icon: '👛', desc: 'Pay from wallet'},
];

const PaymentScreen: React.FC<Props> = ({navigation}) => {
  const {currentRide} = useRideStore();
  const {user} = useAuthStore();
  const [selectedMethod, setSelectedMethod] = useState('CASH');
  const [loading, setLoading] = useState(false);
  const totalFare = currentRide?.total_fare || 0;

  const handlePayment = async () => {
    if (!currentRide) {
      return;
    }

    setLoading(true);
    try {
      if (selectedMethod === 'CASH') {
        await payForRide(currentRide._id, 'CASH');
        navigation.navigate('RateDriver');
        return;
      }

      // Online payment via Razorpay
      const options = {
        description: `Ride ${currentRide.ride_code}`,
        currency: 'INR',
        key: 'YOUR_RAZORPAY_KEY',
        amount: Math.round(totalFare * 100), // paise
        name: 'Carride',
        prefill: {
          contact: user?.phone || '',
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {color: '#2563EB'},
      };

      const paymentData = await RazorpayCheckout.open(options);
      await payForRide(
        currentRide._id,
        selectedMethod,
        paymentData.razorpay_payment_id,
      );
      navigation.navigate('RateDriver');
    } catch (error: any) {
      if (error?.code !== 'PAYMENT_CANCELLED') {
        Alert.alert(
          'Payment Failed',
          error?.description || 'Payment could not be processed.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View className="flex-1 px-5 pt-14">
        <Text className="text-dark text-2xl font-bold mb-2">Payment</Text>
        <Text className="text-gray-500 text-base mb-6">
          Choose your payment method
        </Text>

        {/* Total */}
        <View className="bg-primary rounded-2xl p-5 items-center mb-6">
          <Text className="text-blue-200 text-sm">Total Amount</Text>
          <Text className="text-white text-3xl font-bold mt-1">
            {formatCurrency(totalFare)}
          </Text>
        </View>

        {/* Methods */}
        {PAYMENT_METHODS.map(method => (
          <TouchableOpacity
            key={method.id}
            className={`flex-row items-center p-4 rounded-2xl mb-3 border-2 ${
              selectedMethod === method.id
                ? 'border-primary bg-blue-50'
                : 'border-gray-100 bg-white'
            }`}
            onPress={() => setSelectedMethod(method.id)}>
            <Text style={{fontSize: 24}} className="mr-4">
              {method.icon}
            </Text>
            <View className="flex-1">
              <Text className="text-dark text-base font-semibold">
                {method.label}
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5">
                {method.desc}
              </Text>
            </View>
            <View
              className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                selectedMethod === method.id
                  ? 'border-primary bg-primary'
                  : 'border-gray-300'
              }`}>
              {selectedMethod === method.id && (
                <View className="w-2.5 h-2.5 rounded-full bg-white" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View className="px-5 pb-8 pt-4 bg-white border-t border-gray-100">
        <PrimaryButton
          title={`Pay ${formatCurrency(totalFare)}`}
          onPress={handlePayment}
          loading={loading}
        />
      </View>
    </View>
  );
};

export default PaymentScreen;
