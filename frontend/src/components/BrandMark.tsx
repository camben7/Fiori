export function BrandMark({ compact = false, href = '#inicio' }: { compact?: boolean; href?: string }) {
  return (
    <a className={`brand-mark${compact ? ' brand-mark--compact' : ''}`} href={href} aria-label="Fiori, inicio">
      <img src={`${import.meta.env.BASE_URL}brand/fiori-mark.svg`} alt="" />
      <span>fiori</span>
    </a>
  );
}
