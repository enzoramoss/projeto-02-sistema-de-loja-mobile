import { StyleSheet, View } from 'react-native';
import { useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


import styles from './styles';

import Login from './components/Login';
import CadastroDeClientes from './components/CadastroDeClientes';
import ListaProdutos from './components/ListaProdutos';
import Carrinho from './components/Carrinho';
import AreaAdmin from './components/AreaAdmin';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Login' component={Login} />
        <Stack.Screen name='Register' component={CadastroDeClientes} />
        <Stack.Screen name='AdminArea' component={AreaAdmin} />
        <Stack.Screen name='Products' component={ListaProdutos} />
        <Stack.Screen name='Cart' component={Carrinho} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// <View style={styles.container}>
//   {!registered ?
//     (<Login obj={{ register: registered }}
//       objLogged={{ logged: logged }}
//       setLogged={setLogged}
//       setRegistered={setRegistered}
//       usersStorage={AsyncStorage}
//       adminLogged={{ adminLog: adminLog }}
//       setAdminLogged={setAdminLog} />)
//     :
//     (<CadastroDeClientes
//       setRegistered={setRegistered}
//       obj={{ register: registered }}
//       AsyncStorage={AsyncStorage} />
//     )
//   }

//   {logged && <ListaProdutos />}

//   {adminLog && <AreaAdmin />}
// </View>

