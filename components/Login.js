// projeto-2/components/Login.js
import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import styles from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_STORAGE_KEY = '@users_list';

export default function Login({ navigation }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState([]);

  const PERMANENT_NAME = 'admin';
  const PERMANENT_PASSWORD = 'root';

  // 1. Carrega os usuários do AsyncStorage ao montar o componente
  useEffect(() => {
    async function loadUsers() {
      try {
        const storedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
        if (storedUsers !== null) {
          setUsers(JSON.parse(storedUsers));
        }
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      }
    }
    loadUsers();
  }, []); // [] -> executa apenas na montagem

  // 2. Salva o array de usuários no AsyncStorage sempre que ele mudar
  useEffect(() => {
    async function saveUsers() {
      try {
        await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      } catch (error) {
        console.error('Erro ao salvar usuários:', error);
      }
    }
    // Evita sobrescrever com array vazio no primeiro render (antes do load terminar)
    if (users.length > 0) {
      saveUsers();
    }
  }, [users]); // [users] -> executa toda vez que users mudar

  function login() {
    const trimmedName = name.trim();
    const trimmedPassword = password.trim();

    if (trimmedName === '' || trimmedPassword === '') {
      alert('Atenção, preencha todos os campos.');
      return;
    }

    // Verifica login de admin
    if (trimmedName === PERMANENT_NAME && trimmedPassword === PERMANENT_PASSWORD) {
      setName('');
      setPassword('');
      navigation.navigate('AdminArea');
      return;
    }

    // Verifica login contra usuários cadastrados no AsyncStorage
    const foundUser = users.find(
      (u) => u.name === trimmedName && u.password === trimmedPassword
    );

    if (foundUser) {
      setName('');
      setPassword('');
      navigation.navigate('Cart', { name: trimmedName, password: trimmedPassword });
    } else {
      alert('Erro, usuário ou senha inválidos.');
    }
  }

  function navRegister() {
    navigation.navigate('Register', { users, setUsers });
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
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity
        style={{ marginTop: 5, backgroundColor: '#007bff', padding: 10, borderRadius: 3 }}
        onPress={login}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Login</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <Text style={styles.text}>Ainda não possui uma conta? </Text>
        <TouchableOpacity onPress={navRegister}>
          <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>
            Registre-se!
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
