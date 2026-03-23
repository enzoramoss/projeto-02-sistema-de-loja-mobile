import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px'
  },

  input: {
    borderRadius: '7px',
    borderColor: 'black',
    borderWidth: '2px',
    width: '300px',
    height: '30px'
  },

  text: {
    fontWeight: '600',
    color: 'black',
  }
});

export default styles