import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/auth-context';

const Icon = MaterialCommunityIcons as any;
import BackButton from '../../components/BackButton';

export default function CategoryDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params || { id: 'new' };
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  const { categories, addCategory, editCategory, deleteCategory } = useAuth();
  
  const isNew = id === 'new';
  const existingCategory = !isNew ? categories.find(c => c.id === Number(id)) : null;

  const [title, setTitle] = useState(existingCategory?.title || '');
  const [description, setDescription] = useState(existingCategory?.description || '');

  useEffect(() => {
    if (!isNew && !existingCategory) {
      navigation.goBack();
    }
  }, [isNew, existingCategory]);

  const handleSave = async () => {
    if (!title) {
      Alert.alert('त्रुटि', 'वर्गको नाम अनिवार्य छ।');
      return;
    }
    const data = { title, description };

    let success = false;
    if (isNew) {
      success = await addCategory(data);
    } else {
      success = await editCategory(Number(id), data);
    }

    if (success) {
      navigation.goBack();
    } else {
      Alert.alert('त्रुटि', 'वर्ग सुरक्षित गर्न सकिएन');
    }
  };

  const handleDelete = () => {
    Alert.alert('मेटाउन निश्चित हुनुहुन्छ?', 'के तपाईं यो वर्ग हटाउन चाहनुहुन्छ?', [
      { text: 'रद्द गर्नुहोस्', style: 'cancel' },
      { text: 'हटाउनुहोस्', style: 'destructive', onPress: async () => {
        const success = await deleteCategory(Number(id));
        if (success) navigation.goBack();
      }}
    ]);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: theme.colors.background }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 64 + insets.bottom }]}>
        <BackButton />
        <Surface elevation={3} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.headerRow}>
            <Icon name="view-grid-plus" size={32} color={theme.colors.onSurface} />
            <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
              {isNew ? 'नयाँ वर्ग थप्नुहोस्' : 'वर्ग सम्पादन गर्नुहोस्'}
            </Text>
          </View>
          
          <TextInput
            label="नाम"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="विवरण"
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
              labelStyle={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }} 
            >
              सुरक्षित गर्नुहोस्
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
  container: { padding: 20, paddingTop: 32 },
  card: { padding: 24, borderRadius: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  input: { marginBottom: 16, backgroundColor: 'transparent' },
  actions: { marginTop: 24, gap: 16 },
  saveBtn: { borderRadius: 12 },
  deleteBtn: { borderRadius: 12, borderColor: '#ef4444' },
  btnContent: { paddingVertical: 6 },
  btnLabel: { fontSize: 16, fontWeight: 'bold' },
});
