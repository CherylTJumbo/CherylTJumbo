import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { hasAcknowledgedDisclaimer } from './src/lib/storage';

export default function App() {
  const [initialRouteName, setInitialRouteName] = useState<'Disclaimer' | 'Home' | null>(null);

  useEffect(() => {
    hasAcknowledgedDisclaimer().then((acknowledged) => {
      setInitialRouteName(acknowledged ? 'Home' : 'Disclaimer');
    });
  }, []);

  if (!initialRouteName) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#1f6feb" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator initialRouteName={initialRouteName} />
    </SafeAreaProvider>
  );
}
