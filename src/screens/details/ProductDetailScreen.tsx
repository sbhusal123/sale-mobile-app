import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface, Menu } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/auth-context';

import BackButton from '../../components/BackButton';

export default function ProductDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params || { id: 'new' };
  const theme = useTheme();
  
  const { products, categories, addProduct, editProduct, deleteProduct } = useAuth();
  
  const isNew = id === 'new';
  const existingProduct = !isNew ? products.find(p => p.id === Number(id)) : null;

  const [name, setName] = useState(existingProduct?.name || '');
  const [description, setDescription] = useState(existingProduct?.description || '');
  const [price, setPrice] = useState(existingProduct?.price?.toString() || '');
  const [quantity, setQuantity] = useState(existingProduct?.quantity?.toString() || '0');
  const [image, setImage] = useState(existingProduct?.image || '');
  const [categoryId, setCategoryId] = useState<number | null>(existingProduct?.category?.id || (categories[0]?.id ?? null));
  
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (!isNew && !existingProduct) {
      navigation.goBack();
    }
  }, [isNew, existingProduct]);

  const selectedCategory = categories.find(c => c.id === categoryId);

  const handleSave = async () => {
    if (!name) {
      Alert.alert('त्रुटि', 'उत्पादनको नाम अनिवार्य छ।');
      return;
    }
    if (!categoryId) {
      Alert.alert('त्रुटि', 'कृपया वर्ग चयन गर्नुहोस्');
      return;
    }

    const productData: any = {
      name,
      description,
      price: price || "0",
      quantity: parseInt(quantity, 10) || 0,
      category: categoryId,
      image: image || null,
      instock: parseInt(quantity, 10) > 0,
      search_tags: existingProduct?.search_tags || "[]",
      attributes: existingProduct?.attributes || {},
    };

    let success = false;
    if (isNew) {
      success = await addProduct(productData);
    } else {
      success = await editProduct(Number(id), productData);
    }

    if (success) {
      navigation.goBack();
    } else {
      Alert.alert('त्रुटि', 'उत्पादन सुरक्षित गर्न सकिएन');
    }
  };

  const handleDelete = () => {
    Alert.alert('मेटाउन निश्चित हुनुहुन्छ?', 'के तपाईं यो उत्पादन स्थायी रूपमा हटाउन चाहनुहुन्छ?', [
      { text: 'रद्द गर्नुहोस् (Cancel)', style: 'cancel' },
      { text: 'हटाउनुहोस् (Delete)', style: 'destructive', onPress: async () => {
        const success = await deleteProduct(Number(id));
        if (success) navigation.goBack();
      }}
    ]);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: theme.colors.background }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <BackButton />
        <Surface elevation={3} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, fontWeight: 'bold', marginBottom: 24 }}>
            {isNew ? 'नयाँ उत्पादन थप्नुहोस्' : 'उत्पादन सम्पादन गर्नुहोस्'}
          </Text>
          
          <TextInput
            label="उत्पादनको नाम (Name)"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button 
                mode="outlined" 
                onPress={() => setMenuVisible(true)}
                style={styles.input}
                contentStyle={{ justifyContent: 'space-between', flexDirection: 'row-reverse', height: 56 }}
                icon="chevron-down"
              >
                {selectedCategory ? selectedCategory.title : 'वर्ग चयन गर्नुहोस् (Select Category)'}
              </Button>
            }
            contentStyle={{ backgroundColor: theme.colors.surface }}
          >
            {categories.map((c) => (
              <Menu.Item 
                key={c.id} 
                onPress={() => {
                  setCategoryId(c.id);
                  setMenuVisible(false);
                }} 
                title={c.title} 
              />
            ))}
          </Menu>

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
            label="स्टक मात्रा (Quantity)"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
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
          <TextInput
            label="छवि URL (Image URL)"
            value={image}
            onChangeText={setImage}
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
              labelStyle={[styles.btnLabel, { color: '#fff' }]}
            >
              सुरक्षित गर्नुहोस् (Save)
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
