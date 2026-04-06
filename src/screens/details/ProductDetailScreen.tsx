import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Button, Menu, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ImageViewer from '../../components/ImageViewer';
import AppHeader from '../../components/AppHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getImageUri } from '../../utils/url';
import { useAuth } from '../../context/auth-context';

const Icon = MaterialCommunityIcons as any;

export default function ProductDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params || { id: 'new' };
  const theme = useTheme();
  const insets = useSafeAreaInsets();

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
  const [viewerVisible, setViewerVisible] = useState(false);

  useEffect(() => {
    if (!isNew && !existingProduct) {
      navigation.goBack();
    }
  }, [isNew, existingProduct]);

  const selectedCategory = categories.find(c => c.id === categoryId);

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.9,
    });

    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert('त्रुटि', result.errorMessage || 'तस्बिर चयन गर्न सकिएन');
      return;
    }

    if (result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri || '');
    }
  };

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
      { text: 'रद्द गर्नुहोस्', style: 'cancel' },
      {
        text: 'हटाउनुहोस्', style: 'destructive', onPress: async () => {
          const success = await deleteProduct(Number(id));
          if (success) navigation.goBack();
        }
      }
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <AppHeader 
        title={isNew ? 'नयाँ उत्पादन' : 'सम्पादन गर्नुहोस्'} 
        showBack 
        onBack={() => navigation.goBack()} 
      />
      
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 64 + insets.bottom }]}>
        <Surface elevation={1} style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>

          <TextInput
            label="उत्पादनको नाम"
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
                {selectedCategory ? selectedCategory.title : 'वर्ग चयन गर्नुहोस्'}
              </Button>
            }
            contentStyle={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }}
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
            label="मूल्य"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Affix text="₹ " />}
          />
          <TextInput
            label="स्टक मात्रा"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
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
          <View style={styles.imagePickerSection}>
            <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>उत्पादनको छवि</Text>
            {image ? (
              <View style={[styles.imagePreviewContainer, { borderColor: theme.colors.outline }]}>
                <TouchableOpacity onPress={() => setViewerVisible(true)} style={{ flex: 1 }}>
                  <Image source={{ uri: getImageUri(image) || '' }} style={styles.previewImage} resizeMode="cover" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePickImage} style={styles.changeImageOverlay}>
                  <Icon name="camera-reverse" size={20} color="#fff" />
                  <Text style={styles.changeImageText}>तस्बिर परिवर्तन गर्नुहोस्</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={handlePickImage} 
                style={[styles.pickImageBtn, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}
              >
                <View style={[styles.pickImageIconContainer, { backgroundColor: theme.colors.surface }]}>
                  <Icon name="camera-plus" size={32} color={theme.colors.primary} />
                </View>
                <Text variant="labelLarge" style={{ color: theme.colors.primary, marginTop: 12, fontWeight: '900' }}>
                  तस्बिर चयन गर्नुहोस्
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveBtn}
              contentStyle={styles.btnContent}
              labelStyle={styles.btnLabel}
              buttonColor={theme.colors.primary}
              textColor="#fff"
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
                हटाउनुहोस्
              </Button>
            )}
          </View>
        </Surface>
      </ScrollView>
      <ImageViewer
        visible={viewerVisible}
        imageUri={getImageUri(image)}
        onClose={() => setViewerVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
  },
  card: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
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
    borderRadius: 14,
    elevation: 4,
  },
  deleteBtn: {
    borderRadius: 14,
    marginTop: 8,
  },
  btnContent: {
    paddingVertical: 6,
  },
  btnLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePickerSection: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    opacity: 0.7,
  },
  pickImageBtn: {
    height: 160,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickImageIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imagePreviewContainer: {
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  changeImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  changeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
