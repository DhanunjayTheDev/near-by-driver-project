import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import PrimaryButton from '../../components/ui/PrimaryButton';
import useAuthStore from '../../store/authStore';

const OTP_LENGTH = 6;

export default function OTPVerificationScreen({ navigation }) {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputs = useRef([]);
  const { verifyOtp, phone, sendOtp } = useAuthStore();

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
    if (newOtp.every((d) => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleVerify = async (otpStr) => {
    const code = otpStr || otp.join('');
    if (code.length !== OTP_LENGTH) {
      Alert.alert('Invalid OTP', 'Please enter the complete OTP');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(code);
    } catch (e) {
      Alert.alert('Error', e.message);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await sendOtp(phone);
      setResendTimer(30);
      Alert.alert('OTP Sent', 'A new OTP has been sent to your phone');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center">
          <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-10">
            <View className="w-16 h-16 bg-primary/10 rounded-2xl items-center justify-center mb-4">
              <Text style={{ fontSize: 32 }}>📱</Text>
            </View>
            <Text className="text-2xl font-bold text-dark">Verify OTP</Text>
            <Text className="text-sm text-gray-500 mt-2 text-center">
              Enter the 6-digit code sent to{'\n'}
              <Text className="font-semibold text-dark">{phone}</Text>
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(600)} className="flex-row justify-center gap-3 mb-8">
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => (inputs.current[i] = ref)}
                value={digit}
                onChangeText={(text) => handleChange(text, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 ${
                  digit ? 'border-primary bg-blue-50' : 'border-gray-200 bg-white'
                }`}
              />
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600)}>
            <PrimaryButton
              title="Verify"
              onPress={() => handleVerify()}
              loading={loading}
              disabled={otp.some((d) => !d)}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).duration(600)} className="mt-6 items-center">
            {resendTimer > 0 ? (
              <Text className="text-sm text-gray-400">
                Resend OTP in <Text className="font-semibold text-primary">{resendTimer}s</Text>
              </Text>
            ) : (
              <Text onPress={handleResend} className="text-sm font-semibold text-primary">
                Resend OTP
              </Text>
            )}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
