import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';

import styles from '../styles';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({ navigation }) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  const [users, setUsers] = useState([])

  const [permanentName, setPermanentName] = useState('admin')
  const [permanentPassword, setPermanentPassword] = useState('root')

  function login() {
    if (name.trim() !== '' && password.trim() !== '') {
      setName('')
      setPassword('')
      navigation.navigate('Cart', { name, password })
    }

    if (name.trim() === permanentName && password.trim() === permanentPassword) {
      setName('')
      setPassword('')
      navigation.navigate('AdminArea')
    }
  }

  function navRegister() {
    navigation.navigate('Register')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Login</Text>

      <TextInput
        placeholder='Nome do usuário'
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder='Senha do usuário'
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity style={{ marginTop: '5px', backgroundColor: '#007bff', padding: '10px', borderRadius: '3px' }} onPress={login}>
        <Text style={{ color: 'white', fontWeight: 'bold'}}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.text}>Ainda não possui uma conta? {<TouchableOpacity style={{color: 'blue', textDecorationLine: 'underline'}} onPress={navRegister}>Registre-se!</TouchableOpacity>}</Text>
    </View>
  );
}
