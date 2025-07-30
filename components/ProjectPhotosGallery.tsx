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
// import { Button } from 'components/terrain/button'; // Import de votre composant Button

// interface ProjectPhotosGalleryProps {
//   isOpen: boolean;
//   onClose: () => void;
//   photos: string[];
//   title?: string;
//   terrainCoordinates?: number[][];
//   initialTab?: 'photos' | 'map';
// }

// const ProjectPhotosGallery: React.FC<ProjectPhotosGalleryProps> = ({
//   isOpen,
//   onClose,
//   photos,
//   title = 'Photos',
//   terrainCoordinates,
//   initialTab = 'photos',
// }) => {
//   const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
//   const [activeTab, setActiveTab] = useState<'photos' | 'map'>(initialTab);

//   const { width: screenWidth } = Dimensions.get('window');
//   const photoHeight = screenWidth * 0.75;

//   useEffect(() => {
//     if (isOpen) {
//       setActiveTab(initialTab);
//     }
//   }, [isOpen, initialTab]);

//   const hasPhotos = photos && photos.length > 0;
//   const hasMapData = terrainCoordinates && terrainCoordinates.length >= 3;

//   if (!hasPhotos && !hasMapData) {
//     return null;
//   }

//   const handlePrevious = () => {
//     setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
//   };

//   const handleNext = () => {
//     setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
//   };

//   const handleThumbnailClick = (index: number) => {
//     setCurrentPhotoIndex(index);
//   };

//   const polygonCoordinates = terrainCoordinates
//     ? terrainCoordinates.map((coord) => ({
//         latitude: coord[0],
//         longitude: coord[1],
//       }))
//     : [];

//   const renderPhotoContent = () => {
//     if (!hasPhotos) return null;

//     return (
//       <View style={styles.photoContainer}>
//         <View style={[styles.mainPhotoContainer, { height: photoHeight }]}>
//           <Image
//             source={{ uri: photos[currentPhotoIndex] }}
//             style={styles.mainPhoto}
//             resizeMode="contain"
//           />

//           {photos.length > 1 && (
//             <>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onPress={handlePrevious}
//                 style={StyleSheet.flatten([styles.navButton, styles.prevButton])}
//                 icon={<MaterialCommunityIcons name="chevron-left" size={24} color="white" />}
//               />
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onPress={handleNext}
//                 style={StyleSheet.flatten([styles.navButton, styles.nextButton])}
//                 icon={<MaterialCommunityIcons name="chevron-right" size={24} color="white" />}
//               />
//             </>
//           )}

//           <View style={styles.photoCounter}>
//             <Text style={styles.photoCounterText}>
//               {currentPhotoIndex + 1} / {photos.length}
//             </Text>
//           </View>
//         </View>

//         {photos.length > 1 && (
//           <FlatList
//             horizontal
//             data={photos}
//             renderItem={({ item, index }) => (
//               <TouchableOpacity
//                 onPress={() => handleThumbnailClick(index)}
//                 style={[styles.thumbnail, index === currentPhotoIndex && styles.selectedThumbnail]}>
//                 <Image source={{ uri: item }} style={styles.thumbnailImage} resizeMode="cover" />
//               </TouchableOpacity>
//             )}
//             keyExtractor={(item, index) => index.toString()}
//             contentContainerStyle={styles.thumbnailsContainer}
//           />
//         )}
//       </View>
//     );
//   };

//   const renderMapContent = () => {
//     if (!hasMapData)
//       return (
//         <View style={styles.noMapDataContainer}>
//           <Text style={styles.noMapDataText}>Aucune donnée de carte disponible</Text>
//         </View>
//       );

//     return (
//       <View style={styles.mapContainer}>
//         <MapView
//           style={styles.map}
//           initialRegion={{
//             latitude: polygonCoordinates[0].latitude,
//             longitude: polygonCoordinates[0].longitude,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           }}>
//           <UrlTile
//             urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             maximumZ={19}
//             tileSize={256}
//           />
//           <Polygon
//             coordinates={polygonCoordinates}
//             strokeColor="red"
//             fillColor="rgba(255,0,0,0.3)"
//             strokeWidth={2}
//           />
//         </MapView>
//       </View>
//     );
//   };

//   return (
//     <Modal visible={isOpen} animationType="slide" transparent={false} onRequestClose={onClose}>
//       <View style={styles.modalContainer}>
//         <View style={styles.header}>
//           <Text style={styles.title}>{title}</Text>
//           <Button
//             variant="ghost"
//             size="icon"
//             onPress={onClose}
//             icon={<MaterialCommunityIcons name="close" size={24} color="#000" />}
//           />
//         </View>

//         <Text style={styles.description}>
//           {hasPhotos && hasMapData
//             ? 'Naviguez entre les photos et la carte du terrain'
//             : hasPhotos
//               ? 'Parcourez les photos du terrain'
//               : "Visualisez l'emplacement du terrain"}
//         </Text>

//         {hasPhotos && hasMapData && (
//           <View style={styles.tabsContainer}>
//             <Button
//               variant={activeTab === 'photos' ? 'secondary' : 'ghost'}
//               size="sm"
//               onPress={() => setActiveTab('photos')}
//               title="Photos"
//               style={styles.tabButton}
//             />
//             <Button
//               variant={activeTab === 'map' ? 'secondary' : 'ghost'}
//               size="sm"
//               onPress={() => setActiveTab('map')}
//               title="Carte"
//               style={styles.tabButton}
//             />
//           </View>
//         )}

//         <View style={styles.contentContainer}>
//           {hasPhotos && hasMapData
//             ? activeTab === 'photos'
//               ? renderPhotoContent()
//               : renderMapContent()
//             : hasPhotos
//               ? renderPhotoContent()
//               : renderMapContent()}
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
//   },
//   description: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 16,
//   },
//   tabsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     gap: 8,
//     marginBottom: 16,
//   },
//   tabButton: {
//     flex: 1,
//   },
//   contentContainer: {
//     flex: 1,
//   },
//   photoContainer: {
//     flex: 1,
//   },
//   mainPhotoContainer: {
//     width: '100%',
//     backgroundColor: '#f5f5f5',
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
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     borderRadius: 20,
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
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//   },
//   photoCounterText: {
//     color: 'white',
//     fontSize: 12,
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
//     borderColor: '#3b82f6',
//   },
//   thumbnailImage: {
//     width: '100%',
//     height: '100%',
//   },
//   noMapDataContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//     borderRadius: 8,
//   },
//   noMapDataText: {
//     color: '#666',
//   },
//   mapContainer: {
//     flex: 1,
//     borderRadius: 8,
//     overflow: 'hidden',
//   },
//   map: {
//     flex: 1,
//   },
// });

// export default ProjectPhotosGallery;
