import { ArrowDown, ArrowUpRight, Flower2, Heart, Leaf } from 'lucide-react';
import { BrandMark } from '../components/BrandMark';

const heroImage = 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1500&q=90';

/** Primera versión de la landing: identidad, propuesta de valor y narrativa de marca. */
export function HomePage() {
  return (
    <main>
      <header className="site-header">
        <div className="container header-inner"><BrandMark /><nav className="main-nav"><a href="#inicio">Inicio</a><a href="#esencia">Nuestra esencia</a><a href="#contacto">Contacto</a></nav></div>
      </header>
      <section className="hero-section" id="inicio">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> Flores eternas, hechas con intención</span>
            <h1>Hay detalles que merecen <em>quedarse.</em></h1>
            <p>Convertimos flores, colores y pequeños gestos en recuerdos hechos a mano para acompañar tus momentos más bonitos.</p>
            <div className="hero-actions"><a className="button button--dark" href="#esencia">Conoce Fiori <ArrowUpRight size={17} /></a><a className="text-link" href="#esencia">Nuestra esencia <ArrowDown size={15} /></a></div>
            <div className="hero-signature"><span className="signature-line" /><span>Un detalle que florece para siempre</span></div>
          </div>
          <div className="hero-visual"><div className="hero-photo-frame"><img src={heroImage} alt="Composición floral de inspiración para Fiori" /></div><div className="hero-stamp"><span>hecho</span><strong>a mano</strong><span>con cariño</span></div><div className="hero-caption"><span>01 / 03</span><span>La belleza de lo que permanece</span></div></div>
        </div>
        <div className="hero-side-note">FLORES ETERNAS · DETALLES CON ALMA</div>
      </section>
      <section className="value-strip"><div className="container value-grid"><div><Flower2 /><span>Diseños artesanales</span></div><div><Heart /><span>Hechos con intención</span></div><div><Leaf /><span>Detalles para conservar</span></div></div></section>
      <section className="section essence-section" id="esencia"><div className="container essence-grid"><div className="essence-image"><img src="https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&w=1100&q=85" alt="Flores en tonos suaves" loading="lazy" /><span className="image-caption">La belleza está en los detalles.</span></div><div className="essence-copy"><span className="eyebrow">Nuestra esencia</span><h2>Flores que cuentan historias, <em>momentos que perduran.</em></h2><p>En Fiori creemos que regalar flores es una forma de decir aquello que a veces las palabras no alcanzan. Por eso creamos arreglos artesanales con dedicación, paciencia y mucho amor por los detalles.</p><p>Cada pieza busca acompañar una historia: un cumpleaños, un aniversario, un logro o simplemente las ganas de sorprender.</p><div className="essence-signature">con cariño, <span>Fiori</span></div></div></div></section>
    </main>
  );
}
