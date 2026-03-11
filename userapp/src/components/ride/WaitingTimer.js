import React, { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { getTimerDisplay } from '../../utils/helpers';
import { formatCurrency } from '../../utils/helpers';

const FREE_WAITING_SECONDS = 180; // 3 minutes

export default function WaitingTimer({ waitingTime, waitingCharge, freeWaitingOver }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const fraction = Math.min(waitingTime / FREE_WAITING_SECONDS, 1);
    progress.value = withTiming(fraction, { duration: 500, easing: Easing.linear });
  }, [waitingTime]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View className="bg-white rounded-2xl p-5 shadow-md">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-sm font-medium text-gray-500">
          {freeWaitingOver ? 'Waiting charges started' : 'Free waiting time'}
        </Text>
        <Text
          className={`text-2xl font-bold ${freeWaitingOver ? 'text-red-500' : 'text-primary'}`}
        >
          {getTimerDisplay(freeWaitingOver ? waitingTime - FREE_WAITING_SECONDS : Math.max(FREE_WAITING_SECONDS - waitingTime, 0))}
        </Text>
      </View>

      {!freeWaitingOver && (
        <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <Animated.View className="h-full bg-primary rounded-full" style={progressStyle} />
        </View>
      )}

      {freeWaitingOver && (
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-sm text-red-500 font-medium">₹2/min</Text>
          <Text className="text-lg font-bold text-red-500">{formatCurrency(waitingCharge)}</Text>
        </View>
      )}
    </View>
  );
}
