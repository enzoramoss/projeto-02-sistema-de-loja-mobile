import { StyleSheet, Text, View, Button } from 'react-native';
import { useState, useEffect } from 'react';
import { TextInput } from 'react-native-web';

export default function Login({ usersStorage, setRegistered, obj }) {
  const [logged, setLogged] = useState(false)

  const [profile, setProfile] = useState(null)
  
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

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

  return (
    <View>
      <Text>Login</Text>

      <TextInput placeholder='Nome' onChangeText={setName} />
      <TextInput placeholder='Senha' onChangeText={setPassword} />

      {profile && (profile.name === name && profile.password === password) && <Text>Logado</Text>}

      <Button title='Entrar'/>

      <Button onPress={!obj.register && (() => setRegistered(true))} title='Registrar-se' />
    </View>
  );
}
