import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Surface, Text, TextInput, Button, useTheme, Divider, ActivityIndicator } from 'react-native-paper';
import { useAuth, Config } from '../../context/auth-context';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../../components/BackButton';
import LoadingOverlay from '../../components/LoadingOverlay';

export default function AccountScreen() {
  const { user, config, fetchConfig, updateConfig, logout } = useAuth();
  const theme = useTheme();
  const navigation = useNavigation<any>();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Config>>({});

  useEffect(() => {
    const init = async () => {
      await fetchConfig();
      setLoading(false);
    };
    init();
  }, []);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.navigate('Home')} />
        <Text variant="headlineSmall" style={styles.headerTitle}>खाता र सेटिङहरू</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Profile Summary */}
          <Surface elevation={1} style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
            <Text variant="titleMedium" style={styles.sectionTitle}>प्रयोगकर्ता विवरण</Text>
            <View style={styles.profileInfo}>
              <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>{user?.name}</Text>
              <Text variant="bodyMedium" style={{ opacity: 0.7 }}>{user?.email}</Text>
            </View>
          </Surface>

          {/* Application Settings */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionHeader}>एप सेटिङहरू (Application)</Text>
            <Surface elevation={1} style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
              <TextInput
                label="गुगल API कुञ्जी (Google API KEY)"
                value={formData.google_api_key}
                onChangeText={(v) => updateField('google_api_key', v)}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="डोमेन (Domain)"
                value={formData.domain}
                onChangeText={(v) => updateField('domain', v)}
                mode="outlined"
                style={styles.input}
              />
            </Surface>
          </View>

          {/* Whatsapp Settings */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionHeader}>व्हाट्सएप सेटिङहरू (Whatsapp)</Text>
            <Surface elevation={1} style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
              <TextInput
                label="व्हाट्सएप एक्सेस टोकन (Access Token)"
                value={formData.whatsapp_access_token}
                onChangeText={(v) => updateField('whatsapp_access_token', v)}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />
              <TextInput
                label="व्हाट्सएप भेरिफाई टोकन (Verify Token)"
                value={formData.whatsapp_verify_token}
                onChangeText={(v) => updateField('whatsapp_verify_token', v)}
                mode="outlined"
                style={styles.input}
              />
            </Surface>
          </View>

          {/* Model Settings */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionHeader}>मोडेल सेटिङहरू (AI Model)</Text>
            <Surface elevation={1} style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
              <TextInput
                label="प्रणाली प्रम्प्ट (System Prompt)"
                value={formData.system_prompt}
                onChangeText={(v) => updateField('system_prompt', v)}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.input}
              />
              <TextInput
                label="मोडेलको नाम (Model Name)"
                value={formData.model_name}
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
          >
            सेटिङहरू सुरक्षित गर्नुहोस्
          </Button>

          <Divider style={styles.divider} />

          <Button 
            mode="outlined" 
            onPress={() => logout()} 
            textColor={theme.colors.error}
            style={[styles.logoutBtn, { borderColor: theme.colors.error }]}
          >
            बाहिर निस्कनुहोस् (Logout)
          </Button>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 8,
    opacity: 0.6,
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
    fontWeight: 'bold',
    opacity: 0.8,
  },
  formCard: {
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  saveBtn: {
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  divider: {
    marginVertical: 24,
  },
  logoutBtn: {
    borderRadius: 12,
    borderWidth: 1.5,
  },
});
