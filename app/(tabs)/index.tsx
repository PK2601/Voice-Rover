import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { Asset } from 'expo-asset';

type GLTFResult = {
  scene: THREE.Scene;
};

// const ModelViewer = () => {
//   const glbPath = require('../src/components/car.glb');
//   const { scene } = useGLTF(glbPath) as unknown as GLTFResult;

//   return <primitive object={scene} scale={1} />;
// }


// const ModelViewer = () => {
//   // Use expo-asset to load the GLB model
//   const modelPath = Asset.fromModule(require('../../assets/car.glb')).uri;

//   const { scene } = useGLTF(modelPath) as unknown as GLTFResult;

//   return <primitive object={scene} scale={1} />;
// };

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold">3D Model</ThemedText>
      {/* <View style={styles.window}>
        <Canvas style={styles.canvas}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />
          <OrbitControls />
          <ModelViewer />
        </Canvas>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  window: {
    width: 500,
    height: 500,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
    padding: 10,
  },
  canvas: {
    flex: 1,
    width: '100%',
  },
});
