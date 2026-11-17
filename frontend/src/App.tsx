import { AdminPage } from './pages/AdminPage';
import { HomePage } from './pages/HomePage';

/**
 * Admin is addressed with ?admin=1 rather than a browser-history route. This
 * keeps the private screen reachable on static hosting such as GitHub Pages
 * without relying on server-side URL rewrites.
 */
export default function App() {
  const params = new URLSearchParams(window.location.search);
  return params.get('admin') === '1' ? <AdminPage /> : <HomePage />;
}
