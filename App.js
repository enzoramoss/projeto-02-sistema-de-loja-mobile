import { StyleSheet, Text, View } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage'

import { useState } from 'react';

import Login from './components/Login';
import CadastroDeClientes from './components/CadastroDeClientes';
import ListaProdutos from './components/ListaProdutos';
import Carrinho from './components/Carrinho';
import AreaAdmin from './components/AreaAdmin';

export default function App() {
  const [logged, setLogged] = useState(false);
  const [registered, setRegistered] = useState(false);

  const [users, setUsers] = useState([]);


  return (
    <View style={styles.container}>
      {!registered ? (<Login obj={{register: registered}} setRegistered={setRegistered} usersStorage={AsyncStorage} />) : (<CadastroDeClientes setRegistered={setRegistered} obj={{register: registered}} AsyncStorage={AsyncStorage}/>)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
