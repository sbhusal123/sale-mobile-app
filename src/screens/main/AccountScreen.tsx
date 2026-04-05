import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Surface, Text, TextInput, Button, useTheme, Divider, ActivityIndicator, IconButton } from 'react-native-paper';
import { useAuth, Config } from '../../context/auth-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import LoadingOverlay from '../../components/LoadingOverlay';
import ShimmerPlaceholder from '../../components/ShimmerPlaceholder';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Icon = MaterialCommunityIcons as any;

export default function AccountScreen() {
  const { user, config, fetchConfig, updateConfig, logout } = useAuth();
  const theme = useTheme();
  const navigation = useNavigation<any>();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Config>>(config || {});

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        setLoading(true);
        await fetchConfig();
        setLoading(false);
      };
      init();
    }, [])
  );

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    const success = await updateConfig(formData);
    setSaving(false);
    if (success) {
      Alert.alert('सफलता', 'सेटिङहरू सफलतापूर्वक सुरक्षित गरियो।');
    } else {
      Alert.alert('त्रुटि', 'सेटिङहरू सुरक्षित गर्न सकिएन।');
    }
  };

  const updateField = (field: keyof Config, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderShimmer = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Surface elevation={1} style={[styles.profileCard, { backgroundColor: theme.colors.surface, borderColor: 'transparent' }]}>
        <ShimmerPlaceholder width={72} height={72} borderRadius={24} />
        <View style={styles.profileInfo}>
          <ShimmerPlaceholder width={120} height={24} style={{ marginBottom: 8 }} />
          <ShimmerPlaceholder width={180} height={16} />
        </View>
      </Surface>
      {[1, 2, 3].map(i => (
        <View key={i} style={styles.section}>
          <ShimmerPlaceholder width={100} height={20} style={{ marginBottom: 12, marginLeft: 4 }} />
          <Surface elevation={1} style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: 'transparent' }]}>
            <ShimmerPlaceholder width="100%" height={40} borderRadius={8} style={{ marginBottom: 16 }} />
            <ShimmerPlaceholder width="100%" height={40} borderRadius={8} />
          </Surface>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader 
        title="खाता र सेटिङहरू" 
        onMenu={() => navigation.openDrawer()} 
      />

      {loading ? renderShimmer() : (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Profile Summary */}
          <Surface elevation={1} style={[styles.profileCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
            <View style={[styles.avatarBox, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Icon name="account" size={40} color={theme.colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text variant="titleLarge" style={[styles.userName, { color: theme.colors.onSurface }]}>{user?.name}</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{user?.email}</Text>
            </View>
          </Surface>

          <Divider style={{ marginVertical: 8, backgroundColor: 'transparent' }} />

          {/* Application Settings */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={[styles.sectionHeader, { color: theme.colors.onSurface }]}>एप सेटिङहरू</Text>
            <Surface elevation={1} style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
              <TextInput
                label="गूगल API कुञ्जी (Google API KEY)"
                value={formData?.google_api_key || ''}
                onChangeText={(v) => updateField('google_api_key', v)}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="डोमेन (Domain)"
                value={formData?.domain || ''}
                onChangeText={(v) => updateField('domain', v)}
                mode="outlined"
                style={styles.input}
              />
            </Surface>
          </View>

          {/* Whatsapp Settings */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={[styles.sectionHeader, { color: theme.colors.onSurface }]}>व्हाट्सएप सेटिङहरू</Text>
            <Surface elevation={1} style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
              <TextInput
                label="व्हाट्सएप एक्सेस टोकन (Access Token)"
                value={formData?.whatsapp_access_token || ''}
                onChangeText={(v) => updateField('whatsapp_access_token', v)}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />
              <TextInput
                label="व्हाट्सएप भेरिफाई टोकन (Verify Token)"
                value={formData?.whatsapp_verify_token || ''}
                onChangeText={(v) => updateField('whatsapp_verify_token', v)}
                mode="outlined"
                style={styles.input}
              />
            </Surface>
          </View>

          {/* Model Settings */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={[styles.sectionHeader, { color: theme.colors.onSurface }]}>मोडेल सेटिङहरू</Text>
            <Surface elevation={1} style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
              <TextInput
                label="प्रणाली प्रम्प्ट (System Prompt)"
                value={formData?.system_prompt || ''}
                onChangeText={(v) => updateField('system_prompt', v)}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.input}
              />
              <TextInput
                label="मोडेलको नाम (Model Name)"
                value={formData?.model_name || ''}
                onChangeText={(v) => updateField('model_name', v)}
                mode="outlined"
                placeholder="e.g. gpt-4, gemini-pro"
                style={styles.input}
              />
            </Surface>
          </View>

          <Button 
            mode="contained" 
            onPress={handleSave} 
            style={styles.saveBtn}
            loading={saving}
            disabled={saving}
            buttonColor={theme.colors.primary}
            textColor="#fff"
          >
            सेटिङहरू सुरक्षित गर्नुहोस्
          </Button>

          <Divider style={styles.divider} />

          <Button 
            mode="outlined" 
            onPress={() => logout()} 
            textColor={theme.colors.error}
            style={[styles.logoutBtn, { borderColor: theme.colors.error }]}
            icon="logout"
          >
            लग आउट गर्नुहोस्
          </Button>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    )}

      <LoadingOverlay visible={saving} message="सुरक्षित हुँदैछ..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  profileCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
  },
  avatarBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontWeight: '900',
  },
  profileInfo: {
    gap: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
    marginLeft: 4,
    fontWeight: '900',
  },
  formCard: {
    padding: 20,
    borderRadius: 24,
    gap: 16,
    borderWidth: 1,
  },
  input: {
    backgroundColor: 'transparent',
  },
  saveBtn: {
    marginTop: 8,
    borderRadius: 16,
    paddingVertical: 4,
    elevation: 4,
  },
  divider: {
    marginVertical: 32,
    opacity: 0.5,
  },
  logoutBtn: {
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 4,
  },
});
