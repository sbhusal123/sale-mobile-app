import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuth } from '@/app/context/auth-context';

export default function OrderEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  
  const { orders, products, addOrder, editOrder, deleteOrder } = useAuth();
  
  const isNew = id === 'new';
  const existingOrder = !isNew ? orders.find(o => o.id === id) : null;

  const [qty, setQty] = useState(existingOrder?.qty?.toString() || '1');
  const [totalPrice, setTotalPrice] = useState(existingOrder?.totalPrice?.toString() || '');
  const [address, setAddress] = useState(existingOrder?.address || '');
  const [contact, setContact] = useState(existingOrder?.contact || '');

  useEffect(() => {
    if (!isNew && !existingOrder) {
      router.replace('/orders');
    }
  }, [isNew, existingOrder, router]);

  const handleSave = () => {
    const data = {
      productId: products[0]?.id || 'p1', 
      qty: parseInt(qty, 10) || 1,
      totalPrice: parseFloat(totalPrice) || 0,
      address,
      contact,
    };

    if (isNew) {
      addOrder(data);
    } else {
      editOrder(id as string, data);
    }
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('मेटाउन निश्चित हुनुहुन्छ?', 'के तपाईं यो अर्डर हटाउन चाहनुहुन्छ?', [
      { text: 'रद्द गर्नुहोस् (Cancel)', style: 'cancel' },
      { text: 'हटाउनुहोस् (Delete)', style: 'destructive', onPress: () => {
        deleteOrder(id as string);
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
            <MaterialCommunityIcons name="cart-plus" size={32} color={theme.colors.onSurface} />
            <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
              {isNew ? 'नयाँ अर्डर थप्नुहोस्' : 'अर्डर सम्पादन गर्नुहोस्'}
            </Text>
          </View>
          
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
            label="ठेगाना (Address)"
            value={address}
            onChangeText={setAddress}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="सम्पर्क (Contact)"
            value={contact}
            onChangeText={setContact}
            mode="outlined"
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
