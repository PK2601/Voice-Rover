import base64 from 'base-64';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

// Initialize BLE Manager
const bleManager = new BleManager();

// ESP32 Identifiers (Change this to match your ESP32 name)
const ESP32_DEVICE_NAME = "ESP32_Bluetooth";  // Ensure this matches your ESP32
const ESP32_SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
const ESP32_CHARACTERISTIC_UUID = "87654321-4321-6789-4321-abcdef012345";

export default function BluetoothScreen() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [receivedMessage, setReceivedMessage] = useState<string | null>(null);
  const [messageToSend, setMessageToSend] = useState(''); // State to store the message to send

  useEffect(() => {
    requestPermissions();
    return () => bleManager.destroy();
  }, []);

  // Request Bluetooth permissions for Android
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Bluetooth requires location permission',
          buttonPositive: 'Allow',
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Location permission is required for BLE');
      }
    }
  };

  // Automatically scan and connect to ESP32
  const connectToESP32 = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    setConnectionStatus('Searching for ESP32...');

    let deviceFound = false; // Track if ESP32 is found

    bleManager.startDeviceScan(null, { allowDuplicates: false }, async (error, device) => {
      if (error) {
        console.error('Scan error:', error);
        setIsConnecting(false);
        setConnectionStatus('Error during scan');
        return;
      }

      if (device?.name === ESP32_DEVICE_NAME) {
        deviceFound = true; // ESP32 was found
        bleManager.stopDeviceScan();
        setConnectionStatus(`Connecting to ${device.name}...`);

        try {
          const connected = await device.connect();
          setConnectedDevice(connected);
          setConnectionStatus(`Connected to ${device.name}! ✅`);
          await connected.requestMTU(512);
          await connected.discoverAllServicesAndCharacteristics();
          setupNotifications(connected);
        } catch (error) {
          console.error('Connection error:', error);
          setConnectionStatus('Connection failed');
        } finally {
          setIsConnecting(false);
        }
      }
    });

    // Stop scan after 10 seconds if no ESP32 is found
    setTimeout(() => {
      bleManager.stopDeviceScan();
      setIsConnecting(false);
      if (!deviceFound) {
        setConnectionStatus('ESP32 not found. Try again.');
      }
    }, 10000);
  };


  // Subscribe to ESP32 Notifications (Receive Data)
  const setupNotifications = async (device: Device) => {
    try {
      device.monitorCharacteristicForService(
        ESP32_SERVICE_UUID,
        ESP32_CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('Notification error:', error);
            return;
          }
          if (characteristic?.value) {
            const decodedValue = base64.decode(characteristic.value);
            setReceivedMessage(decodedValue);
            console.log('Received from ESP32:', decodedValue);
          }
        }
      );
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  // Send Commands to ESP32
  const sendCommand = async () => {
    if (!connectedDevice) {
      Alert.alert('Error', 'No device connected');
      return;
    }
    if (!messageToSend.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    try {
      await connectedDevice.writeCharacteristicWithResponseForService(
        ESP32_SERVICE_UUID,
        ESP32_CHARACTERISTIC_UUID,
        base64.encode(messageToSend)
      );
      console.log('Sent to ESP32:', messageToSend);
      setMessageToSend(''); // Clear the input after sending
    } catch (error) {
      console.error('Send command error:', error);
      Alert.alert('Error', 'Failed to send command');
    }
  };

  // Disconnect from ESP32
  const disconnectFromESP32 = async () => {
    if (!connectedDevice) return;

    try {
      if (await connectedDevice.isConnected()) { // Check if still connected before disconnecting
        await connectedDevice.cancelConnection(); // Properly disconnect the device
        setConnectedDevice(null); // Clear the connected device state
        setConnectionStatus('Disconnected'); // Update connection status
        setReceivedMessage(null); // Clear any received messages
      } else {
        setConnectionStatus('Device already disconnected');
      }
    } catch (error) {
      console.error('Disconnection error:', error);
      Alert.alert('Error', 'Failed to disconnect');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        <Text style={styles.status}>{connectionStatus}</Text>

        {/* Button to Auto Connect to ESP32 */}
        {!connectedDevice && (
          <TouchableOpacity style={styles.connectButton} onPress={connectToESP32} disabled={isConnecting}>
            <Text style={styles.buttonText}>{isConnecting ? 'Connecting...' : 'Connect to ESP32'}</Text>
          </TouchableOpacity>
        )}

        {/* Button to Disconnect from ESP32 */}
        {connectedDevice && (
          <TouchableOpacity style={styles.connectButton} onPress={disconnectFromESP32}>
            <Text style={styles.buttonText}>Disconnect from ESP32</Text>
          </TouchableOpacity>
        )}

        {/* Show received message from ESP32 only if connected */}
        {connectedDevice && receivedMessage && (
          <Text style={styles.receivedMessage}>ESP32: {receivedMessage}</Text>
        )}

        {/* TextInput for sending a custom message */}
        {connectedDevice && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Type your message here"
              value={messageToSend}
              onChangeText={setMessageToSend}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendCommand}>
              <Text style={styles.buttonText}>Send Message</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 20, alignItems: 'center' },
  status: { fontSize: 16, textAlign: 'center', marginBottom: 20, fontWeight: 'bold' },
  connectButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, marginBottom: 20, width: 200, alignItems: 'center' },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: '600' },
  input: { height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginBottom: 20, width: 200 },
  sendButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, marginVertical: 5, width: 120, alignItems: 'center' },
  receivedMessage: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginVertical: 10, color: '#333' },
});
