import { StyleSheet, Text, View, TextInput, Button } from 'react-native'
import { useEffect, useState } from 'react'

export default function CadastroDeClientes({ AsyncStorage, setRegistered, obj }) {
    const [user, setUser] = useState({
        id: Date.now().toString(),
        name: '',
        password: ''
    })

    const [canMove, setCanMove] = useState(false)

    useEffect(() => {
        async function saveUser() {
            try {
                const jsonValue = JSON.stringify(user)
                await AsyncStorage.setItem('user', jsonValue)
            } catch (e) {
                console.log(e)
            }
        }

        if (user.name !== '' && user.password !== '') {
            saveUser()
            setCanMove(true)
        }
    }, [user])

    return (
        <View>
            <Text>Cadastro de Clientes</Text>


            <TextInput placeholder='Nome' onChangeText={text => setUser({ ...user, name: text })} />
            <TextInput placeholder='Senha' onChangeText={(text) => setUser({ ...user, password: text })} />

            <Button onPress={() => (canMove && setRegistered(false))} title='Registrar-se'/>

            <Button onPress={obj.register && (() => setRegistered(false))} title='Login'/>
        </View>
    );
}