import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Menu, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BackButton from '../../components/BackButton';
import { useAuth } from '../../context/auth-context';

const Icon = MaterialCommunityIcons as any;

export default function OrderDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params || { id: 'new' };
  const theme = useTheme();

  const { orders, products, addOrder, editOrder, deleteOrder } = useAuth();

  const isNew = id === 'new';
  const existingOrder = !isNew ? orders.find(o => o.id === Number(id)) : null;

  const [productId, setProductId] = useState<number | null>(existingOrder?.product || null);
  const [qty, setQty] = useState(existingOrder?.quantity?.toString() || '1');
  const [totalPrice, setTotalPrice] = useState(existingOrder?.total_price?.toString() || '');
  const [location, setLocation] = useState(existingOrder?.location || '');
  const [phone, setPhone] = useState(existingOrder?.phone || '');
  const [specialInstructions, setSpecialInstructions] = useState(existingOrder?.special_instructions || '');
  const [orderStatus, setOrderStatus] = useState(existingOrder?.order_status || 'Pending');

  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (!isNew && !existingOrder) {
      navigation.goBack();
    }
  }, [isNew, existingOrder]);

  const selectedProduct = products.find(p => p.id === productId);

  const handleSave = async () => {
    if (!productId) {
      Alert.alert('त्रुटि', 'कृपया उत्पादन चयन गर्नुहोस्');
      return;
    }

    const data: any = {
      product: productId,
      quantity: parseInt(qty, 10) || 1,
      total_price: totalPrice || "0",
      location,
      phone,
      special_instructions: specialInstructions,
      order_status: orderStatus,
      chat_user: existingOrder?.chat_user || "",
      chat_session: existingOrder?.chat_session || "",
    };

    let success = false;
    if (isNew) {
      success = await addOrder(data);
    } else {
      success = await editOrder(Number(id), data);
    }

    if (success) {
      navigation.goBack();
    } else {
      Alert.alert('त्रुटि', 'अर्डर सुरक्षित गर्न सकिएन');
    }
  };

  const handleDelete = () => {
    Alert.alert('मेटाउन निश्चित हुनुहुन्छ?', 'के तपाईं यो अर्डर हटाउन चाहनुहुन्छ?', [
      { text: 'रद्द गर्नुहोस्', style: 'cancel' },
      {
        text: 'हटाउनुहोस्', style: 'destructive', onPress: async () => {
          const success = await deleteOrder(Number(id));
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
      <ScrollView contentContainerStyle={styles.container}>
        <BackButton />
        <Surface elevation={3} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.headerRow}>
            <Icon name="cart-plus" size={32} color={theme.colors.onSurface} />
            <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
              {isNew ? 'नयाँ अर्डर थप्नुहोस्' : 'अर्डर सम्पादन गर्नुहोस्'}
            </Text>
          </View>

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
                {selectedProduct ? selectedProduct.name : 'उत्पादन चयन गर्नुहोस्'}
              </Button>
            }
            contentStyle={{ backgroundColor: theme.colors.surface }}
          >
            {products.map((p) => (
              <Menu.Item
                key={p.id}
                onPress={() => {
                  setProductId(p.id);
                  setMenuVisible(false);
                }}
                title={p.name}
              />
            ))}
          </Menu>

          <TextInput
            label="मात्रा"
            value={qty}
            onChangeText={setQty}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="कुल मूल्य"
            value={totalPrice}
            onChangeText={setTotalPrice}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Affix text="₹ " />}
          />
          <TextInput
            label="ठेगाना"
            value={location}
            onChangeText={setLocation}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="सम्पर्क"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="अर्डरको स्थिति"
            value={orderStatus}
            onChangeText={setOrderStatus}
            mode="outlined"
            style={styles.input}
          />

          <View style={styles.statusSection}>
            <Text variant="labelSmall" style={styles.statusLabel}>त्वरित अनुगमन (Quick Update)</Text>
            <View style={styles.statusButtonRow}>
              {(['PENDING', 'DELIVERING', 'COMPLETED'] as const).map((status) => (
                <Button
                  key={status}
                  mode="outlined"
                  onPress={() => setOrderStatus(status)}
                  style={[
                    styles.statusButton,
                    orderStatus === status && { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary }
                  ]}
                  labelStyle={{ fontSize: 11, fontWeight: 'bold', color: orderStatus === status ? theme.colors.primary : theme.colors.onSurfaceVariant }}
                  compact
                >
                  {status === 'PENDING' ? 'प्रतीक्षारत' : status === 'DELIVERING' ? 'पठाउँदै' : 'सम्पन्न'}
                </Button>
              ))}
            </View>
          </View>

          <TextInput
            label="विशेष निर्देशनहरू"
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          {!isNew && (existingOrder as any)?.user && (
            <View style={styles.customerSection}>
              <View style={styles.sectionHeader}>
                <Icon name="account-circle-outline" size={24} color={theme.colors.primary} />
                <Text variant="titleMedium" style={styles.sectionTitle}>ग्राहकको विवरण (Read-only)</Text>
              </View>
              <Surface elevation={1} style={[styles.customerCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View style={styles.detailRow}>
                  <Text variant="labelLarge" style={styles.detailLabel}>नाम:</Text>
                  <Text variant="bodyLarge">{((existingOrder as any).user).name || 'उपलब्ध छैन'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text variant="labelLarge" style={styles.detailLabel}>फोन:</Text>
                  <Text variant="bodyLarge">{((existingOrder as any).user).phone || 'उपलब्ध छैन'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text variant="labelLarge" style={styles.detailLabel}>इमेल:</Text>
                  <Text variant="bodyLarge">{((existingOrder as any).user).email || 'उपलब्ध छैन'}</Text>
                </View>
              </Surface>
            </View>
          )}

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
                हटाउनुहोस्
              </Button>
            )}
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 32, paddingBottom: 64 },
  card: { padding: 24, borderRadius: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  input: { marginBottom: 16, backgroundColor: 'transparent' },
  actions: { marginTop: 24, gap: 16 },
  saveBtn: { borderRadius: 12 },
  deleteBtn: { borderRadius: 12, borderColor: '#ef4444' },
  btnContent: { paddingVertical: 6 },
  btnLabel: { fontSize: 16, fontWeight: 'bold' },
  customerSection: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontWeight: 'bold', opacity: 0.8 },
  customerCard: { padding: 16, borderRadius: 16, gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { opacity: 0.6 },
  statusSection: { marginBottom: 20 },
  statusLabel: { marginBottom: 8, opacity: 0.5, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  statusButtonRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  statusButton: { borderRadius: 8, minWidth: 70 },
});
