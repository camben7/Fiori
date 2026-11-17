import { useEffect, useId, useRef, useState } from 'react';
import type { DragEvent, FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Check, ImagePlus, LoaderCircle, LogOut, PackagePlus, Plus, Save, Trash2, X } from 'lucide-react';
import { normalizeProduct } from '../services/catalog';
import { uploadProductImage, validateProductImage } from '../services/productImages';
import { supabase } from '../services/supabase';
import { PRODUCT_CATEGORIES } from '../types';
import type { Product } from '../types';
import { formatPrice, slugify } from '../utils';

interface Props { session: Session; onLogout: () => Promise<void>; }

interface SizeRow { label: string; extra: string }
interface FormState {
  name: string;
  description: string;
  category: string;
  price: string;
  image_url: string;
  is_featured: boolean;
  is_active: boolean;
  /** Nombres de colores separados por coma: "Lila lavanda, Marfil". */
  ribbons: string;
  sizes: SizeRow[];
  allows_dedication: boolean;
}
interface Notice { type: 'success' | 'error'; text: string }

const emptyForm: FormState = {
  name: '', description: '', category: PRODUCT_CATEGORIES[0], price: '', image_url: '',
  is_featured: false, is_active: true, ribbons: '', sizes: [], allows_dedication: true,
};

const MIGRATION_HINT = 'Falta actualizar la base de datos: ejecuta supabase/migrations/002_catalog_options.sql en el SQL Editor de Supabase.';

/**
 * Traduce errores técnicos de Postgres/PostgREST a mensajes que una persona pueda accionar.
 * Decisión técnica: los dos errores más probables al estrenar esta versión son "columna inexistente"
 * y "categoría no permitida" (la migración SQL aún no se ejecutó), así que los explicamos con el remedio.
 */
function describeDbError(error: { code?: string; message?: string }, fallback: string): string {
  const message = error.message ?? '';
  if (error.code === '23505') return 'Ya existe un producto con ese nombre. Usa un nombre distinto.';
  if (error.code === '23514' || error.code === '42703' || error.code === 'PGRST204' || /schema cache|does not exist/i.test(message)) return MIGRATION_HINT;
  if (error.code === '42501') return 'Tu usuario no tiene permisos de administrador.';
  return fallback;
}

const priceToText = (price: number | null) => (price === null ? '' : String(price));

function productToForm(product: Product): FormState {
  return {
    name: product.name,
    description: product.description,
    category: String(product.category),
    price: priceToText(product.price),
    image_url: product.image_url,
    is_featured: product.is_featured,
    is_active: product.is_active,
    ribbons: (product.ribbon_colors ?? []).join(', '),
    sizes: (product.sizes ?? []).map((size) => ({ label: size.label, extra: String(size.price_delta) })),
    allows_dedication: product.allows_dedication !== false,
  };
}

