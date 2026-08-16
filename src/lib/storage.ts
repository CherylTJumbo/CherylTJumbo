import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from './types';

const SESSIONS_KEY = '@physio_buddy/sessions';
const DISCLAIMER_KEY = '@physio_buddy/disclaimer_acknowledged';

export async function loadSessions(): Promise<Session[]> {
  const raw = await AsyncStorage.getItem(SESSIONS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Session[];
    return parsed.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function saveSession(session: Session): Promise<void> {
  const sessions = await loadSessions();
  sessions.unshift(session);
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 100)));
}

export async function clearSessions(): Promise<void> {
  await AsyncStorage.removeItem(SESSIONS_KEY);
}

export async function hasAcknowledgedDisclaimer(): Promise<boolean> {
  const value = await AsyncStorage.getItem(DISCLAIMER_KEY);
  return value === 'true';
}

export async function acknowledgeDisclaimer(): Promise<void> {
  await AsyncStorage.setItem(DISCLAIMER_KEY, 'true');
}
