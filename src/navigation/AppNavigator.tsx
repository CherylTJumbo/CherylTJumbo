import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AnalyzingScreen from '../screens/AnalyzingScreen';
import CaptureScreen from '../screens/CaptureScreen';
import DisclaimerScreen from '../screens/DisclaimerScreen';
import ExerciseDetailScreen from '../screens/ExerciseDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import HomeScreen from '../screens/HomeScreen';
import ResultsScreen from '../screens/ResultsScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator({ initialRouteName }: { initialRouteName: 'Disclaimer' | 'Home' }) {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName}>
        <Stack.Screen name="Disclaimer" component={DisclaimerScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Capture" component={CaptureScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Analyzing" component={AnalyzingScreen} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="Results" component={ResultsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ title: 'Exercise' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
