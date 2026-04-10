import { useRoute, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, useTheme, Surface, Avatar, ActivityIndicator, Divider, TextInput, Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppHeader from '../../components/AppHeader';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Icon = MaterialCommunityIcons as any;

export default function ChatUserDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params || {};
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get(`chat-users/${id}/`);
        setUser(res.data);
        setEditName(res.data.name || '');
        setEditPhone(res.data.phone || '');
        setEditEmail(res.data.email || '');
      } catch (err) {
        console.error('Fetch chat user err:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleUpdateCustomer = async () => {
    if (!editName || !editPhone) {
      Alert.alert(t('common.error', 'Error'), 'Name and Phone are required.');
      return;
    }
    setIsSaving(true);
    try {
      const response = await apiClient.patch(`chat-users/${id}/`, {
        name: editName,
        phone: editPhone,
        email: editEmail || null,
      });
      setUser(response.data);
      Alert.alert(t('common.success', 'Success'), 'Customer updated successfully');
      navigation.goBack();
    } catch (err) {
      console.error('Update user error:', err);
      Alert.alert(t('common.error', 'Error'), 'Failed to update customer');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      t('common.delete', 'Delete'),
      'Are you sure you want to delete this customer? This action cannot be undone.',
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        { text: t('common.delete', 'Delete'), style: 'destructive', onPress: handleDelete }
      ]
    );
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`chat-users/${id}/`);
      navigation.goBack();
    } catch (err) {
      console.error('Delete user error:', err);
      Alert.alert(t('common.error', 'Error'), 'Failed to delete customer');
      setIsDeleting(false);
    }
  };

  if (loading || isDeleting) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AppHeader title={t('order_detail.customer_info', 'Customer')} onMenu={() => navigation.goBack()} icon="arrow-left" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AppHeader title={t('order_detail.customer_info', 'Customer')} onMenu={() => navigation.goBack()} icon="arrow-left" />
        <View style={styles.center}>
          <Text style={{ color: theme.colors.error }}>Failed to load user details.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader
        title={t('common.edit', 'Edit Customer')}
        onMenu={() => navigation.goBack()}
        icon="arrow-left"
      />
      
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary + '15' }]}>
            <Avatar.Icon size={80} icon="account" style={{ backgroundColor: theme.colors.primary }} color="#FFFFFF" />
            <View style={[styles.statusDot, { backgroundColor: '#10B981', borderColor: theme.colors.background }]} />
          </View>
          <Text variant="headlineMedium" style={[styles.nameTitle, { color: theme.colors.onSurface }]}>
            {user.name || 'Unknown'}
          </Text>
          <View style={[styles.badge, { backgroundColor: theme.colors.primary + '15' }]}>
            <Icon name="star" size={14} color={theme.colors.primary} />
            <Text variant="labelMedium" style={{ color: theme.colors.primary, fontWeight: 'bold', marginLeft: 4 }}>
              {user.customer_type || 'Customer'}
            </Text>
          </View>

          <Surface elevation={1} style={[styles.orderCountBadge, { backgroundColor: theme.colors.error + '15' }]}>
            <Icon name="shopping-outline" size={16} color={theme.colors.error} />
            <Text variant="labelLarge" style={{ color: theme.colors.error, fontWeight: '900', marginLeft: 6 }}>
              Orders: {user.orders_count || 0}
            </Text>
          </Surface>
        </View>

        {/* Edit Form Card */}
        <Surface elevation={2} style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline + '40', borderWidth: 1 }]}>
          <View style={styles.formContent}>
            <TextInput
              label={t('order_detail.customer_name', 'Customer Name') + ' *'}
              value={editName}
              onChangeText={setEditName}
              mode="outlined"
              style={styles.input}
              outlineStyle={{ borderRadius: 16 }}
              left={<TextInput.Icon icon="account-outline" color={theme.colors.primary} />}
            />
            
            <TextInput
              label="Phone *"
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
              mode="outlined"
              style={styles.input}
              outlineStyle={{ borderRadius: 16 }}
              left={<TextInput.Icon icon="phone-outline" color={theme.colors.primary} />}
            />

            <TextInput
              label={t('order_detail.customer_email', 'Customer Email')}
              value={editEmail}
              onChangeText={setEditEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
              style={styles.input}
              outlineStyle={{ borderRadius: 16 }}
              left={<TextInput.Icon icon="email-outline" color={theme.colors.primary} />}
            />

            <Button
              mode="contained"
              onPress={handleUpdateCustomer}
              style={styles.saveBtn}
              contentStyle={styles.btnContent}
              loading={isSaving}
              disabled={isSaving}
            >
              {t('common.save', 'Save Changes')}
            </Button>
          </View>
        </Surface>

        <Button
          mode="text"
          textColor={theme.colors.error}
          icon="trash-can-outline"
          onPress={confirmDelete}
          style={{ marginTop: 24, alignSelf: 'center' }}
          disabled={isSaving}
        >
          {t('common.delete', 'Delete')} Customer
        </Button>
      </ScrollView>
      <LoadingOverlay visible={isDeleting} message={t('common.deleting', 'Deleting...')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  avatarContainer: {
    padding: 6,
    borderRadius: 60,
    marginBottom: 16,
    position: 'relative',
  },
  statusDot: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
  },
  nameTitle: {
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  orderCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  formContent: {
    padding: 24,
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  saveBtn: {
    borderRadius: 16,
    marginTop: 8,
  },
  btnContent: {
    paddingVertical: 6,
  },
});
