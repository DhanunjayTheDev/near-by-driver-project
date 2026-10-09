import React, {useEffect, useRef, useState} from 'react';
import {View, Text} from 'react-native';

interface WaitingTimerProps {
  startTime: string; // ISO date when driver arrived
  freeMinutes?: number;
  chargePerMinute?: number;
}

const WaitingTimer: React.FC<WaitingTimerProps> = ({
  startTime,
  freeMinutes = 3,
  chargePerMinute = 2,
}) => {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    const start = new Date(startTime).getTime();
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((now - start) / 1000);
      setElapsed(diff);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startTime]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const isFree = minutes < freeMinutes;
  const extraMinutes = Math.max(0, minutes - freeMinutes);
  const charge = extraMinutes * chargePerMinute;

  return (
    <View className="bg-white rounded-2xl p-5 shadow-sm">
      <Text className="text-gray-500 text-sm text-center mb-2">
        Waiting Time
      </Text>
      <Text className="text-dark text-3xl font-bold text-center">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Text>
      <View className="mt-3 items-center">
        {isFree ? (
          <View className="bg-green-100 px-4 py-2 rounded-full">
            <Text className="text-green-700 text-sm font-medium">
              Free waiting ({freeMinutes - minutes} min left)
            </Text>
          </View>
        ) : (
          <View className="bg-red-100 px-4 py-2 rounded-full">
            <Text className="text-red-700 text-sm font-medium">
              Waiting charge: ₹{charge}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default WaitingTimer;
