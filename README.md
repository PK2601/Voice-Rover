# 🤖🔊 Voice-Rover — ESP32 Bluetooth Voice-Controlled Robot Car

Voice-Rover is a Bluetooth Low Energy (BLE) robot car powered by the ESP32 microcontroller and controlled via a **custom-built iOS mobile app**. It enables intuitive bidirectional communication for real-time robot movement using simple text or voice commands.

This project demonstrates a full-stack embedded solution combining **hardware**, **BLE communication**, and a **user-friendly mobile interface**.

---

## 🚀 Features

- 📱 **iOS BLE App**
  - Built with React Native & BLE PLX
  - Auto-scans and connects to ESP32
  - Sends control commands and displays ESP32 responses

- 🔁 **Bidirectional BLE Communication**
  - Sends commands like `forward`, `backward`, `stop`, etc.
  - ESP32 confirms received instructions via BLE notifications

- ⚙️ **Motor Control via ESP32**
  - Real-time control of two DC motors using L298N or similar driver
  - Cleanly mapped to basic direction logic

---

## 📦 Repository Structure

```
Voice-Rover/
│
├── /BLE App/app/(tabs)                    # React Native App (iOS)
│   ├── index.tsx
│   ├── explore.tsx
│   └── _layout.tsx
│
├── ESP32/BLEWorkingCode                   # Arduino code for ESP32
│   └── BLEWorkingCode.ino
│
├── CAD Model/                              # CAD files
│   ├── 
│   └── 
│
└── README.md
```

---

## 🧠 Project Motivation

During development, we noticed a lack of intuitive BLE-based apps on iOS to control ESP32-based devices. We designed our own interface focused on **user experience** and **reliable control**, and integrated it with a robust firmware running on the ESP32.

---

## 📱 App Overview

The iOS app automatically scans for the ESP32 device, connects, and allows users to input or voice-send commands. BLE messages are base64-encoded and decoded to ensure smooth communication.

| Connect Screen | Command Interface |
|----------------|-------------------|
| *(Insert screenshot here)* | *(Insert screenshot here)* |

---

## 🔧 ESP32 Firmware Highlights

- Sets up BLE server with a custom service/characteristic
- Listens for messages from the app
- Executes movement based on simple string commands:
  - `forward`
  - `backward`
  - `left`
  - `right`
  - `stop`
- Sends acknowledgment messages back to the app

> Firmware is located in `/esp32/BLEWorkingCode.ino`

---

## 🛠️ Hardware Components

| Part                         | Quantity |
|------------------------------|----------|
| ESP32 WROOM-32               | 1        |
| TB6612FNG Dual Motor Driver  | 2        |
| N20 DC Gear MotoR            | 4        |
| Tank Track Kit (Chassis)     | 1        |
| Time of Flight Sensor        | 3        |
| Custom 3D Printed Chassis    | 1        |

> 🛠️ Note: The tank track components are currently pending delivery. The CAD model is ready, but due to extended print time and limited McMaster Makerspace access, physical integration is in progress and will be updated soon.

---

## 🧩 CAD Model & Robot Design

### 📐 Render Preview  
*(Insert render or assembly image here)*

### 📁 CAD Files  


## 🔧 Setup Instructions

### ESP32 Firmware

1. Install [Arduino IDE](https://www.arduino.cc/en/software)
2. Install ESP32 board support via Board Manager
3. Install required libraries: `BLEDevice`, `BLEUtils`, `BLE2902`
4. Open `BLEWorkingCode.ino` from `/esp32`
5. Update motor pin numbers as needed
6. Upload to your ESP32 board

### React Native App

1. Install [Node.js](https://nodejs.org/) and [Expo CLI](https://docs.expo.dev)
2. Navigate to `/app` and install dependencies:
   ```bash
   npm install
   ```
3. Run the app:
   ```bash
   npx expo start
   ```
4. Scan the QR code on an iOS device using Expo Go

---

## 📡 BLE Configuration

| Property           | Value                                      |
|--------------------|--------------------------------------------|
| Device Name        | `ESP32_Bluetooth`                          |
| Service UUID       | `12345678-1234-5678-1234-56789abcdef0`      |
| Characteristic UUID| `87654321-4321-6789-4321-abcdef012345`      |

All commands and responses are encoded in base64 during transmission.

---

## 🧭 Future Work

- 🔲 Add obstacle detection (ultrasonic or IR)
- 🎙️ Integrate speech-to-text for full voice control
- 🧱 Complete 3D print assembly and mounting
- 📲 Publish the app on TestFlight

---

© 2025 — Voice-Rover BLE Robot
