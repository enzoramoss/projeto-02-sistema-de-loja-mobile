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
  const [adminLog, setAdminLog] = useState(false)

  return (
    <View style={styles.container}>
      {!registered ?
        (<Login obj={{ register: registered }}
          objLogged={{ logged: logged }}
          setLogged={setLogged}
          setRegistered={setRegistered}
          usersStorage={AsyncStorage}
          adminLogged={{ adminLog: adminLog }}
          setAdminLogged={setAdminLog} />)
        :
        (<CadastroDeClientes
          setRegistered={setRegistered}
          obj={{ register: registered }}
          AsyncStorage={AsyncStorage} />
        )
      }

      {logged && <ListaProdutos />}
      
      {adminLog && <AreaAdmin />}
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
