import { Text, View, Button } from 'react-native';
import { useState, useEffect } from 'react';
import { TextInput } from 'react-native-web';

export default function Login({ usersStorage, setRegistered, obj, objLogged, setLogged, adminLogged, setAdminLogged }) {
  const [profile, setProfile] = useState(null)
  
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  const [permanentName, setPermanentName] = useState('admin')
  const [permanentPassword, setPermanentPassword] = useState('root')

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await usersStorage.getItem('user')

        if (user !== null) {
          setProfile(JSON.parse(user))
        }
      } catch (e) {
        console.log(e)
      }
    }
    
    loadUser()
  }, [])

  function clientLogin() {
    if (profile !== null) {
      if (profile.name === name && profile.password === password) {
        setLogged(true)
      }
    }
  }

  function adminLogin() {
    if (profile.name === permanentName && profile.password === permanentPassword) {
      setAdminLogged(true)
    }
  }

  return (
    <View>
      <Text>Login</Text>

      <TextInput placeholder='Nome' onChangeText={setName} />
      <TextInput placeholder='Senha' onChangeText={setPassword} />

      {profile && (profile.name === name && profile.password === password) && <Text>Logado</Text>}

      <Button onPress={!objLogged.logged ? (clientLogin()) : !adminLogged.adminLog && (adminLogin())} title='Entrar'/>

      <Button onPress={!obj.register && (() => setRegistered(true))} title='Registrar-se' />
    </View>
  );
}
