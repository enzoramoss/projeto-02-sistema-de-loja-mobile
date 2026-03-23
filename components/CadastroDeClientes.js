import { Text, View, TextInput, TouchableOpacity } from 'react-native'
import { useEffect, useState } from 'react'

import AsyncStorage from '@react-native-async-storage/async-storage'

import styles from '../styles';

export default function CadastroDeClientes({ navigation }) {

    const [name, setName] = useState('')
    const [password, setPassword] = useState('')

    function register() {
        if (name.trim() !== '' && password.trim() !== '') {
            setName('')
            setPassword('')
            navigation.navigate('Login', { name, password })
        }
    }

    function navLogin() {
        navigation.navigate('Login')
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Cadastro</Text>


            <TextInput placeholder='Nome do usuário' style={styles.input} />
            <TextInput placeholder='Senha do usuário' style={styles.input} />

            <TouchableOpacity style={{ marginTop: '5px', backgroundColor: '#007bff', padding: '10px', borderRadius: '3px' }} onPress={register}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Registrar</Text>
            </TouchableOpacity>

            <Text style={styles.text}>Ainda não possui uma conta? {<TouchableOpacity style={{color: 'blue', textDecorationLine: 'underline'}} onPress={navLogin}>Clique aqui!</TouchableOpacity>}</Text>
        </View>
    );
}