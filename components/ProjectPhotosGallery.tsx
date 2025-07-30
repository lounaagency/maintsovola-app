// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   Modal,
//   StyleSheet,
//   Dimensions,
//   FlatList,
//   TouchableOpacity,
// } from 'react-native';
// import MapView, { Polygon, UrlTile } from 'react-native-maps';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { Button } from 'components/terrain/button';
// import { X } from 'lucide-react-native';

// interface ProjectPhotosGalleryProps {
//   isOpen: boolean;
//   onClose: () => void;
//   photos: string[];
//   title?: string;
//   terrainCoordinates?: Array<{ latitude: number; longitude: number }>;
//   initialTab?: 'photos' | 'map';
// }

// // const ProjectPhotosGallery: React.FC<ProjectPhotosGalleryProps> = ({
// //   isOpen,
// //   onClose,
// //   photos,
// //   title = 'Photos',
// //   terrainCoordinates,
// //   initialTab = 'photos',
// // }) => {
// //   const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
// //   const [activeTab, setActiveTab] = useState<'photos' | 'map'>(initialTab);

// //   const { width: screenWidth } = Dimensions.get('window');
// //   const photoHeight = screenWidth * 0.75;

//   useEffect(() => {
//     if (isOpen) {
//       setActiveTab(initialTab);
//       setCurrentPhotoIndex(0);
//     }
//   }, [isOpen, initialTab]);

//   // Vérification des données - même logique que TerrainCard
//   const validPhotos = Array.isArray(photos) ? photos.filter(photo => photo && photo.trim() !== '') : [];
//   const hasPhotos = validPhotos.length > 0;
//   const hasMapData = Array.isArray(terrainCoordinates) && terrainCoordinates.length >= 3;

//   console.log('ProjectPhotosGallery render:', {
//     isOpen,
//     hasPhotos,
//     photosCount: validPhotos.length,
//     hasMapData,
//     title
//   });

//   const handlePrevious = () => {
//     if (validPhotos.length > 1) {
//       setCurrentPhotoIndex((prev) => (prev === 0 ? validPhotos.length - 1 : prev - 1));
//     }
//   };

//   const handleNext = () => {
//     if (validPhotos.length > 1) {
//       setCurrentPhotoIndex((prev) => (prev === validPhotos.length - 1 ? 0 : prev + 1));
//     }
//   };

// //   const handleThumbnailClick = (index: number) => {
// //     setCurrentPhotoIndex(index);
// //   };

//   const renderPhotoContent = () => {
//     if (!hasPhotos) {
//       return (
//         <View style={styles.noDataContainer}>
//           <MaterialCommunityIcons name="image-off" size={48} color="#9CA3AF" />
//           <Text style={styles.noDataText}>Aucune photo disponible</Text>
//         </View>
//       );
//     }

//     return (
//       <View style={styles.photoContainer}>
//         <View style={[styles.mainPhotoContainer, { height: photoHeight }]}>
//           {validPhotos[currentPhotoIndex] && (
//             <Image
//               source={{ uri: validPhotos[currentPhotoIndex] }}
//               style={styles.mainPhoto}
//               resizeMode="contain"
//               onError={(error) => console.log('❌ Erreur chargement photo:', error)}
//             />
//           )}

//           {validPhotos.length > 1 && (
//             <>
//               <TouchableOpacity
//                 style={[styles.navButton, styles.prevButton]}
//                 onPress={handlePrevious}
//               >
//                 <MaterialCommunityIcons name="chevron-left" size={24} color="white" />
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 style={[styles.navButton, styles.nextButton]}
//                 onPress={handleNext}
//               >
//                 <MaterialCommunityIcons name="chevron-right" size={24} color="white" />
//               </TouchableOpacity>
//             </>
//           )}

//           <View style={styles.photoCounter}>
//             <Text style={styles.photoCounterText}>
//               {currentPhotoIndex + 1} / {validPhotos.length}
//             </Text>
//           </View>
//         </View>

//         {validPhotos.length > 1 && (
//           <FlatList
//             horizontal
//             data={validPhotos}
//             renderItem={({ item, index }) => (
//               <TouchableOpacity
//                 onPress={() => handleThumbnailClick(index)}
//                 style={[styles.thumbnail, index === currentPhotoIndex && styles.selectedThumbnail]}
//               >
//                 <Image source={{ uri: item }} style={styles.thumbnailImage} resizeMode="cover" />
//               </TouchableOpacity>
//             )}
//             keyExtractor={(item, index) => index.toString()}
//             contentContainerStyle={styles.thumbnailsContainer}
//             showsHorizontalScrollIndicator={false}
//           />
//         )}
//       </View>
//     );
//   };

//   const renderMapContent = () => {
//     if (!hasMapData) {
//       return (
//         <View style={styles.noDataContainer}>
//           <MaterialCommunityIcons name="map-marker-off" size={48} color="#9CA3AF" />
//           <Text style={styles.noDataText}>Aucune donnée de carte disponible</Text>
//         </View>
//       );
//     }

