import { useState, useEffect } from 'react'
import { View, Text, TextInput, Image, Button } from 'react-native'

export default function AreaAdmin({ AsyncStorage, products }) {
    const [productObj, setProductObj] = useState({
        id: Date.now().toString(),
        name: '',
        description: '',
        price: ''
    })


    useEffect(() => {
        async function saveObj() {
            try {
                const productString = JSON.stringify(productObj)
                await AsyncStorage.setItem('product', productString)
            } catch (e) {
                console.log(e)
            }
        }

        if (productObj.name !== '' && productObj.description !== '' && productObj.price !== '') {
            saveObj()
        }
    }, [productObj])
    
    return (
        <View>
            <Text>Área do Administrador</Text>

            <TextInput
                placeholder='Nome do produto'
                onChangeText={ (text) => {setProductObj({ ...productObj, name: text })} }
            />

            <TextInput
                placeholder='Descrição do produto'
                onChangeText={ (text) => {setProductObj({ ...productObj, description: text })} }
            />

            <TextInput
                placeholder='Preço do produto'
                onChangeText={ (text) => {setProductObj({ ...productObj, price: text })} }
            />

            <Button title='Cadastrar produto'/>
        </View>
    );
}