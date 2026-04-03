import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface } from 'react-native-paper';

import { useAuth } from '@/app/context/auth-context';

export default function ProductEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  
  const { products, categories, addProduct, editProduct, deleteProduct } = useAuth();
  
  const isNew = id === 'new';
  const existingProduct = !isNew ? products.find(p => p.id === id) : null;

  const [title, setTitle] = useState(existingProduct?.title || '');
  const [price, setPrice] = useState(existingProduct?.unitPrice?.toString() || '');
  const [stock, setStock] = useState(existingProduct?.stockQty?.toString() || '');
  const [imageUrl, setImageUrl] = useState(existingProduct?.images?.[0] || '');
  const [categoryId, setCategoryId] = useState(existingProduct?.categoryId || (categories[0]?.id ?? ''));

  useEffect(() => {
    if (!isNew && !existingProduct) {
      router.replace('/products');
    }
  }, [isNew, existingProduct, router]);

  const handleSave = () => {
    if (!title) {
      Alert.alert('त्रुटि', 'उत्पादनको नाम अनिवार्य छ।');
      return;
    }
    const productData = {
      title,
      unitPrice: parseFloat(price) || 0,
      stockQty: parseInt(stock, 10) || 0,
      categoryId,
      images: imageUrl ? [imageUrl] : ['https://via.placeholder.com/240x170.png?text=Product'],
    };

    if (isNew) {
      addProduct(productData);
    } else {
      editProduct(id as string, productData);
    }
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('मेटाउन निश्चित हुनुहुन्छ?', 'के तपाईं यो उत्पादन स्थायी रूपमा हटाउन चाहनुहुन्छ?', [
      { text: 'रद्द गर्नुहोस् (Cancel)', style: 'cancel' },
      { text: 'हटाउनुहोस् (Delete)', style: 'destructive', onPress: () => {
        deleteProduct(id as string);
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
          <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, fontWeight: 'bold', marginBottom: 24 }}>
            {isNew ? 'नयाँ उत्पादन थप्नुहोस्' : 'उत्पादन सम्पादन गर्नुहोस्'}
          </Text>
          
          <TextInput
            label="उत्पादनको नाम (Title)"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="मूल्य (Price)"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Affix text="₹ " />}
          />
          <TextInput
            label="स्टक मात्रा (In Stock)"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="छवि URL (Image URL)"
            value={imageUrl}
            onChangeText={setImageUrl}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
          />

          <View style={styles.actions}>
            <Button 
              mode="contained" 
              onPress={handleSave} 
              style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
              contentStyle={styles.btnContent}
              labelStyle={styles.btnLabel}
            >
              खारेज गर्नुहोस् (Save)
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
  container: {
    padding: 16,
    paddingTop: 32,
    paddingBottom: 64,
  },
  card: {
    padding: 24,
    borderRadius: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  actions: {
    marginTop: 24,
    gap: 16,
  },
  saveBtn: {
    borderRadius: 12,
  },
  deleteBtn: {
    borderRadius: 12,
    borderColor: '#ef4444',
  },
  btnContent: {
    paddingVertical: 6,
  },
  btnLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
