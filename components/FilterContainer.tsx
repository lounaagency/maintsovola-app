import { View, Text, Pressable } from 'react-native';
import FilterLabel from './FilterLabel';

type FilterContainerProps = {
    filters: Record<string, string>;
    onRemove: (key: string) => void;
    onClearAll: () => void;
};

export default function FilterContainer ({ filters, onRemove, onClearAll }: FilterContainerProps) {
    const filterEntries = Object.entries(filters);
    
    const getFilterLabel = (key: string, value: string) => {
        // Personnaliser l'affichage selon la clé
        switch (key) {
            case 'status':
                return `Statut: ${value}`;
            case 'region':
                return `Région: ${value}`;
            case 'district':
                return `District: ${value}`;
            case 'commune':
                return `Commune: ${value}`;
            case 'culture':
                return `Culture: ${value}`;
            case 'userId':
                return `Agriculteur: ${value}`;
            default:
                return `${key}: ${value}`;
        }
    };

    if (filterEntries.length === 0) {
        return null; // Ne rien afficher s'il n'y a pas de filtres
    }

    return (
        <View className='bg-gray-200 p-2 rounded-lg flex-row flex-wrap gap-2 mb-4'>
            <Text className='text-gray-700 font-semibold'>Filtres:</Text>
            {filterEntries.map(([key, value]) => (
                <FilterLabel 
                    key={key} 
                    label={getFilterLabel(key, value)} 
                    onRemove={() => onRemove(key)} 
                />
            ))}
            <Pressable onPress={onClearAll}>
                <Text className='text-gray-500 underline'>Effacer les filtres</Text>
            </Pressable>
        </View>
    )
}