/** CRUD de productos. La autorización real también se aplica con políticas RLS de PostgreSQL. */
export function AdminDashboard({ session, onLogout }: Props) {
  const uid = useId();
  const formRef = useRef<HTMLElement>(null);
  const previewRef = useRef<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  async function loadProducts() {
    if (!supabase) return;
    setLoadingList(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) setNotice({ type: 'error', text: describeDbError(error, 'No pudimos cargar los productos. Revisa la configuración y los permisos.') });
    else setProducts((data ?? []).map((row) => normalizeProduct(row as Record<string, unknown>)));
    setLoadingList(false);
  }
  useEffect(() => { void loadProducts(); }, []);

  // Los avisos de éxito se retiran solos; los errores se quedan hasta la siguiente acción.
  useEffect(() => {
    if (notice?.type !== 'success') return;
    const timer = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  // Libera la URL temporal de la vista previa al salir del panel (evita fugas de memoria).
  useEffect(() => () => { if (previewRef.current) URL.revokeObjectURL(previewRef.current); }, []);

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  /**
   * Foto nueva: se valida al elegirla y se muestra al instante con una URL temporal del navegador.
   * La subida real a Supabase Storage ocurre solo al pulsar "Guardar", así que cancelar no deja archivos huérfanos.
   */
  function chooseFile(file: File | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    if (file) {
      const problem = validateProductImage(file);
      if (problem) { setNotice({ type: 'error', text: problem }); setImageFile(null); setPreview(null); return; }
      previewRef.current = URL.createObjectURL(file);
      setNotice(null);
    }
    setImageFile(file);
    setPreview(previewRef.current);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    chooseFile(event.dataTransfer.files?.[0] ?? null);
  }

  function beginEdit(product: Product) {
    setEditingId(product.id);
    setForm(productToForm(product));
    chooseFile(null);
    setNotice({ type: 'success', text: `Estás editando “${product.name}”.` });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    chooseFile(null);
    setNotice(null);
  }

  function updateSize(index: number, patch: Partial<SizeRow>) {
    setForm((current) => ({ ...current, sizes: current.sizes.map((row, position) => (position === index ? { ...row, ...patch } : row)) }));
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;

    if (form.name.trim().length < 3 || form.description.trim().length < 10) {
      setNotice({ type: 'error', text: 'Escribe un nombre de al menos 3 caracteres y una descripción de al menos 10.' }); return;
    }
    const price = form.price.trim() === '' ? null : Number(form.price);
    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      setNotice({ type: 'error', text: 'El precio debe ser un número igual o superior a cero.' }); return;
    }

    // Colores: se limpian espacios, se quitan repetidos y se limita la cantidad para que el selector siga siendo cómodo.
    const ribbon_colors = Array.from(new Set(form.ribbons.split(/[,\n]/).map((value) => value.trim()).filter(Boolean)));
    if (ribbon_colors.length > 12 || ribbon_colors.some((color) => color.length > 30)) {
      setNotice({ type: 'error', text: 'Usa hasta 12 colores de cinta, de máximo 30 caracteres cada uno.' }); return;
    }

    const sizes = form.sizes.filter((row) => row.label.trim() !== '').map((row) => ({ label: row.label.trim(), price_delta: Number(row.extra || 0) }));
    if (sizes.some((size) => !Number.isFinite(size.price_delta) || size.price_delta < 0)) {
      setNotice({ type: 'error', text: 'El valor adicional de cada tamaño debe ser un número igual o superior a cero.' }); return;
    }
    if (new Set(sizes.map((size) => size.label.toLowerCase())).size !== sizes.length) {
      setNotice({ type: 'error', text: 'Hay dos tamaños con el mismo nombre. Cámbialo para diferenciarlos.' }); return;
    }

    setBusy(true);
    setNotice(null);
    try {
      let imageUrl = form.image_url.trim();
      if (imageFile) imageUrl = await uploadProductImage(imageFile, form.name);
      if (!imageUrl) throw new Error('Agrega una URL de imagen o sube una fotografía.');

      const payload = {
        name: form.name.trim(), slug: slugify(form.name), description: form.description.trim(),
        category: form.category, price, image_url: imageUrl,
        is_featured: form.is_featured, is_active: form.is_active,
        ribbon_colors, sizes, allows_dedication: form.allows_dedication,
      };

      if (editingId) {
        // .select('id') permite detectar si la política RLS bloqueó el cambio en silencio (0 filas afectadas).
        const { data, error } = await supabase.from('products').update(payload).eq('id', editingId).select('id');
        if (error) throw new Error(describeDbError(error, 'No pudimos guardar el producto. Revisa que tu usuario tenga rol administrador.'));
        if (!data?.length) throw new Error('No se guardó ningún cambio. Revisa que tu usuario tenga rol administrador.');
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw new Error(describeDbError(error, 'No pudimos guardar el producto. Revisa que tu usuario tenga rol administrador.'));
      }

      const wasEditing = Boolean(editingId);
      await loadProducts();
      setEditingId(null);
      setForm(emptyForm);
      chooseFile(null);
      setNotice({ type: 'success', text: wasEditing ? 'Cambios guardados. Ya se ven en el catálogo.' : 'Producto publicado. Ya aparece en el catálogo.' });
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Ocurrió un error guardando el producto.' });
    } finally {
      setBusy(false);
    }
  }

  /** Cambio rápido desde la lista (precio, visibilidad, destacado) sin abrir el formulario completo. */
  async function patchProduct(product: Product, fields: Partial<Pick<Product, 'price' | 'is_active' | 'is_featured'>>, successText: string): Promise<boolean> {
    if (!supabase) return false;
    setRowBusy(product.id);
    const { data, error } = await supabase.from('products').update(fields).eq('id', product.id).select('id');
    setRowBusy(null);
    if (error || !data?.length) {
      setNotice({ type: 'error', text: error ? describeDbError(error, 'No pudimos guardar el cambio.') : 'No se guardó el cambio. Verifica tus permisos de administrador.' });
      return false;
    }
    setProducts((current) => current.map((item) => (item.id === product.id ? { ...item, ...fields } : item)));
    setNotice({ type: 'success', text: successText });
    return true;
  }

  async function deleteProduct(product: Product) {
    if (!supabase) return;
    setRowBusy(product.id);
    const { error } = await supabase.from('products').delete().eq('id', product.id);
    setRowBusy(null);
    if (error) { setNotice({ type: 'error', text: 'No pudimos eliminar el producto. Verifica los permisos de administrador.' }); return; }
    if (editingId === product.id) resetForm();
    setProducts((current) => current.filter((item) => item.id !== product.id));
    setNotice({ type: 'success', text: `“${product.name}” se eliminó del catálogo.` });
  }

  const shownImage = preview ?? form.image_url.trim();
  const categoryOptions = Array.from(new Set<string>([...PRODUCT_CATEGORIES, form.category]));
  const visibleCount = products.filter((product) => product.is_active).length;
  const withoutPrice = products.filter((product) => product.price === null).length;

  return (
    <div className="admin-dashboard">
      <div className="admin-heading">
        <div>
          <span className="eyebrow">Panel de control</span>
          <h1>Tu catálogo, a tu manera.</h1>
          <p>Sesión: {session.user.email}</p>
        </div>
        <button className="button button--olive" type="button" onClick={() => void onLogout()}><LogOut size={15} aria-hidden="true" /> Cerrar sesión</button>
      </div>

      {notice && (
        <div className={notice.type === 'error' ? 'admin-error' : 'admin-note'} role={notice.type === 'error' ? 'alert' : 'status'}>
          {notice.type === 'success' && <Check size={15} aria-hidden="true" />} {notice.text}
        </div>
      )}

      <section className="admin-panel" ref={formRef}>
        <h2>{editingId ? 'Editar producto' : 'Agregar un producto'}</h2>
        <form className="admin-form" onSubmit={saveProduct}>
          <div className="admin-form-grid">
            <label>Nombre del arreglo
              <input required minLength={3} maxLength={100} value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="Ej. Ramo de flores eternas" />
            </label>
            <label>Categoría u ocasión
              <select value={form.category} onChange={(event) => updateForm('category', event.target.value)}>
                {categoryOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label>Precio base (COP)
              <input type="number" inputMode="numeric" min="0" step="1000" value={form.price} onChange={(event) => updateForm('price', event.target.value)} placeholder="Déjalo vacío para cotizar" />
            </label>
            <label>Colores de cinta (separados por coma)
              <input value={form.ribbons} onChange={(event) => updateForm('ribbons', event.target.value)} placeholder="Lila lavanda, Marfil, Verde oliva" />
            </label>
            <label className="wide">Descripción
              <textarea required minLength={10} maxLength={500} rows={3} value={form.description} onChange={(event) => updateForm('description', event.target.value)} placeholder="Describe materiales, tonos, tamaño y detalles del arreglo…" />
            </label>

            {/* Fotografía: arrastrar, elegir del dispositivo o pegar una URL. Vista previa inmediata. */}
            <div className="wide">
              <span className="admin-field-title">Fotografía del producto</span>
              <label className={`dropzone${dragging ? ' is-dragging' : ''}${shownImage ? ' has-image' : ''}`}
                onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}>
                <input type="file" className="visually-hidden" accept="image/png,image/jpeg,image/webp" onChange={(event) => chooseFile(event.target.files?.[0] ?? null)} />
                {shownImage ? (
                  <>
                    <img src={shownImage} alt="Vista previa de la fotografía" />
                    <span className="dropzone-change"><ImagePlus size={15} aria-hidden="true" /> Cambiar foto</span>
                  </>
                ) : (
                  <span className="dropzone-empty"><ImagePlus size={26} aria-hidden="true" /><strong>Arrastra una foto o toca para elegirla</strong><small>JPG, PNG o WEBP · máximo 8 MB</small></span>
                )}
              </label>
              {imageFile && <p className="admin-hint">Nueva foto: {imageFile.name}. Se subirá al guardar. <button type="button" className="admin-link" onClick={() => chooseFile(null)}>Quitar</button></p>}
              <label className="admin-url">…o pega la URL de una imagen
                <input type="url" value={form.image_url} onChange={(event) => updateForm('image_url', event.target.value)} placeholder="https://…" disabled={Boolean(imageFile)} />
              </label>
            </div>

            {/* Tamaños: cada fila suma un valor adicional al precio base. */}
            <fieldset className="wide admin-sizes">
              <legend>Tamaños (opcional)</legend>
              {form.sizes.length === 0 && <p className="admin-hint">Sin tamaños: el cliente verá un único precio. Agrega tamaños si manejas varias medidas.</p>}
              {form.sizes.map((row, index) => (
                <div className="size-row" key={index}>
                  <input aria-label={`Nombre del tamaño ${index + 1}`} value={row.label} maxLength={30} onChange={(event) => updateSize(index, { label: event.target.value })} placeholder="Ej. Mediano" />
                  <input aria-label={`Valor adicional del tamaño ${index + 1}`} type="number" inputMode="numeric" min="0" step="1000" value={row.extra} onChange={(event) => updateSize(index, { extra: event.target.value })} placeholder="Adicional COP" />
                  <button type="button" className="admin-icon" aria-label={`Quitar tamaño ${index + 1}`} onClick={() => updateForm('sizes', form.sizes.filter((_, position) => position !== index))}><X size={15} aria-hidden="true" /></button>
                </div>
              ))}
              {form.sizes.length < 6 && (
                <button type="button" className="button button--outline button--small" onClick={() => updateForm('sizes', [...form.sizes, { label: '', extra: '0' }])}><Plus size={14} aria-hidden="true" /> Agregar tamaño</button>
              )}
            </fieldset>

            <div className="admin-inline wide">
              <label className="admin-checkbox"><input type="checkbox" checked={form.allows_dedication} onChange={(event) => updateForm('allows_dedication', event.target.checked)} /> Permitir dedicatoria</label>
              <label className="admin-checkbox"><input type="checkbox" checked={form.is_featured} onChange={(event) => updateForm('is_featured', event.target.checked)} /> Destacar como favorito</label>
              <label className="admin-checkbox"><input type="checkbox" checked={form.is_active} onChange={(event) => updateForm('is_active', event.target.checked)} /> Visible al público</label>
            </div>
          </div>
          <div className="admin-inline">
            <button className="button button--primary" type="submit" disabled={busy}>
              {busy ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : <Save size={16} aria-hidden="true" />} {editingId ? 'Guardar cambios' : 'Publicar producto'}
            </button>
            {editingId && <button className="button button--outline" type="button" onClick={resetForm}><X size={15} aria-hidden="true" /> Cancelar edición</button>}
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-inline admin-list-head">
          <h2>Productos ({products.length})</h2>
          <button className="button button--outline button--small" type="button" onClick={() => void loadProducts()} disabled={loadingList}><PackagePlus size={15} aria-hidden="true" /> Actualizar lista</button>
        </div>
        {!loadingList && products.length > 0 && (
          <div className="admin-stats" aria-label="Resumen del catálogo">
            <span><strong>{visibleCount}</strong> visibles</span>
            <span><strong>{products.length - visibleCount}</strong> ocultos</span>
            <span className={withoutPrice ? 'is-alert' : ''}><strong>{withoutPrice}</strong> sin precio</span>
          </div>
        )}
        {loadingList ? (
          <div className="admin-products" aria-busy="true" aria-label="Cargando productos">
            {[0, 1, 2].map((item) => <div className="admin-product-row" key={item}><div className="skeleton skeleton--thumb" /><div><div className="skeleton skeleton--line" /><div className="skeleton skeleton--line skeleton--short" /></div></div>)}
          </div>
        ) : products.length ? (
          <div className="admin-products">
            {products.map((product) => (
              <ProductRow key={`${uid}-${product.id}`} product={product} busy={rowBusy === product.id}
                onEdit={() => beginEdit(product)}
                onDelete={() => deleteProduct(product)}
                onSavePrice={(price) => patchProduct(product, { price }, `Precio de “${product.name}” actualizado.`)}
                onToggleActive={() => patchProduct(product, { is_active: !product.is_active }, product.is_active ? `“${product.name}” ahora está oculto.` : `“${product.name}” ahora es visible.`)} />
            ))}
          </div>
        ) : (
          <p>Aún no hay productos. Agrega el primero con el formulario anterior.</p>
        )}
      </section>
    </div>
  );
}

interface RowProps {
  product: Product;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSavePrice: (price: number | null) => Promise<boolean>;
  onToggleActive: () => void;
}

/** Fila de producto con precio editable en línea. El borrador vive aquí para no re-renderizar toda la lista al teclear. */
function ProductRow({ product, busy, onEdit, onDelete, onSavePrice, onToggleActive }: RowProps) {
  const [draft, setDraft] = useState(priceToText(product.price));
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  // Si el precio cambia desde fuera (tras guardar el formulario), el borrador se sincroniza.
  useEffect(() => { setDraft(priceToText(product.price)); }, [product.price]);

  const dirty = draft.trim() !== priceToText(product.price);

  async function savePrice() {
    const value = draft.trim() === '' ? null : Number(draft);
    if (value !== null && (!Number.isFinite(value) || value < 0)) { setError('Número inválido'); return; }
    setError('');
    await onSavePrice(value);
  }

  return (
    <article className={`admin-product-row${product.is_active ? '' : ' is-hidden'}`}>
      <img src={product.image_url} alt="" />
      <div className="admin-product-main">
        <strong>{product.name}</strong>
        <small>{product.category} · {formatPrice(product.price)} · {product.is_active ? 'Visible' : 'Oculto'}{product.is_featured ? ' · Favorito' : ''}</small>
        <div className="row-price">
          <label>
            <span className="visually-hidden">Precio de {product.name}</span>
            <input type="number" inputMode="numeric" min="0" step="1000" value={draft} placeholder="Sin precio"
              aria-invalid={Boolean(error)}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter' && dirty) { event.preventDefault(); void savePrice(); } }} />
          </label>
          {dirty && <button type="button" className="row-save" onClick={() => void savePrice()} disabled={busy}>{busy ? <LoaderCircle className="spin" size={13} aria-hidden="true" /> : <Check size={13} aria-hidden="true" />} Guardar precio</button>}
          {error && <small className="field-error">{error}</small>}
        </div>
      </div>
      <div className="admin-actions">
        <button type="button" onClick={onToggleActive} disabled={busy}>{product.is_active ? 'Ocultar' : 'Mostrar'}</button>
        <button type="button" onClick={onEdit}>Editar</button>
        {confirming ? (
          <span className="admin-confirm">
            <button type="button" className="is-danger" onClick={() => { setConfirming(false); onDelete(); }} disabled={busy}>Sí, eliminar</button>
            <button type="button" onClick={() => setConfirming(false)}>No</button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} aria-label={`Eliminar ${product.name}`}><Trash2 size={14} aria-hidden="true" /></button>
        )}
      </div>
    </article>
  );
}
