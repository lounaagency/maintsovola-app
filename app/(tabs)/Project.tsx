import { View , Text, ScrollView , StyleSheet, TouchableOpacity} from 'react-native'
import React, { useState } from 'react'
// import {ChevronRight, ChevronLeft} from "lucide-react-native"

const Project = () => {
    const [selected, setSelected] = useState("en_attente");
  return (
        <View className='w-full'>
            <View className='border border-1 border-gray-400 h-fit items-center py-2 relative flex flex-row bg-gray-200'>
                <ScrollView horizontal={true} style={styles.scroll} showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity onPress={() => setSelected('en_attente')} className='mx-2'><Text style={[styles.text, selected === 'en_attente' && styles.selected]}>En attente</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => setSelected('finance')} className='mx-2'> <Text style={[styles.text, selected === 'finance' && styles.selected]}>Financement 100%</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => setSelected('fonds')} className='mx-2'><Text style={[styles.text, selected === 'fonds' && styles.selected]}>Levée de fonds</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => setSelected('en_prod')} className='mx-2'><Text style={[styles.text, selected === 'en_prod' && styles.selected]}>En production</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => setSelected('termine')} className='mx-2'><Text style={[styles.text, selected === 'termine' && styles.selected]}>Terminés</Text></TouchableOpacity>
                </ScrollView>
            </View>
        </View>
  )  
}
const styles = StyleSheet.create({
    scroll: {
        // marginTop: 50,
        paddingHorizontal: 10,
    },
    text: {
        fontSize: 14,
        color: '#000',
    },
    selected: {
        color: '#009900',
        fontWeight: 'bold',
        
    },
  })
export default Project