import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import InputField from '../../components/ui/InputField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import useAuthStore from '../../store/authStore';
import useUserStore from '../../store/userStore';

export default function EditProfileScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);
  const updateAuthUser = useAuthStore((s) => s.updateUser);
  const { updateProfile } = useUserStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (name) formData.append('name', name);
      if (email) formData.append('email', email);
      if (image) {
        const filename = image.split('/').pop();
        const ext = filename.split('.').pop();
        formData.append('profile_image', {
          uri: image,
          name: filename,
          type: `image/${ext}`,
        });
      }
      const data = await updateProfile(formData);
      updateAuthUser(data.user);
      Alert.alert('Success', 'Profile updated!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-5">
      <Text className="text-2xl font-bold text-dark mt-2 mb-6">Edit Profile</Text>

      {/* Avatar */}
      <TouchableOpacity onPress={pickImage} className="self-center mb-6">
        <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
          {(image || user?.profile_image) ? (
            <Image source={{ uri: image || user.profile_image }} className="w-24 h-24" />
          ) : (
            <Text style={{ fontSize: 44 }}>👤</Text>
          )}
        </View>
        <View className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full items-center justify-center">
          <Text style={{ fontSize: 14 }}>📷</Text>
        </View>
      </TouchableOpacity>

      <InputField label="Name" value={name} onChangeText={setName} placeholder="Your name" />
      <InputField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="your@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <InputField
        label="Phone"
        value={user?.phone || ''}
        editable={false}
        placeholder="Phone"
      />

      <View className="mt-4">
        <PrimaryButton title="Save Changes" onPress={handleSave} loading={loading} />
      </View>
    </SafeAreaView>
  );
}
