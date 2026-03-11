import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import PrimaryButton from '../../components/ui/PrimaryButton';
import InputField from '../../components/ui/InputField';
import useRideStore from '../../store/rideStore';

export default function RateDriverScreen({ navigation }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const { rateCurrentRide, resetRide, assignedDriver } = useRideStore();

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rate Driver', 'Please select a rating');
      return;
    }
    setLoading(true);
    try {
      await rateCurrentRide(rating, review);
      resetRide();
      navigation.popToTop();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    resetRide();
    navigation.popToTop();
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-5">
      <View className="flex-1 justify-center">
        <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-8">
          <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-4">
            <Text style={{ fontSize: 40 }}>⭐</Text>
          </View>
          <Text className="text-2xl font-bold text-dark">Rate your ride</Text>
          <Text className="text-sm text-gray-500 mt-1">
            How was your ride with {assignedDriver?.name || 'the driver'}?
          </Text>
        </Animated.View>

        {/* Star Rating */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} className="flex-row justify-center gap-3 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
              <Text style={{ fontSize: 44 }}>{star <= rating ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Review */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <InputField
            label="Write a review (optional)"
            value={review}
            onChangeText={setReview}
            placeholder="Your experience..."
            multiline
            numberOfLines={3}
          />
        </Animated.View>
      </View>

      <View className="pb-6">
        <PrimaryButton title="Submit Rating" onPress={handleSubmit} loading={loading} />
        <TouchableOpacity onPress={handleSkip} className="mt-3 py-3 items-center">
          <Text className="text-sm font-medium text-gray-400">Skip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
