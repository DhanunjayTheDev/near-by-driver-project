import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {launchImageLibrary} from 'react-native-image-picker';
import {useAuthStore} from '../../store/authStore';
import {updateUserProfile} from '../../services/apiService';
import InputField from '../../components/ui/InputField';
import PrimaryButton from '../../components/ui/PrimaryButton';

type Props = NativeStackScreenProps<any, 'EditProfile'>;

const EditProfileScreen: React.FC<Props> = ({navigation}) => {
  const {user, setUser} = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [imageUri, setImageUri] = useState(user?.profile_image || '');
  const [loading, setLoading] = useState(false);

  const handleSelectImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 500,
        maxHeight: 500,
      });
      if (result.assets?.[0]?.uri) {
        setImageUri(result.assets[0].uri);
      }
    } catch {
      // Selection cancelled
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (email.trim()) {
        formData.append('email', email.trim());
      }
      if (imageUri && imageUri !== user?.profile_image) {
        formData.append('profile_image', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        } as any);
      }

      const res = await updateUserProfile(formData);
      const updated = res.data.user || res.data;
      setUser({...user!, ...updated});
      Alert.alert('Success', 'Profile updated successfully.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to update profile.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View className="px-5 pt-14 pb-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-dark text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="text-dark text-xl font-bold ml-4">
            Edit Profile
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View className="items-center my-6">
          <TouchableOpacity onPress={handleSelectImage}>
            {imageUri ? (
              <Image
                source={{uri: imageUri}}
                className="w-28 h-28 rounded-full bg-gray-200"
              />
            ) : (
              <View className="w-28 h-28 rounded-full bg-primary/10 items-center justify-center">
                <Text className="text-primary text-4xl font-bold">
                  {(name || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center">
              <Text className="text-white text-sm">📷</Text>
            </View>
          </TouchableOpacity>
        </View>

        <InputField
          label="Full Name"
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />

        <InputField
          label="Email"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <InputField
          label="Phone"
          value={user?.phone || ''}
          editable={false}
          icon={<Text className="text-gray-400">🔒</Text>}
        />

        <View className="mt-6 mb-10">
          <PrimaryButton
            title="Save Changes"
            onPress={handleSave}
            loading={loading}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;