//     return (
//       <View style={styles.mapContainer}>
//         <MapView
//           style={styles.map}
//           initialRegion={{
//             latitude: terrainCoordinates![0].latitude,
//             longitude: terrainCoordinates![0].longitude,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           }}
//         >
//           <UrlTile
//             urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             maximumZ={19}
//             tileSize={256}
//           />
//           <Polygon
//             coordinates={terrainCoordinates!}
//             strokeColor="red"
//             fillColor="rgba(255,0,0,0.3)"
//             strokeWidth={2}
//           />
//         </MapView>
//       </View>
//     );
//   };

//   // MÊME STRUCTURE QUE TerrainCard
//   return (
//     <Modal visible={isOpen} animationType="fade" onRequestClose={onClose}>
//       <View style={styles.modalContainer}>
//         {/* Header identique à TerrainCard */}
//         <View style={styles.header}>
//           <Text style={styles.title}>{title}</Text>
//           <Button
//             variant="ghost"
//             size="icon"
//             onPress={onClose}
//             icon={<X size={24} color="#000" />}
//           />
//         </View>

//         <Text style={styles.description}>
//           {hasPhotos && hasMapData
//             ? 'Naviguez entre les photos et la carte du terrain'
//             : hasPhotos
//               ? `${validPhotos.length} photo${validPhotos.length > 1 ? 's' : ''} disponible${validPhotos.length > 1 ? 's' : ''}`
//               : hasMapData
//                 ? "Visualisez l'emplacement du terrain"
//                 : "Aucun contenu disponible pour ce terrain"}
//         </Text>

//         {/* Tabs comme dans TerrainCard */}
//         {hasPhotos && hasMapData && (
//           <View style={styles.tabsContainer}>
//             <Button
//               variant={activeTab === 'photos' ? 'secondary' : 'ghost'}
//               size="sm"
//               onPress={() => setActiveTab('photos')}
//               title={`Photos (${validPhotos.length})`}
//             />
//             <Button
//               variant={activeTab === 'map' ? 'secondary' : 'ghost'}
//               size="sm"
//               onPress={() => setActiveTab('map')}
//               title="Carte"
//             />
//           </View>
//         )}

//         {/* Contenu scrollable comme TerrainCard */}
//         <View style={styles.contentContainer}>
//           {!hasPhotos && !hasMapData ? (
//             <View style={styles.emptyStateContainer}>
//               <MaterialCommunityIcons name="image-off" size={64} color="#9CA3AF" />
//               <Text style={styles.emptyStateTitle}>Aucun contenu disponible</Text>
//               <Text style={styles.emptyStateText}>
//                 Il n'y a ni photos ni données de carte pour ce terrain.
//               </Text>
//             </View>
//           ) : hasPhotos && hasMapData ? (
//             activeTab === 'photos' ? renderPhotoContent() : renderMapContent()
//           ) : hasPhotos ? (
//             renderPhotoContent()
//           ) : (
//             renderMapContent()
//           )}
//         </View>

//         {/* Footer comme TerrainCard */}
//         <View style={styles.footer}>
//           <Button 
//             variant="outline" 
//             onPress={onClose} 
//             style={{ flex: 1 }} 
//             title="Fermer"
//           />
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'white',
//     padding: 16,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#10B981',
//   },
//   description: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   tabsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     gap: 8,
//     marginBottom: 16,
//   },
//   contentContainer: {
//     flex: 1,
//   },
//   photoContainer: {
//     flex: 1,
//   },
//   mainPhotoContainer: {
//     width: '100%',
//     backgroundColor: '#F5F5F5',
//     borderRadius: 8,
//     overflow: 'hidden',
//     marginBottom: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//   },
//   mainPhoto: {
//     width: '100%',
//     height: '100%',
//   },
//   navButton: {
//     position: 'absolute',
//     top: '50%',
//     marginTop: -20,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 20,
//     padding: 8,
//     zIndex: 1,
//   },
//   prevButton: {
//     left: 16,
//   },
//   nextButton: {
//     right: 16,
//   },
//   photoCounter: {
//     position: 'absolute',
//     bottom: 16,
//     right: 16,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//   },
//   photoCounterText: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   thumbnailsContainer: {
//     paddingHorizontal: 8,
//   },
//   thumbnail: {
//     width: 64,
//     height: 64,
//     borderRadius: 4,
//     marginRight: 8,
//     overflow: 'hidden',
//     borderWidth: 2,
//     borderColor: 'transparent',
//   },
//   selectedThumbnail: {
//     borderColor: '#10B981',
//   },
//   thumbnailImage: {
//     width: '100%',
//     height: '100%',
//   },
//   noDataContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F9FAFB',
//     borderRadius: 8,
//     padding: 32,
//   },
//   noDataText: {
//     color: '#6B7280',
//     fontSize: 16,
//     marginTop: 8,
//     textAlign: 'center',
//   },
//   emptyStateContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 32,
//   },
//   emptyStateTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#374151',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptyStateText: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//     lineHeight: 20,
//   },
//   mapContainer: {
//     flex: 1,
//     borderRadius: 8,
//     overflow: 'hidden',
//   },
//   map: {
//     flex: 1,
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingTop: 16,
//     gap: 8,
//   },
// });

// export default ProjectPhotosGallery;