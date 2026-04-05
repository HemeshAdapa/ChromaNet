import { Link } from 'react-router-dom';
import { ArrowRight, Image as ImageIcon, Wand2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center mt-4" style={{ minHeight: '70vh' }}>
      <div className="mb-4" style={{ animation: 'float 6s ease-in-out infinite' }}>
        <Wand2 size={64} color="#a78bfa" />
      </div>
      
      <h1>Bring Black & White <br/> Photos to Life</h1>
      
      <p className="mb-4" style={{ maxWidth: '600px', fontSize: '1.2rem' }}>
        Experience the power of Deep Learning. Our AutoEncoder and GAN architecture 
        semantically analyzes your grayscale images to produce incredibly realistic colorizations.
      </p>
      
      <div className="flex gap-2 mb-4">
        <Link to="/upload" className="btn-primary">
          <ImageIcon size={20} />
          Try it Now
        </Link>
        <Link to="/about" className="btn-secondary">
          Learn How It Works <ArrowRight size={20} />
        </Link>
      </div>

      <div className="glass-panel mt-4" style={{ display: 'flex', gap: '2rem', alignItems: 'center', maxWidth: '800px', margin: '3rem auto' }}>
        <div style={{ flex: 1 }}>
          <img 
            src="https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80&sat=-100" 
            alt="Grayscale input" 
            style={{ width: '100%', borderRadius: '12px', filter: 'grayscale(100%)' }} 
          />
          <p className="mt-2 text-center" style={{ fontSize: '0.9rem' }}>Input (Grayscale)</p>
        </div>
        <ArrowRight size={40} color="#a78bfa" />
        <div style={{ flex: 1 }}>
          <img 
            src="https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
            alt="Colorized output" 
            style={{ width: '100%', borderRadius: '12px' }} 
          />
          <p className="mt-2 text-center" style={{ fontSize: '0.9rem' }}>Output (Colorized)</p>
        </div>
      </div>
    </div>
  );
}
