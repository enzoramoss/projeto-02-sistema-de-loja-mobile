import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, ScrollView, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRODUCTS_KEY = '@products_list';

const EMPTY_FORM = { name: '', description: '', price: '' };

export default function AreaAdmin({ navigation }) {
  const [products, setProducts] = useState(null); // null = ainda carregando
  const [form, setForm] = useState(EMPTY_FORM);
  const [pendingSave, setPendingSave] = useState(false);

  // ─── 1. Carrega produtos salvos ao montar ──────────────────────────────────
  useEffect(() => {
    async function loadProducts() {
      try {
        const stored = await AsyncStorage.getItem(PRODUCTS_KEY);
        setProducts(stored !== null ? JSON.parse(stored) : []);
      } catch (e) {
        console.error('Erro ao carregar produtos:', e);
        setProducts([]);
      }
    }
    loadProducts();
  }, []);

  // ─── 2. Persiste o array sempre que mudar E houver um save pendente ────────
  useEffect(() => {
    if (!pendingSave || products === null) return;

    async function saveProducts() {
      try {
        await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
        setPendingSave(false);
      } catch (e) {
        console.error('Erro ao salvar produto:', e);
        alert('Erro', 'Não foi possível salvar o produto.');
      }
    }
    saveProducts();
  }, [products, pendingSave]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleRegister() {
    const name = form.name.trim();
    const description = form.description.trim();
    const price = form.price.trim();

    if (!name || !description || !price) {
      alert('Atenção', 'Preencha todos os campos antes de cadastrar.');
      return;
    }

    const parsedPrice = parseFloat(price.replace(',', '.'));
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Atenção', 'Informe um preço válido (ex: 29.90).');
      return;
    }

    if (products === null) {
      alert('Aguarde', 'Os dados ainda estão sendo carregados.');
      return;
    }

    const alreadyExists = products.some(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
    if (alreadyExists) {
      alert('Atenção', 'Já existe um produto com esse nome.');
      return;
    }

    const newProduct = {
      id: Date.now().toString(),
      name,
      description,
      price: parsedPrice.toFixed(2),
    };

    setProducts((prev) => [...prev, newProduct]);
    setPendingSave(true);
    setForm(EMPTY_FORM);
    alert('Sucesso!', `"${name}" cadastrado com sucesso.`);
  }

function handleDelete(id) {
  setProducts((prev) => prev.filter((p) => p.id !== id));
  setPendingSave(true);
}

  // ─── UI ────────────────────────────────────────────────────────────────────
  return (
    <View style={ui.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      {/* Header */}
      <View style={ui.header}>
        <Text style={ui.headerTitle}>⚙ Área do Administrador</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={ui.logoutBtn}>
          <Text style={ui.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={ui.scrollContent} keyboardShouldPersistTaps="handled">

        {/* ── Formulário ── */}
        <View style={ui.card}>
          <Text style={ui.cardTitle}>Cadastrar novo produto</Text>

          <Text style={ui.label}>Nome</Text>
          <TextInput
            style={ui.input}
            placeholder="Ex: Camiseta Premium"
            placeholderTextColor="#888"
            value={form.name}
            onChangeText={(v) => handleChange('name', v)}
          />

          <Text style={ui.label}>Descrição</Text>
          <TextInput
            style={[ui.input, ui.inputMultiline]}
            placeholder="Descreva o produto..."
            placeholderTextColor="#888"
            value={form.description}
            onChangeText={(v) => handleChange('description', v)}
            multiline
            numberOfLines={3}
          />

          <Text style={ui.label}>Preço (R$)</Text>
          <TextInput
            style={ui.input}
            placeholder="Ex: 49.90"
            placeholderTextColor="#888"
            value={form.price}
            onChangeText={(v) => handleChange('price', v)}
            keyboardType="decimal-pad"
          />

          <TouchableOpacity style={ui.registerBtn} onPress={handleRegister}>
            <Text style={ui.registerBtnText}>+ Cadastrar Produto</Text>
          </TouchableOpacity>
        </View>

        {/* ── Lista de produtos ── */}
        <View style={ui.card}>
          <Text style={ui.cardTitle}>
            Produtos cadastrados{' '}
            <Text style={ui.badge}>
              {products === null ? '…' : products.length}
            </Text>
          </Text>

          {products === null && (
            <Text style={ui.emptyText}>Carregando...</Text>
          )}

          {products !== null && products.length === 0 && (
            <Text style={ui.emptyText}>Nenhum produto cadastrado ainda.</Text>
          )}

          {products !== null && products.map((item) => (
            <View key={item.id} style={ui.productRow}>
              <View style={ui.productInfo}>
                <Text style={ui.productName}>{item.name}</Text>
                <Text style={ui.productDesc} numberOfLines={2}>{item.description}</Text>
                <Text style={ui.productPrice}>R$ {item.price}</Text>
              </View>
              <TouchableOpacity
                style={ui.deleteBtn}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={ui.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Estilos ────────────────────────────────────────────────────────────────
const ui = {
  screen: {
    flex: 1,
    backgroundColor: '#f0f2f8',
  },
  header: {
    backgroundColor: '#1a1a2e',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  logoutBtn: {
    backgroundColor: '#e63946',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#e8eaf0',
    color: '#555',
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },

  // Form
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dde1ee',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1a1a2e',
    backgroundColor: '#fafbfd',
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  registerBtn: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  registerBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.3,
  },

  // Product list
  emptyText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 12,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f2f8',
    paddingVertical: 12,
    gap: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#1a1a2e',
  },
  productDesc: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2a9d8f',
    marginTop: 4,
  },
  deleteBtn: {
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#ffc5c5',
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: '#e63946',
    fontWeight: 'bold',
    fontSize: 14,
  },
};