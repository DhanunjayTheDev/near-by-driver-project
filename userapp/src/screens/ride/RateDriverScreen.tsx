import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, Alert, StatusBar} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useRideStore} from '../../store/rideStore';
import {rateRide} from '../../services/apiService';
import PrimaryButton from '../../components/ui/PrimaryButton';

type Props = NativeStackScreenProps<any, 'RateDriver'>;

const RateDriverScreen: React.FC<Props> = ({navigation}) => {
  const {currentRide, driverInfo, resetRide} = useRideStore();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rate Driver', 'Please select a rating.');
      return;
    }
    if (!currentRide) {
      return;
    }

    setLoading(true);
    try {
      await rateRide(currentRide._id, rating, review || undefined);
      resetRide();
      navigation.reset({index: 0, routes: [{name: 'Main'}]});
    } catch {
      // Still navigate away
      resetRide();
      navigation.reset({index: 0, routes: [{name: 'Main'}]});
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    resetRide();
    navigation.reset({index: 0, routes: [{name: 'Main'}]});
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-8">
          <Text className="text-dark text-2xl font-bold">
            Rate your ride
          </Text>
          <Text className="text-gray-500 text-base mt-2">
            How was your experience with{' '}
            {driverInfo?.name || 'the driver'}?
          </Text>
        </View>

        {/* Stars */}
        <View className="flex-row justify-center mb-8">
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              className="mx-2">
              <Text
                style={{fontSize: 40}}
                className={rating >= star ? '' : 'opacity-30'}>
                ⭐
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Review */}
        <View className="bg-white rounded-2xl border border-gray-200 px-4 py-3 mb-6">
          <TextInput
            className="text-dark text-base min-h-[80px]"
            placeholder="Leave a review (optional)"
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            value={review}
            onChangeText={setReview}
          />
        </View>

        <PrimaryButton
          title="Submit Rating"
          onPress={handleSubmit}
          loading={loading}
        />

        <TouchableOpacity className="mt-4 items-center py-3" onPress={handleSkip}>
          <Text className="text-gray-400 text-base">Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RateDriverScreen;
