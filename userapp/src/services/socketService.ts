import {io, Socket} from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SOCKET_URL} from '../utils/constants';

type EventCallback = (...args: any[]) => void;

class SocketService {
  private socket: Socket | null = null;

  async connect(): Promise<void> {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {token},
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', reason => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', error => {
      console.error('Socket connection error:', error.message);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: EventCallback): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: EventCallback): void {
    this.socket?.off(event, callback);
  }

  emit(event: string, data?: any): void {
    this.socket?.emit(event, data);
  }

  trackDriver(driverId: string): void {
    this.socket?.emit('track-driver', {driver_id: driverId});
  }

  stopTracking(driverId: string): void {
    this.socket?.emit('stop-tracking', {driver_id: driverId});
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export default new SocketService();
