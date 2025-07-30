import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Web-compatible MapView component
const MapView: React.FC<any> = ({ style, children, ...props }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.placeholderText}>Carte non disponible sur le web</Text>
        <Text style={styles.subText}>Utilisez l'application mobile pour voir la carte</Text>
      </View>
    </View>
  );
};

// Web-compatible components that return null
const Polygon: React.FC<any> = () => null;
const UrlTile: React.FC<any> = () => null;
const Marker: React.FC<any> = () => null;
const Callout: React.FC<any> = () => null;
const Circle: React.FC<any> = () => null;
const Polyline: React.FC<any> = () => null;
const Heatmap: React.FC<any> = () => null;
const Overlay: React.FC<any> = () => null;
const PROVIDER_GOOGLE = 'google';
const PROVIDER_DEFAULT = 'default';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default MapView;
export { 
  Polygon, 
  UrlTile, 
  Marker, 
  Callout, 
  Circle, 
  Polyline, 
  Heatmap, 
  Overlay,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT
}; 