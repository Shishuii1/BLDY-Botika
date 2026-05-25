// Root mobile app — navigation wired in Step 2+
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PharmaSys</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#10B981',
    fontSize: 24,
    fontWeight: '600',
  },
});
