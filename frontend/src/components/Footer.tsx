import { ArrowUpRight, Instagram, MessageCircle } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { whatsappUrl } from '../utils';

const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL || 'https://instagram.com/fioribaq';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand"><BrandMark /><p>Flores que no se marchitan.<br />Detalles que permanecen.</p></div>
        <div className="footer-note"><span className="eyebrow">Un detalle con intención</span><p>Hecho a mano, pensado para quedarse contigo.</p></div>
        <div className="footer-links">
          <a href={instagramUrl} target="_blank" rel="noreferrer"><Instagram size={17} /> Instagram <ArrowUpRight size={14} /></a>
          <a href={whatsappUrl('Hola, Fiori. Quiero conocer sus arreglos florales.')} target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp <ArrowUpRight size={14} /></a>
          <a href="#inicio">Volver arriba ↑</a>
          <a href="admin">Administración</a>
        </div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} Fiori. Hecho con cariño.</span><span>Flores eternas · Hechas a mano</span></div>
    </footer>
  );
}
