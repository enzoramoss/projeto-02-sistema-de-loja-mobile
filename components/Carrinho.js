import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StatusBar, SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRODUCTS_KEY = '@products_list';
const CART_KEY = '@cart_list';

// ─── Utilitários ─────────────────────────────────────────────────────────────
const formatPrice = (value) =>
  `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`;

const cartTotal = (cart) =>
  cart.reduce((sum, item) => sum + parseFloat(item.price) * item.qty, 0);

// ─── Componente principal ─────────────────────────────────────────────────────
export default function AreaDoCliente({ navigation, route }) {
  const clientName = route?.params?.name ?? 'Cliente';

  // dados persistidos
  const [products, setProducts] = useState(null);
  const [cart, setCart] = useState(null);
  const [pendingCartSave, setPendingCartSave] = useState(false);

  // controle de UI
  const [tab, setTab] = useState('store'); // 'store' | 'cart'
  const [qtys, setQtys] = useState({});       // { [productId]: number }

  // ── 1. Carrega produtos e carrinho ao montar ────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [storedProducts, storedCart] = await Promise.all([
          AsyncStorage.getItem(PRODUCTS_KEY),
          AsyncStorage.getItem(CART_KEY),
        ]);
        const productList = storedProducts ? JSON.parse(storedProducts) : [];
        const cartList = storedCart ? JSON.parse(storedCart) : [];

        setProducts(productList);
        setCart(cartList);

        // inicializa qtds com 1 para cada produto disponível
        const initialQtys = {};
        productList.forEach((p) => { initialQtys[p.id] = 1; });
        setQtys(initialQtys);
      } catch (e) {
        console.error('Erro ao carregar dados:', e);
        setProducts([]);
        setCart([]);
      }
    }
    load();
  }, []);

  // ── 2. Persiste o carrinho sempre que mudar ─────────────────────────────────
  useEffect(() => {
    if (!pendingCartSave || cart === null) return;
    async function saveCart() {
      try {
        await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
        setPendingCartSave(false);
      } catch (e) {
        console.error('Erro ao salvar carrinho:', e);
      }
    }
    saveCart();
  }, [cart, pendingCartSave]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  function changeQty(productId, delta) {
    setQtys((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] ?? 1) + delta),
    }));
  }

  function addToCart(product) {
    const qty = qtys[product.id] ?? 1;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...product, qty }];
    });
    setPendingCartSave(true);
    alert('✓ Adicionado', `${qty}× "${product.name}" no carrinho.`);
  }

  function changeCartQty(productId, delta) {
    setCart((prev) =>
      prev
        .map((i) => i.id === productId ? { ...i, qty: i.qty + delta } : i)
        .filter((i) => i.qty > 0)
    );
    setPendingCartSave(true);
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((i) => i.id !== productId));
    setPendingCartSave(true);
  }

  function handleCheckout() {
    if (!cart || cart.length === 0) return;
    const total = formatPrice(cartTotal(cart));
    alert(
      '🛒 Confirmar compra',
      `Total: ${total}\n\nDeseja finalizar o pedido?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Comprar',
          onPress: () => {
            setCart([]);
            setPendingCartSave(true);
            alert(
              '🎉 Pedido realizado!',
              `Obrigado, ${clientName}! Seu pedido foi registrado com sucesso.`,
              [{ text: 'OK', onPress: () => setTab('store') }]
            );
          },
        },
      ]
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  const isLoading = products === null || cart === null;
  const cartCount = cart ? cart.reduce((n, i) => n + i.qty, 0) : 0;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={ui.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdf6ec" />

      {/* ── Header ── */}
      <View style={ui.header}>
        <View>
          <Text style={ui.headerGreeting}>Olá, {clientName} 👋</Text>
          <Text style={ui.headerSub}>O que vai levar hoje?</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={ui.logoutBtn}>
          <Text style={ui.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* ── Tab bar ── */}
      <View style={ui.tabBar}>
        <TouchableOpacity
          style={[ui.tab, tab === 'store' && ui.tabActive]}
          onPress={() => setTab('store')}
        >
          <Text style={[ui.tabText, tab === 'store' && ui.tabTextActive]}>
            🏪 Loja
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[ui.tab, tab === 'cart' && ui.tabActive]}
          onPress={() => setTab('cart')}
        >
          <Text style={[ui.tabText, tab === 'cart' && ui.tabTextActive]}>
            🛒 Carrinho{cartCount > 0 ? ` (${cartCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Conteúdo ── */}
      {isLoading ? (
        <View style={ui.center}>
          <Text style={ui.loadingText}>Carregando...</Text>
        </View>
      ) : tab === 'store' ? (
        <StoreView products={products} qtys={qtys} changeQty={changeQty} addToCart={addToCart} />
      ) : (
        <CartView cart={cart} changeCartQty={changeCartQty} removeFromCart={removeFromCart} handleCheckout={handleCheckout} />
      )}
    </SafeAreaView>
  );
}

// ─── Aba: Loja ────────────────────────────────────────────────────────────────
function StoreView({ products, qtys, changeQty, addToCart }) {
  if (products.length === 0) {
    return (
      <View style={ui.center}>
        <Text style={ui.emptyIcon}>📦</Text>
        <Text style={ui.emptyTitle}>Nenhum produto disponível</Text>
        <Text style={ui.emptySub}>Aguarde o administrador cadastrar produtos.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={ui.listContent} showsVerticalScrollIndicator={false}>
      <Text style={ui.sectionTitle}>Produtos disponíveis</Text>
      {products.map((product) => (
        <View key={product.id} style={ui.productCard}>
          {/* Emoji decorativo baseado no preço (só visual) */}
          <View style={ui.productIconBox}>
            <Text style={ui.productIcon}>🛍</Text>
          </View>

          <View style={ui.productDetails}>
            <Text style={ui.productName}>{product.name}</Text>
            <Text style={ui.productDesc} numberOfLines={2}>{product.description}</Text>
            <Text style={ui.productPrice}>{formatPrice(product.price)}</Text>
          </View>

          {/* Contador de quantidade */}
          <View style={ui.qtyBlock}>
            <View style={ui.qtyRow}>
              <TouchableOpacity style={ui.qtyBtn} onPress={() => changeQty(product.id, -1)}>
                <Text style={ui.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={ui.qtyValue}>{qtys[product.id] ?? 1}</Text>
              <TouchableOpacity style={ui.qtyBtn} onPress={() => changeQty(product.id, +1)}>
                <Text style={ui.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={ui.addBtn} onPress={() => addToCart(product)}>
              <Text style={ui.addBtnText}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// ─── Aba: Carrinho ────────────────────────────────────────────────────────────
function CartView({ cart, changeCartQty, removeFromCart, handleCheckout }) {
  if (cart.length === 0) {
    return (
      <View style={ui.center}>
        <Text style={ui.emptyIcon}>🛒</Text>
        <Text style={ui.emptyTitle}>Seu carrinho está vazio</Text>
        <Text style={ui.emptySub}>Adicione produtos na aba Loja.</Text>
      </View>
    );
  }

  const total = cartTotal(cart);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={ui.listContent} showsVerticalScrollIndicator={false}>
        <Text style={ui.sectionTitle}>Itens no carrinho</Text>

        {cart.map((item) => (
          <View key={item.id} style={ui.cartRow}>
            <View style={ui.cartInfo}>
              <Text style={ui.cartItemName}>{item.name}</Text>
              <Text style={ui.cartItemUnit}>
                {formatPrice(item.price)} / un.
              </Text>
            </View>

            <View style={ui.cartRight}>
              <View style={ui.qtyRow}>
                <TouchableOpacity
                  style={ui.qtyBtn}
                  onPress={() => changeCartQty(item.id, -1)}
                >
                  <Text style={ui.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={ui.qtyValue}>{item.qty}</Text>
                <TouchableOpacity
                  style={ui.qtyBtn}
                  onPress={() => changeCartQty(item.id, +1)}
                >
                  <Text style={ui.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={ui.cartItemTotal}>
                {formatPrice(item.price * item.qty)}
              </Text>
            </View>

            <TouchableOpacity
              style={ui.removeBtn}
              onPress={() => removeFromCart(item.id)}
            >
              <Text style={ui.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* ── Rodapé de checkout ── */}
      <View style={ui.checkoutBar}>
        <View>
          <Text style={ui.checkoutLabel}>Total do pedido</Text>
          <Text style={ui.checkoutTotal}>{formatPrice(total)}</Text>
        </View>
        <TouchableOpacity style={ui.checkoutBtn} onPress={handleCheckout}>
          <Text style={ui.checkoutBtnText}>Finalizar compra →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const AMBER = '#e07b2a';
const CREAM = '#fdf6ec';
const DARK = '#1f1a14';
const MUTED = '#9a8c7f';
const WHITE = '#ffffff';

const ui = {
  screen: { flex: 1, backgroundColor: CREAM },

  // Header
  header: {
    backgroundColor: CREAM,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#e8dfd3',
  },
  headerGreeting: { fontSize: 20, fontWeight: '800', color: DARK },
  headerSub: { fontSize: 13, color: MUTED, marginTop: 2 },
  logoutBtn: {
    backgroundColor: DARK,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  logoutText: { color: WHITE, fontSize: 13, fontWeight: '700' },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#e8dfd3',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: AMBER },
  tabText: { fontSize: 14, fontWeight: '600', color: MUTED },
  tabTextActive: { color: AMBER },

  // States
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText: { color: MUTED, fontSize: 15 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: DARK, textAlign: 'center' },
  emptySub: { fontSize: 14, color: MUTED, textAlign: 'center', marginTop: 6 },

  // List
  listContent: { padding: 16, paddingBottom: 32 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // Product card
  productCard: {
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 12,
  },
  productIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fdecd5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productIcon: { fontSize: 22 },
  productDetails: { flex: 1 },
  productName: { fontSize: 15, fontWeight: '700', color: DARK },
  productDesc: { fontSize: 12, color: MUTED, marginTop: 2 },
  productPrice: { fontSize: 15, fontWeight: '800', color: AMBER, marginTop: 4 },

  // Qty controls
  qtyBlock: { alignItems: 'center', gap: 6 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qtyBtn: {
    width: 28, height: 28,
    borderRadius: 8,
    backgroundColor: '#f0e8df',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 16, fontWeight: '700', color: DARK, lineHeight: 20 },
  qtyValue: { fontSize: 15, fontWeight: '700', color: DARK, minWidth: 22, textAlign: 'center' },
  addBtn: {
    backgroundColor: AMBER,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addBtnText: { color: WHITE, fontSize: 12, fontWeight: '700' },

  // Cart row
  cartRow: {
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cartInfo: { flex: 1 },
  cartItemName: { fontSize: 15, fontWeight: '700', color: DARK },
  cartItemUnit: { fontSize: 12, color: MUTED, marginTop: 2 },
  cartRight: { alignItems: 'flex-end', gap: 4 },
  cartItemTotal: { fontSize: 14, fontWeight: '800', color: AMBER },
  removeBtn: {
    width: 32, height: 32,
    borderRadius: 8,
    backgroundColor: '#fff0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffc5c5',
  },
  removeBtnText: { color: '#e63946', fontWeight: '800', fontSize: 13 },

  // Checkout bar
  checkoutBar: {
    backgroundColor: DARK,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  checkoutLabel: { color: '#9a8c7f', fontSize: 12, fontWeight: '600' },
  checkoutTotal: { color: WHITE, fontSize: 22, fontWeight: '800', marginTop: 2 },
  checkoutBtn: {
    backgroundColor: AMBER,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  checkoutBtnText: { color: WHITE, fontWeight: '800', fontSize: 15 },
};