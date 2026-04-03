import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, Text, Button, useTheme, Avatar } from 'react-native-paper';

import { useAuth } from '@/app/context/auth-context';

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  const onLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={[styles.header, { color: theme.colors.onBackground }]}>
        खाता
      </Text>
      
      <Surface elevation={2} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.profileSection}>
          <Avatar.Text 
            size={64} 
            label={user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'} 
            style={{ backgroundColor: theme.colors.primary }}
            color="#fff"
          />
          <View style={styles.profileInfo}>
            <Text variant="titleLarge" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
              {user?.name ?? 'अज्ञात प्रयोगकर्ता'}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, opacity: 0.8 }}>
              {user?.email ?? 'कुनै इमेल सम्बद्ध छैन'}
            </Text>
          </View>
        </View>

        <Button 
          mode="contained" 
          buttonColor="#d22d29"
          textColor="#ffffff"
          style={styles.logoutBtn} 
          contentStyle={{ paddingVertical: 6 }}
          onPress={onLogout}
        >
          बाहिर निस्कनुहोस्
        </Button>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  header: {
    fontWeight: 'bold',
    marginBottom: 20,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 24,
  },
  profileSection: {
    alignItems: 'center',
    gap: 16,
  },
  profileInfo: {
    alignItems: 'center',
  },
  logoutBtn: {
    width: '100%',
    borderRadius: 12,
  },
});