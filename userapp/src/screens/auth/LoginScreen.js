import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import InputField from '../../components/ui/InputField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import useAuthStore from '../../store/authStore';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const sendOtp = useAuthStore((s) => s.sendOtp);

  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number');
      return;
    }
    const formatted = cleaned.startsWith('+91') ? cleaned : `+91${cleaned}`;
    setLoading(true);
    try {
      await sendOtp(formatted);
      navigation.navigate('OTPVerification');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center">
          <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-12">
            <View className="w-20 h-20 bg-primary rounded-2xl items-center justify-center mb-4">
              <Text style={{ fontSize: 40 }}>🚗</Text>
            </View>
            <Text className="text-3xl font-bold text-dark">Welcome to Carride</Text>
            <Text className="text-base text-gray-500 mt-2">Enter your phone number to get started</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <InputField
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter 10 digit number"
              keyboardType="phone-pad"
              maxLength={13}
              icon={<Text className="text-lg text-gray-500">+91</Text>}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600)} className="mt-4">
            <PrimaryButton
              title="Continue"
              onPress={handleSendOtp}
              loading={loading}
              disabled={phone.replace(/\s/g, '').length < 10}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).duration(600)} className="mt-6">
            <Text className="text-center text-xs text-gray-400">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
