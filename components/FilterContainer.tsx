import { View, Text, Pressable } from 'react-native';
import FilterLabel from './FilterLabel';

type FilterContainerProps = {
    labels: string[];
    onRemove: (label: string) => void;
};

export default function FilterContainer ({ labels, onRemove }: FilterContainerProps) {
    return (
        <View className='bg-gray-200 p-2 rounded-lg flex-row flex-wrap gap-2 mb-4'>
            <Text className='text-gray-700 font-semibold'>Filtres:</Text>
            {labels.map((label, index) => (
                <FilterLabel key={index} label={label} onRemove={() => onRemove(label)} />
            ))}
            <Pressable onPress={() => labels.forEach(label => onRemove(label))}>
                <Text className='text-gray-500 underline'>Effacer les filtres</Text>
            </Pressable>
        </View>
    )
}