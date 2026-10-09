import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Alert,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {isIOS} from '../../utils/helpers';
import {useAuthStore} from '../../store/authStore';
import socketService from '../../services/socketService';
import notificationService from '../../services/notificationService';
import PrimaryButton from '../../components/ui/PrimaryButton';

type Props = NativeStackScreenProps<any, 'OTPVerification'>;

const OTP_LENGTH = 6;

const OTPVerificationScreen: React.FC<Props> = ({navigation, route}) => {
  const {phone} = route.params as {phone: string};
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const {verifyOtp: verifyOtpAction, requestOtp} = useAuthStore();

  useEffect(() => {
    inputRefs.current[0]?.focus();
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== OTP_LENGTH) {
      Alert.alert('Invalid OTP', 'Please enter the complete OTP.');
      return;
    }

    setLoading(true);
    try {
      await verifyOtpAction(phone, otpString);
      await socketService.connect();
      await notificationService.requestPermission();
      await notificationService.registerToken();
      navigation.reset({index: 0, routes: [{name: 'Main'}]});
    } catch (error: any) {
      Alert.alert(
        'Verification Failed',
        error?.response?.data?.message || 'Invalid OTP. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await requestOtp(phone);
      setResendTimer(30);
      Alert.alert('OTP Sent', 'A new OTP has been sent to your phone.');
    } catch {
      Alert.alert('Error', 'Failed to resend OTP.');
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={isIOS ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View className="flex-1 justify-center px-6">
        <Text className="text-dark text-2xl font-bold">Verify OTP</Text>
        <Text className="text-gray-500 text-base mt-2">
          Enter the 6-digit code sent to {phone}
        </Text>

        <View className="flex-row justify-between mt-8 mb-8">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => {
                inputRefs.current[index] = ref;
              }}
              className={`w-12 h-14 border-2 rounded-xl text-center text-xl font-bold text-dark ${
                digit ? 'border-primary bg-blue-50' : 'border-gray-200 bg-white'
              }`}
              maxLength={1}
              keyboardType="number-pad"
              value={digit}
              onChangeText={text => handleChange(text, index)}
              onKeyPress={({nativeEvent}) =>
                handleKeyPress(nativeEvent.key, index)
              }
            />
          ))}
        </View>

        <PrimaryButton
          title="Verify & Continue"
          onPress={handleVerify}
          loading={loading}
          disabled={otp.join('').length !== OTP_LENGTH}
        />

        <View className="flex-row justify-center mt-6">
          {resendTimer > 0 ? (
            <Text className="text-gray-400 text-sm">
              Resend OTP in {resendTimer}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text className="text-primary text-sm font-semibold">
                Resend OTP
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default OTPVerificationScreen;
