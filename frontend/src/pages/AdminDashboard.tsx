import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { LoaderCircle, LogOut, PackagePlus, Save, Trash2, X } from 'lucide-react';
import { supabase } from '../services/supabase';
import { uploadProductImage } from '../services/productImages';
import type { Product, ProductCategory } from '../types';
import { formatPrice, slugify } from '../utils';

interface Props { session: Session; onLogout: () => Promise<void>; }
interface ProductFormState {
  name: string;
  description: string;
  category: ProductCategory;
  price: string;
  image_url: string;
  is_featured: boolean;
  is_active: boolean;
}
const emptyForm: ProductFormState = { name: '', description: '', category: 'Ramos', price: '', image_url: '', is_featured: false, is_active: true };
const categoryOptions: ProductCategory[] = ['Ramos', 'Detalles', 'Temporada', 'Personalizados'];

/** CRUD de productos. La autorización real también se aplica con políticas RLS de PostgreSQL. */
export function AdminDashboard({ session, onLogout }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState('');

  async function loadProducts() {
    if (!supabase) return;
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) { setFormError('No pudimos cargar los productos. Revisa la configuración y los permisos.'); return; }
    setProducts((data ?? []) as Product[]);
  }
  useEffect(() => { void loadProducts(); }, []);

  function updateForm<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  function beginEdit(product: Product) {
    setEditingId(product.id);
    setForm({ name: product.name, description: product.description, category: product.category as ProductCategory,
      price: product.price === null ? '' : String(product.price), image_url: product.image_url,
      is_featured: product.is_featured, is_active: product.is_active });
    setImageFile(null); setFormError(''); setFormMessage('Estás editando un producto existente.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function resetForm() { setEditingId(null); setForm(emptyForm); setImageFile(null); setFormError(''); setFormMessage(''); }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    if (form.name.trim().length < 3 || form.description.trim().length < 10) {
      setFormError('Escribe un nombre de al menos 3 caracteres y una descripción de al menos 10.'); return;
    }
    const parsedPrice = form.price.trim() === '' ? null : Number(form.price);
    if (parsedPrice !== null && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
      setFormError('El precio debe ser un número igual o superior a cero.'); return;
    }
    setBusy(true); setFormError(''); setFormMessage('Guardando producto…');
    try {
      let imageUrl = form.image_url.trim();
      if (imageFile) imageUrl = await uploadProductImage(imageFile, form.name);
      if (!imageUrl) throw new Error('Agrega una URL de imagen o sube una fotografía.');
      const payload = { name: form.name.trim(), slug: slugify(form.name), description: form.description.trim(),
        category: form.category, price: parsedPrice, image_url: imageUrl,
        is_featured: form.is_featured, is_active: form.is_active };
      const result = editingId
        ? await supabase.from('products').update(payload).eq('id', editingId)
        : await supabase.from('products').insert(payload);
      if (result.error) throw new Error('No pudimos guardar el producto. Revisa que tu usuario tenga rol administrador.');
      await loadProducts(); resetForm(); setFormMessage('Producto guardado correctamente.');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Ocurrió un error guardando el producto.'); setFormMessage('');
    } finally { setBusy(false); }
  }

  async function deleteProduct(id: string) {
    if (!supabase || !window.confirm('¿Quieres eliminar este producto del catálogo?')) return;
    setBusy(true);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) setFormError('No pudimos eliminar el producto. Verifica los permisos de administrador.');
    else await loadProducts();
    setBusy(false);
  }

  return <div className="admin-dashboard">
    <div className="admin-heading"><div><span className="eyebrow">Panel de control</span><h1>Tu catálogo, a tu manera.</h1><p>Sesión: {session.user.email}</p></div><button className="button button--dark" type="button" onClick={() => void onLogout()}><LogOut size={15} /> Cerrar sesión</button></div>
    <div className="admin-note">Los cambios se guardan en Supabase y se reflejan en el catálogo público. Sustituye las imágenes de muestra y confirma todos los precios antes de publicar.</div>
    <section className="admin-panel">
      <h2>{editingId ? 'Editar producto' : 'Agregar un producto'}</h2>
      {formError && <div className="admin-error" role="alert">{formError}</div>}
      {formMessage && <div className="admin-note" role="status">{formMessage}</div>}
      <form className="admin-form" onSubmit={saveProduct}>
        <div className="admin-form-grid">
          <label>Nombre del arreglo<input required minLength={3} maxLength={100} value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="Ej. Ramo de rosas eternas" /></label>
          <label>Categoría<select value={form.category} onChange={(event) => updateForm('category', event.target.value as ProductCategory)}>{categoryOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
          <label>Precio en pesos colombianos<input type="number" min="0" step="1000" value={form.price} onChange={(event) => updateForm('price', event.target.value)} placeholder="Déjalo vacío para cotizar" /></label>
          <label>URL de imagen (opcional si subes archivo)<input type="url" value={form.image_url} onChange={(event) => updateForm('image_url', event.target.value)} placeholder="https://…" /></label>
          <label className="wide">Descripción<textarea required minLength={10} maxLength={500} rows={3} value={form.description} onChange={(event) => updateForm('description', event.target.value)} placeholder="Describe materiales, tonos, tamaño y detalles del arreglo…" /></label>
          <label className="wide">Fotografía del producto<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} /></label>
          <div className="admin-inline wide"><label className="admin-checkbox"><input type="checkbox" checked={form.is_featured} onChange={(event) => updateForm('is_featured', event.target.checked)} /> Destacar en el catálogo</label><label className="admin-checkbox"><input type="checkbox" checked={form.is_active} onChange={(event) => updateForm('is_active', event.target.checked)} /> Visible al público</label></div>
        </div>
        <div className="admin-inline"><button className="button button--dark" type="submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={16} /> : <Save size={16} />} {editingId ? 'Guardar cambios' : 'Publicar producto'}</button>{editingId && <button className="button" type="button" onClick={resetForm}><X size={15} /> Cancelar edición</button>}</div>
      </form>
    </section>
    <section className="admin-panel">
      <div className="admin-inline" style={{ justifyContent: 'space-between' }}><h2>Productos ({products.length})</h2><button className="button" type="button" onClick={() => void loadProducts()}><PackagePlus size={15} /> Actualizar lista</button></div>
      {products.length ? <div className="admin-products">{products.map((product) => <article className="admin-product-row" key={product.id}><img src={product.image_url} alt="" /><div><strong>{product.name}</strong><small>{product.category} · {formatPrice(product.price)} · {product.is_active ? 'Visible' : 'Oculto'}{product.is_featured ? ' · Destacado' : ''}</small></div><div className="admin-actions"><button type="button" onClick={() => beginEdit(product)}>Editar</button><button type="button" onClick={() => void deleteProduct(product.id)} aria-label={`Eliminar ${product.name}`}><Trash2 size={14} /></button></div></article>)}</div> : <p>Aún no hay productos. Agrega el primero con el formulario anterior.</p>}
    </section>
  </div>;
}
