import { View, Text, StyleSheet } from 'react-native';
import MapView, { Circle, MapPressEvent, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import { Button } from 'react-native-paper';
import React, { useState } from 'react';

const TerrainMap = ({
  drawnCoords,
  setDrawnCoords,
}: {
  drawnCoords: { latitude: number; longitude: number }[];
  setDrawnCoords: React.Dispatch<React.SetStateAction<{ latitude: number; longitude: number }[]>>;
}) => {
  const [isDrawing, setIsDrawing] = useState(false);

  const toggleDrawingMode = () => {
    setIsDrawing((prev) => !prev);
    if (!isDrawing) {
      // If starting drawing, clear existing polygon
      setDrawnCoords([]);
    }
  };
  const clearPolygon = () => {
    setDrawnCoords([]);
    setIsDrawing(false);
  };
  function sortCoordinatesClockwise(coords: { latitude: number; longitude: number }[]) {
    const center = coords.reduce(
      (acc, curr) => ({
        latitude: acc.latitude + curr.latitude / coords.length,
        longitude: acc.longitude + curr.longitude / coords.length,
      }),
      { latitude: 0, longitude: 0 }
    );

    return coords
      .map((coord) => ({
        ...coord,
        angle: Math.atan2(coord.latitude - center.latitude, coord.longitude - center.longitude),
      }))
      .sort((a, b) => a.angle - b.angle)
      .map(({ latitude, longitude }) => ({ latitude, longitude }));
  }

  return (
    <View>
      <Text className="text-muted-foreground text-sm">
        Dessinez le contour de votre terrain sur la carte (facultatif). Les terrains existants sont
        affichés en gris.
      </Text>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: -18.913684,
            longitude: 47.536131,
            latitudeDelta: 2,
            longitudeDelta: 2,
          }}
          onPress={(event) => {
            if (isDrawing) {
              const { coordinate } = event.nativeEvent;
              setDrawnCoords([...drawnCoords, coordinate]);
            }
          }}>
          {drawnCoords.map((coord, index) => (
            <Circle key={index} center={coord} radius={100} strokeColor="blue" fillColor="blue" />
          ))}
          {drawnCoords.length > 2 && (
            <Polygon
              coordinates={sortCoordinatesClockwise(drawnCoords)}
              strokeColor="red"
              fillColor="rgba(255,0,0,0.3)"
              strokeWidth={2}
            />
          )}
        </MapView>
        <View style={styles.buttonContainer}>
          <Button style={styles.button} onPress={toggleDrawingMode}>
            {isDrawing ? 'Stop Drawing' : 'Start Drawing'}
          </Button>
          <Button style={styles.button} onPress={clearPolygon} disabled={drawnCoords.length === 0}>
            Clear Polygon
          </Button>
        </View>
      </View>
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
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: 'white',
  },
});
