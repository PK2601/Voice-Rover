import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

// Initialize BLE Manager
const bleManager = new BleManager();

// Define your ESP32's service and characteristic UUIDs
const ESP32_SERVICE_UUID = "YOUR_SERVICE_UUID";  // Replace with your ESP32's service UUID
const ESP32_CHARACTERISTIC_UUID = "YOUR_CHARACTERISTIC_UUID";  // Replace with your characteristic UUID

export default function BluetoothScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  useEffect(() => {
    // Request required permissions on Android
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        const granted = await requestAndroidPermissions();
        if (!granted) {
          Alert.alert('Bluetooth Permission', 'Bluetooth permission is required');
        }
      }
    };

    requestPermissions();

    // Cleanup on component unmount
    return () => {
      bleManager.destroy();
    };
  }, []);

  const requestAndroidPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Bluetooth requires location permission',
          buttonPositive: 'Allow',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const startScan = async () => {
    if (!isScanning) {
      // Clear existing devices
      setDevices([]);
      setIsScanning(true);
      setConnectionStatus('Scanning...');

      try {
        bleManager.startDeviceScan(
          null, // You can specify service UUIDs here if needed
          { allowDuplicates: false },
          (error, device) => {
            if (error) {
              console.error('Scan error:', error);
              setIsScanning(false);
              return;
            }

            if (device && device.name) {
              // Add device to list if it has a name and isn't already listed
              setDevices(prevDevices => {
                if (!prevDevices.find(d => d.id === device.id)) {
                  return [...prevDevices, device];
                }
                return prevDevices;
              });
            }
          }
        );

        // Stop scan after 10 seconds
        setTimeout(() => {
          bleManager.stopDeviceScan();
          setIsScanning(false);
          setConnectionStatus('Scan Complete');
        }, 10000);
      } catch (error) {
        console.error('Scan error:', error);
        setIsScanning(false);
      }
    }
  };

  const connectToDevice = async (device: Device) => {
    try {
      setConnectionStatus('Connecting...');
      const connectedDevice = await device.connect();
      setConnectedDevice(connectedDevice);
      setConnectionStatus('Connected to ' + device.name);

      // Discover services and characteristics
      await connectedDevice.discoverAllServicesAndCharacteristics();

      // Set up notification listener if needed
      await setupNotifications(connectedDevice);

    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('Connection failed');
    }
  };

  const setupNotifications = async (device: Device) => {
    try {
      // Monitor characteristic changes
      device.monitorCharacteristicForService(
        ESP32_SERVICE_UUID,
        ESP32_CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('Notification error:', error);
            return;
          }
          if (characteristic?.value) {
            // Handle incoming data
            const value = base64.decode(characteristic.value);
            console.log('Received value:', value);
          }
        }
      );
    } catch (error) {
      console.error('Notification setup error:', error);
    }
  };

  const sendCommand = async (command: string) => {
    if (!connectedDevice) {
      Alert.alert('Error', 'No device connected');
      return;
    }

    try {
      await connectedDevice.writeCharacteristicWithoutResponse(
        ESP32_SERVICE_UUID,
        ESP32_CHARACTERISTIC_UUID,
        base64.encode(command)
      );
      console.log('Command sent:', command);
    } catch (error) {
      console.error('Send command error:', error);
      Alert.alert('Error', 'Failed to send command');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        <Text style={styles.status}>{connectionStatus}</Text>
        
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={startScan}
          disabled={isScanning}
        >
          <Text style={styles.buttonText}>
            {isScanning ? 'Scanning...' : 'Scan for Devices'}
          </Text>
        </TouchableOpacity>

        <FlatList
          data={devices}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.deviceItem}
              onPress={() => connectToDevice(item)}
            >
              <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
              <Text style={styles.deviceId}>{item.id}</Text>
            </TouchableOpacity>
          )}
          style={styles.deviceList}
        />

        {connectedDevice && (
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => sendCommand('FORWARD')}
            >
              <Text style={styles.buttonText}>Forward</Text>
            </TouchableOpacity>
            {/* Add more control buttons as needed */}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  status: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  deviceList: {
    flex: 1,
  },
  deviceItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
  },
  controlsContainer: {
    marginTop: 20,
    padding: 10,
  },
  controlButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
  },
});