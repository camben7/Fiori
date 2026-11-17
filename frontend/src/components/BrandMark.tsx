/**
 * Logotipo de Fiori: isotipo oficial (ramita de lavanda, recortado del logo con fondo transparente)
 * + palabra FIORI en tipografía serif con espaciado amplio, como en el logo original.
 * Decisión técnica: la palabra es TEXTO real (no una imagen) para que sea nítida en cualquier
 * pantalla, se pueda leer con lectores de pantalla y cambie de color en el footer.
 */
export function BrandMark({ compact = false, href = '#inicio' }: { compact?: boolean; href?: string }) {
  return (
    <a className={`brand-mark${compact ? ' brand-mark--compact' : ''}`} href={href} aria-label="Fiori, inicio">
      <img src={`${import.meta.env.BASE_URL}brand/fiori-mark.png`} alt="" width="33" height="44" />
      <span>Fiori</span>
    </a>
  );
}
