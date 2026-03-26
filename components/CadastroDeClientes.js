import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles';

const USERS_STORAGE_KEY = '@users_list';

export default function CadastroDeClientes({ navigation }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [users, setUsers] = useState(null); // null = ainda não carregou
  const [pendingRegister, setPendingRegister] = useState(false);

  // 1. Carrega a lista existente do AsyncStorage ao montar
  useEffect(() => {
    async function loadUsers() {
      try {
        const stored = await AsyncStorage.getItem(USERS_STORAGE_KEY);
        setUsers(stored !== null ? JSON.parse(stored) : []);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        setUsers([]);
      }
    }
    loadUsers();
  }, []);

  // 2. Salva e navega sempre que users mudar E houver um registro pendente
  useEffect(() => {
    if (!pendingRegister || users === null) return;

    async function saveAndNavigate() {
      try {
        await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        setPendingRegister(false);
        alert('Sucesso!', 'Usuário cadastrado com sucesso.');
        navigation.navigate('Login');
      } catch (error) {
        console.error('Erro ao salvar usuário:', error);
        alert('Erro', 'Não foi possível salvar o cadastro.');
      }
    }

    saveAndNavigate();
  }, [users, pendingRegister]);

  function register() {
    const trimmedName = name.trim();
    const trimmedPassword = password.trim();

    if (trimmedName === '' || trimmedPassword === '') {
      alert('Atenção, preencha todos os campos.');
      return;
    }

    if (users === null) {
      alert('Aguarde, carregando dados, tente novamente.');
      return;
    }

    if (trimmedPassword !== passwordConfirm) {
      alert('Atenção, confirme a sua senha!');
      return;
    }

    // Verifica se o usuário já existe
    const alreadyExists = users.some((u) => u.name === trimmedName);
    if (alreadyExists) {
      alert('Atenção, esse nome de usuário já está em uso.');
      return;
    }

    const newUser = { name: trimmedName, password: trimmedPassword };

    // Atualiza o estado — o useEffect acima cuida de salvar
    setUsers((prevUsers) => [...prevUsers, newUser]);
    setPendingRegister(true);
    setName('');
    setPassword('');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Cadastro</Text>

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
      <TextInput
        placeholder='Confirme a senha'
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
        style={styles.input}
      />

      <TouchableOpacity
        style={{ marginTop: 5, backgroundColor: '#007bff', padding: 10, borderRadius: 3 }}
        onPress={register}>

        <Text style={{ color: 'white', fontWeight: 'bold' }}>Registrar</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <Text style={styles.text}>Já possui uma conta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>
            Clique aqui!
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
