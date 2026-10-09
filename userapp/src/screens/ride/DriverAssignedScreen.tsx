import React, {useEffect} from 'react';
import {View, Text, Linking, TouchableOpacity, StatusBar, Alert} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import MapViewComponent from '../../components/map/MapViewComponent';
import DriverMarker from '../../components/map/DriverMarker';
import DriverInfoCard from '../../components/ride/DriverInfoCard';
import {useRideStore} from '../../store/rideStore';
import socketService from '../../services/socketService';
import {cancelRide} from '../../services/apiService';
import {RIDE_STATUS} from '../../utils/constants';
import PrimaryButton from '../../components/ui/PrimaryButton';

type Props = NativeStackScreenProps<any, 'DriverAssigned'>;

const DriverAssignedScreen: React.FC<Props> = ({navigation}) => {
  const {
    driverInfo,
    driverLocation,
    currentRide,
    setDriverLocation,
    setRideStatus,
    setRideOtp,
    resetRide,
  } = useRideStore();

  useEffect(() => {
    if (driverInfo?._id) {
      socketService.trackDriver(driverInfo._id);
    }

    const handleDriverLocation = (data: any) => {
      setDriverLocation({
        longitude: data.location?.longitude || data.longitude,
        latitude: data.location?.latitude || data.latitude,
        heading: data.heading || 0,
        speed: data.speed || 0,
      });
    };

    const handleDriverArrived = (data: any) => {
      setRideStatus(RIDE_STATUS.DRIVER_ARRIVED);
      if (data.ride_otp) {
        setRideOtp(data.ride_otp);
      }
      navigation.replace('DriverArrived');
    };

    const handleRideCancelled = () => {
      Alert.alert('Ride Cancelled', 'The driver cancelled the ride.');
      resetRide();
      navigation.reset({index: 0, routes: [{name: 'Main'}]});
    };

    socketService.on('driver-location', handleDriverLocation);
    socketService.on('driver-arrived', handleDriverArrived);
    socketService.on('ride-cancelled', handleRideCancelled);

    return () => {
      socketService.off('driver-location', handleDriverLocation);
      socketService.off('driver-arrived', handleDriverArrived);
      socketService.off('ride-cancelled', handleRideCancelled);
    };
  }, [driverInfo]);

  const handleCall = () => {
    if (driverInfo?.phone) {
      Linking.openURL(`tel:${driverInfo.phone}`);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel Ride', 'Are you sure?', [
      {text: 'No', style: 'cancel'},
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            if (currentRide) {
              await cancelRide(currentRide._id, 'User cancelled after driver assigned');
            }
          } catch {}
          if (driverInfo?._id) {
            socketService.stopTracking(driverInfo._id);
          }
          resetRide();
          navigation.reset({index: 0, routes: [{name: 'Main'}]});
        },
      },
    ]);
  };

  const driverCoord = driverLocation
    ? {latitude: driverLocation.latitude, longitude: driverLocation.longitude}
    : null;

  return (
    <View className="flex-1">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <MapViewComponent showsUserLocation>
        {driverCoord && (
          <DriverMarker
            coordinate={driverCoord}
            heading={driverLocation?.heading}
            driverName={driverInfo?.name}
          />
        )}
      </MapViewComponent>

      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-5 pt-5 pb-8">
        <Text className="text-dark text-lg font-bold mb-4">
          Driver is on the way
        </Text>

        {driverInfo && (
          <DriverInfoCard driver={driverInfo} arrivalTime="5 min" />
        )}

        <View className="flex-row mt-4 gap-3">
          <TouchableOpacity
            className="flex-1 bg-accent rounded-2xl py-3 items-center"
            onPress={handleCall}>
            <Text className="text-white text-base font-semibold">📞 Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-red-500 rounded-2xl py-3 items-center"
            onPress={handleCancel}>
            <Text className="text-white text-base font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DriverAssignedScreen;
