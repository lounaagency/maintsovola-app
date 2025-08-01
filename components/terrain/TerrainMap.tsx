import { View, Text, StyleSheet } from 'react-native';
import MapView, { Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import React, { useState } from 'react';

const TerrainMap = () => {
  const [drawnCoords, setDrawnCoords] = useState<{ latitude: number; longitude: number }[]>([]);

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -18.913684,
          longitude: 47.536131,
          latitudeDelta: 2,
          longitudeDelta: 2,
        }}
        onPress={(e) => {
          const { coordinate } = e.nativeEvent;
          setDrawnCoords([...drawnCoords, coordinate]);
          console.log('Hell');
        }}>
        {drawnCoords.length >= 3 && (
          <Polygon
            coordinates={drawnCoords}
            strokeColor="red"
            fillColor="rgba(255,0,0,0.3)"
            strokeWidth={2}
          />
        )}
      </MapView>
    </View>
  );
};

export default TerrainMap;
const styles = StyleSheet.create({
  mapContainer: {
    height: 300,
  },
  map: {
    flex: 1,
  },
});
