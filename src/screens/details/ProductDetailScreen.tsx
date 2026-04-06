import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Button, Menu, Surface, Text, TextInput, useTheme, IconButton } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ImageViewer from '../../components/ImageViewer';
import AppHeader from '../../components/AppHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getImageUri } from '../../utils/url';
import { useAuth } from '../../context/auth-context';
import { useTranslation } from 'react-i18next';

const Icon = MaterialCommunityIcons as any;

export default function ProductDetailScreen() {
  const { t } = useTranslation();
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
      Alert.alert(t('common.error'), result.errorMessage || t('common.error'));
      return;
    }

    if (result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri || '');
    }
  };

  const handleSave = async () => {
    if (!name) {
      Alert.alert(t('common.error'), t('product_detail.name') + ' ' + t('common.error'));
      return;
    }
    if (!categoryId) {
      Alert.alert(t('common.error'), t('product_detail.select_category'));
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
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const handleDelete = () => {
    Alert.alert(t('product_detail.delete_confirm'), t('common.confirm_delete'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'), style: 'destructive', onPress: async () => {
          const success = await deleteProduct(Number(id));
          if (success) navigation.goBack();
        }
      }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader 
        title={isNew ? t('product_detail.add_title') : t('product_detail.title')} 
        showBack 
        onBack={() => navigation.goBack()} 
      />
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 64 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageSection}>
            {image ? (
              <View style={[styles.imageCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1 }]}>
                <TouchableOpacity onPress={() => setViewerVisible(true)} style={styles.imageTouch}>
                  <Image source={{ uri: getImageUri(image) || '' }} style={styles.heroImage} resizeMode="cover" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handlePickImage} 
                  style={[styles.cameraFloat, { backgroundColor: theme.colors.primary }]}
                >
                  <Icon name="camera" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={handlePickImage} 
                style={[styles.pickImageBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
              >
                <View style={[styles.pickImageIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Icon name="camera-plus-outline" size={32} color={theme.colors.primary} />
                </View>
                <Text variant="labelLarge" style={{ color: theme.colors.primary, marginTop: 12, fontWeight: '900' }}>
                  {t('common.add') || 'Add Image'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Surface elevation={2} style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1 }]}>
            <View style={styles.inputGap}>
              <TextInput
                label={t('product_detail.name')}
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                outlineStyle={{ borderRadius: 18 }}
                left={<TextInput.Icon icon="package-variant-closed" color={theme.colors.primary} />}
              />

              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <TouchableOpacity 
                    onPress={() => setMenuVisible(true)}
                    style={[styles.menuAnchor, { borderColor: theme.colors.outline, borderWidth: 1 }]}
                  >
                    <View style={styles.menuAnchorLeft}>
                      <Icon name="tag-outline" size={24} color={theme.colors.primary} style={{ marginRight: 12 }} />
                      <Text style={{ color: theme.colors.onSurface, fontWeight: '500' }}>
                        {selectedCategory ? selectedCategory.title : t('product_detail.select_category')}
                      </Text>
                    </View>
                    <Icon name="chevron-down" size={20} color={theme.colors.onSurfaceVariant} />
                  </TouchableOpacity>
                }
                contentStyle={{ backgroundColor: theme.colors.surface, borderRadius: 18 }}
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

              <View style={styles.rowInputs}>
                <TextInput
                  label={t('product_detail.price')}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  mode="outlined"
                  style={[styles.input, { flex: 1 }]}
                  outlineStyle={{ borderRadius: 18 }}
                  left={<TextInput.Affix text="₹ " />}
                />
                <TextInput
                  label={t('product_detail.quantity')}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  mode="outlined"
                  style={[styles.input, { flex: 1 }]}
                  outlineStyle={{ borderRadius: 18 }}
                  left={<TextInput.Icon icon="counter" color={theme.colors.primary} />}
                />
              </View>

              <TextInput
                label={t('product_detail.description')}
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={[styles.input, { minHeight: 120 }]}
                outlineStyle={{ borderRadius: 18 }}
                left={<TextInput.Icon icon="text-subject" color={theme.colors.primary} />}
              />
            </View>

            <View style={styles.actions}>
              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.saveBtn}
                contentStyle={styles.btnContent}
                labelStyle={styles.btnLabel}
                elevation={4}
              >
                {t('common.save')}
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
                  {t('common.delete')}
                </Button>
              )}
            </View>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>

      <ImageViewer
        visible={viewerVisible}
        imageUri={getImageUri(image)}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: 24,
  },
  imageSection: {
    marginBottom: 28,
  },
  imageCard: {
    height: 240,
    borderRadius: 32,
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
  },
  imageTouch: {
    width: '100%',
    height: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  cameraFloat: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    borderWidth: 3,
    borderColor: '#fff',
  },
  pickImageBtn: {
    height: 180,
    borderRadius: 32,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickImageIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCard: {
    padding: 24,
    borderRadius: 32,
  },
  inputGap: {
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  menuAnchor: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  menuAnchorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 16,
  },
  actions: {
    marginTop: 32,
    gap: 12,
  },
  saveBtn: {
    borderRadius: 20,
  },
  deleteBtn: {
    borderRadius: 20,
    marginTop: 4,
  },
  btnContent: {
    paddingVertical: 10,
  },
  btnLabel: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
