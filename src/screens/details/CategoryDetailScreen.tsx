import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import AppHeader from '../../components/AppHeader';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/auth-context';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Icon = MaterialCommunityIcons as any;

export default function CategoryDetailScreen() {
  const { t } = useTranslation();
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
  const [isSaving, setIsSaving] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(t('common.saving') || 'Saving...');

  useEffect(() => {
    if (!isNew && !existingCategory) {
      navigation.goBack();
    }
  }, [isNew, existingCategory]);

  const handleSave = async () => {
    if (!title) {
      Alert.alert(t('common.error'), (t('category_detail.name') || 'Name') + ' ' + (t('common.required') || 'is required'));
      return;
    }

    const categoryData = {
      title,
      description,
    };

    setLoadingMessage(t('common.saving') || 'Saving...');
    setIsSaving(true);
    let success = false;
    if (isNew) {
      const res = await addCategory(categoryData);
      success = !!res;
    } else {
      success = await editCategory(Number(id), categoryData);
    }
    setIsSaving(false);

    if (success) {
      navigation.goBack();
    } else {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const handleDelete = () => {
    Alert.alert(t('category_detail.delete_confirm'), t('common.confirm_delete'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'), style: 'destructive', onPress: async () => {
          setLoadingMessage(t('common.deleting') || 'Deleting...');
          setIsSaving(true);
          const success = await deleteCategory(Number(id));
          setIsSaving(false);
          if (success) navigation.goBack();
        }
      }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader 
        title={isNew ? t('category_detail.add_title') : t('category_detail.title')} 
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
          <View style={styles.headerIcon}>
            <Surface elevation={0} style={[styles.iconSurface, { backgroundColor: theme.colors.primary + '15' }]}>
              <Icon name="tag-plus-outline" size={48} color={theme.colors.primary} />
            </Surface>
            <Text variant="headlineSmall" style={[styles.titleText, { color: theme.colors.onSurface }]}>
              {isNew ? t('categories.add_new') || 'Add Category' : t('categories.edit') || 'Edit Category'}
            </Text>
          </View>

          <Surface elevation={2} style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1 }]}>
            <View style={styles.inputGap}>
              <TextInput
                label={t('category_detail.name')}
                value={title}
                onChangeText={setTitle}
                mode="outlined"
                style={styles.input}
                outlineStyle={{ borderRadius: 18 }}
                left={<TextInput.Icon icon="tag-text-outline" color={theme.colors.primary} />}
              />

              <TextInput
                label={t('category_detail.description')}
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                multiline
                numberOfLines={5}
                style={[styles.input, { minHeight: 140 }]}
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
      <LoadingOverlay visible={isSaving} message={loadingMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: 24,
  },
  headerIcon: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconSurface: {
    width: 90,
    height: 90,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    transform: [{ rotate: '-4deg' }],
  },
  titleText: {
    fontWeight: '900',
    letterSpacing: -0.5,
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
