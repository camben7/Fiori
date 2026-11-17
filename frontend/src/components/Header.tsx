import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { BrandMark } from './BrandMark';

const links = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Nuestra esencia', href: '#esencia' },
  { label: 'Catálogo', href: '#catalogo' },
  { label: 'Contacto', href: '#contacto' },
];

/** Navegación compacta con menú accesible en pantallas pequeñas. */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  function closeMenu() { setMenuOpen(false); }

  return (
    <>
      <div className="announcement-bar">Pequeños detalles, recuerdos que florecen para siempre <span>✳</span></div>
      <header className="site-header">
        <div className="container header-inner">
          <BrandMark />
          <button className="icon-button mobile-menu-button" type="button" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <nav className={`main-nav${menuOpen ? ' main-nav--open' : ''}`} aria-label="Navegación principal">
            {links.map((link) => <a key={link.href} href={link.href} onClick={closeMenu}>{link.label}</a>)}
            <a className="nav-cta" href="#contacto" onClick={closeMenu}>Crear mi detalle <ArrowUpRight size={15} /></a>
          </nav>
        </div>
      </header>
    </>
  );
}
