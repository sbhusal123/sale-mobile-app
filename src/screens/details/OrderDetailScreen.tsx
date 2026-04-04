import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Menu, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/auth-context';
import BackButton from '../../components/BackButton';

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
      special_instructions: existingOrder?.special_instructions || "",
      order_status: existingOrder?.order_status || "Pending",
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
      { text: 'रद्द गर्नुहोस् (Cancel)', style: 'cancel' },
      {
        text: 'हटाउनुहोस् (Delete)', style: 'destructive', onPress: async () => {
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
            <MaterialCommunityIcons name="cart-plus" size={32} color={theme.colors.onSurface} />
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
                {selectedProduct ? selectedProduct.name : 'उत्पादन चयन गर्नुहोस् (Select Product)'}
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
            label="मात्रा (Quantity)"
            value={qty}
            onChangeText={setQty}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="कुल मूल्य (Total Price)"
            value={totalPrice}
            onChangeText={setTotalPrice}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Affix text="₹ " />}
          />
          <TextInput
            label="ठेगाना (Location)"
            value={location}
            onChangeText={setLocation}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="सम्पर्क (Phone)"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
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
