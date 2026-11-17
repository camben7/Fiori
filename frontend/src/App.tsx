import { CartDrawer } from './components/CartDrawer';
import { CartFab } from './components/CartFab';
import { CartToast } from './components/CartToast';
import { ProductModal } from './components/ProductModal';
import { CartProvider } from './context/CartContext';
import { ProductsProvider } from './context/ProductsContext';
import { useScrollReveal } from './hooks/useScrollReveal';
import { AdminPage } from './pages/AdminPage';
import { HomePage } from './pages/HomePage';

/**
 * Tienda pública: los proveedores envuelven la página para que catálogo, asistente, modal y carrito
 * compartan el mismo estado (productos cargados y pedido en curso).
 */
function Storefront() {
  useScrollReveal();
  return (
    <ProductsProvider>
      <CartProvider>
        <HomePage />
        <ProductModal />
        <CartFab />
        <CartDrawer />
        <CartToast />
      </CartProvider>
    </ProductsProvider>
  );
}

/**
 * Admin is addressed with ?admin=1 rather than a browser-history route. This
 * keeps the private screen reachable on static hosting such as GitHub Pages
 * without relying on server-side URL rewrites.
 */
export default function App() {
  const params = new URLSearchParams(window.location.search);
  return params.get('admin') === '1' ? <AdminPage /> : <Storefront />;
}
