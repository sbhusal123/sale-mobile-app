import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuth } from '@/app/context/auth-context';

export default function CategoryEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  
  const { categories, addCategory, editCategory, deleteCategory } = useAuth();
  
  const isNew = id === 'new';
  const existingCategory = !isNew ? categories.find(c => c.id === id) : null;

  const [title, setTitle] = useState(existingCategory?.title || '');
  const [description, setDescription] = useState(existingCategory?.description || '');

  useEffect(() => {
    if (!isNew && !existingCategory) {
      router.replace('/categories');
    }
  }, [isNew, existingCategory, router]);

  const handleSave = () => {
    if (!title) {
      Alert.alert('त्रुटि', 'वर्गको नाम अनिवार्य छ।');
      return;
    }
    const data = { title, description };

    if (isNew) {
      addCategory(data);
    } else {
      editCategory(id as string, data);
    }
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('मेटाउन निश्चित हुनुहुन्छ?', 'के तपाईं यो वर्ग हटाउन चाहनुहुन्छ?', [
      { text: 'रद्द गर्नुहोस् (Cancel)', style: 'cancel' },
      { text: 'हटाउनुहोस् (Delete)', style: 'destructive', onPress: () => {
        deleteCategory(id as string);
        router.back();
      }}
    ]);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: theme.colors.background }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Surface elevation={3} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.headerRow}>
            <MaterialCommunityIcons name="view-grid-plus" size={32} color={theme.colors.onSurface} />
            <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
              {isNew ? 'नयाँ वर्ग थप्नुहोस्' : 'वर्ग सम्पादन गर्नुहोस्'}
            </Text>
          </View>
          
          <TextInput
            label="नाम (Title)"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="विवरण (Description)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <View style={styles.actions}>
            <Button 
              mode="contained" 
              onPress={handleSave} 
              style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
              contentStyle={styles.btnContent}
              labelStyle={{ color: '#31241f', fontSize: 16, fontWeight: 'bold' }} 
            >
              साइन इन गर्नुहोस् (Save)
            </Button>

            {!isNew && (
              <Button 
                mode="outlined" 
                onPress={handleDelete} 
                style={styles.deleteBtn}
                contentStyle={styles.btnContent}
                labelStyle={[styles.btnLabel, { color: theme.colors.error }]}
                textColor={theme.colors.error}
              >
                हटाउनुहोस् (Delete)
              </Button>
            )}
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 32, paddingBottom: 64 },
  card: { padding: 24, borderRadius: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  input: { marginBottom: 16, backgroundColor: 'transparent' },
  actions: { marginTop: 24, gap: 16 },
  saveBtn: { borderRadius: 12 },
  deleteBtn: { borderRadius: 12, borderColor: '#ef4444' },
  btnContent: { paddingVertical: 6 },
  btnLabel: { fontSize: 16, fontWeight: 'bold' },
});
