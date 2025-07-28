import { View, Text, Pressable } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons";

type FilterLabelProps = {
    label: string;
    onRemove: () => void;
};

export default function FilterLabel({ label, onRemove }: FilterLabelProps) {
    return (
        <View className="self-start bg-green-600 rounded-full px-3 py-1 m-1 flex-row items-center gap-2">
            <Text className="text-white">{label}</Text>
            <Pressable onPress={onRemove}>
                <Ionicons name="close" size={16} color="white" />
            </Pressable>
        </View>
    )
}