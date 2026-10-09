import React, {useState} from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  StatusBar,
  Alert,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {isIOS} from '../../utils/helpers';
import {useAuthStore} from '../../store/authStore';
import PrimaryButton from '../../components/ui/PrimaryButton';
import InputField from '../../components/ui/InputField';

type Props = NativeStackScreenProps<any, 'Login'>;

const LoginScreen: React.FC<Props> = ({navigation}) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const {requestOtp} = useAuthStore();

  const handleSendOtp = async () => {
    const cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number.');
      return;
    }

    const fullPhone = cleanPhone.startsWith('+91')
      ? cleanPhone
      : `+91${cleanPhone}`;

    setLoading(true);
    try {
      await requestOtp(fullPhone);
      navigation.navigate('OTPVerification', {phone: fullPhone});
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to send OTP. Try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={isIOS ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View className="flex-1 justify-center px-6">
        <View className="mb-10">
          <Text className="text-primary text-4xl font-bold">Carride</Text>
          <Text className="text-dark text-2xl font-semibold mt-2">
            Welcome back
          </Text>
          <Text className="text-gray-500 text-base mt-2">
            Enter your phone number to continue
          </Text>
        </View>

        <InputField
          label="Phone Number"
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          maxLength={13}
          value={phone}
          onChangeText={setPhone}
          icon={<Text className="text-gray-500 text-base">+91</Text>}
        />

        <View className="mt-6">
          <PrimaryButton
            title="Send OTP"
            onPress={handleSendOtp}
            loading={loading}
            disabled={phone.replace(/\s/g, '').length < 10}
          />
        </View>

        <Text className="text-gray-400 text-xs text-center mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
