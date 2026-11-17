import { ArrowDown, ArrowUpRight, Flower2, Heart, Leaf, Sparkles } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Catalog } from '../components/Catalog';
import { ContactSection } from '../components/ContactSection';
import { Assistant } from '../components/Assistant';
import { whatsappUrl } from '../utils';

const heroImage = 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1500&q=90';

export function HomePage() {
  return (
    <>
      <Header />
      <main>
        <section className="hero-section" id="inicio">
          <div className="container hero-grid">
            <div className="hero-copy"><span className="eyebrow"><span className="eyebrow-dot" /> Flores eternas, hechas con intención</span><h1>Hay detalles que merecen <em>quedarse.</em></h1><p>Convertimos flores, colores y pequeños gestos en recuerdos hechos a mano para acompañar tus momentos más bonitos.</p><div className="hero-actions"><a className="button button--dark" href="#esencia">Conoce Fiori <ArrowUpRight size={17} /></a><a className="text-link" href="#esencia">Nuestra esencia <ArrowDown size={15} /></a></div><div className="hero-signature"><span className="signature-line" /><span>Un detalle que florece para siempre</span></div></div>
            <div className="hero-visual"><div className="hero-photo-frame"><img src={heroImage} alt="Composición floral de inspiración para Fiori" /></div><div className="hero-stamp"><span>hecho</span><strong>a mano</strong><span>con cariño</span></div><div className="hero-caption"><span>01 / 03</span><span>La belleza de lo que permanece</span></div></div>
          </div>
          <div className="hero-side-note">FLORES ETERNAS · DETALLES CON ALMA</div>
        </section>
        <section className="value-strip" aria-label="Lo que hace especial a Fiori"><div className="container value-grid"><div><Flower2 /><span>Diseños artesanales</span></div><div><Heart /><span>Hechos con intención</span></div><div><Leaf /><span>Detalles para conservar</span></div><div><Sparkles /><span>Personalizados para ti</span></div></div></section>
        <section className="section essence-section" id="esencia"><div className="container essence-grid"><div className="essence-image"><img src="https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&w=1100&q=85" alt="Flores en tonos suaves" loading="lazy" /><span className="image-caption">La belleza está en los detalles.</span></div><div className="essence-copy"><span className="eyebrow">Nuestra esencia</span><h2>Flores que cuentan historias, <em>momentos que perduran.</em></h2><p>En Fiori creemos que regalar flores es una forma de decir aquello que a veces las palabras no alcanzan. Por eso creamos arreglos artesanales con dedicación, paciencia y mucho amor por los detalles.</p><p>Cada pieza busca acompañar una historia: un cumpleaños, un aniversario, un logro o simplemente las ganas de sorprender.</p><a className="text-link" href="#contacto">Cuéntanos tu historia <ArrowUpRight size={16} /></a><div className="essence-signature">con cariño, <span>Fiori</span></div></div></div></section>
        <section className="season-banner"><div className="container season-inner"><span className="eyebrow">Una idea, muchas formas de florecer</span><h2>Tu detalle puede ser tan único <em>como quien lo recibe.</em></h2><a className="button button--light" href={whatsappUrl('Hola, Fiori. Quiero personalizar un arreglo floral.')} target="_blank" rel="noreferrer">Diseñar un arreglo <ArrowUpRight size={16} /></a></div><span className="season-decoration">f</span></section>
        <Catalog />
        <section className="care-section" id="cuidados"><div className="container care-grid"><div><span className="eyebrow">Un cariño que se conserva</span><h2>Unas flores eternas también merecen <em>mucho amor.</em></h2><p>Para conservar su belleza, mantenlas en un lugar seco, lejos del sol directo y del agua. Retira el polvo suavemente con una brocha limpia y evita aplastarlas.</p><a className="text-link" href={whatsappUrl('Hola, Fiori. ¿Me comparten más consejos para cuidar mis flores eternas?')} target="_blank" rel="noreferrer">Pregúntanos sobre sus cuidados <ArrowUpRight size={16} /></a></div><div className="care-image"><img src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1100&q=85" alt="Ramo floral en tonos rosados" loading="lazy" /><span>Cuídalas con delicadeza ♡</span></div></div></section>
        <ContactSection />
      </main>
      <Footer />
      <Assistant />
    </>
  );
}
