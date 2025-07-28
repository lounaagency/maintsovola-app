// app/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '~/contexts/AuthContext';

import '../../global.css'

export default function Index() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace('/feed'); // ou '/(tabs)/feed'
    } else {
      router.replace('/(auth)/login');
    }
  }, [user]);

  return null;
}