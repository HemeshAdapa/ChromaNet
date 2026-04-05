import { Layers, Zap, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

export default function About() {
  const steps = [
    {
      icon: <ImageIcon size={32} color="#6366f1" />,
      title: '1. Input Grayscale Image',
      desc: 'Upload any black-and-white image. The system validates and preprocesses it to a standardized format (128x128 pixels, normalized).'
    },
    {
      icon: <Layers size={32} color="#ec4899" />,
      title: '2. AutoEncoder Feature Extraction',
      desc: 'The AutoEncoder\'s deep CNN layers extract profound structural features and generate a base set of colors matching the semantics.'
    },
    {
      icon: <Zap size={32} color="#8b5cf6" />,
      title: '3. GAN Refinement',
      desc: 'A Generative Adversarial Network analyzes the autoencoder output, adjusting tones to make the colorization indistinguishable from real photos.'
    },
    {
      icon: <CheckCircle2 size={32} color="#10b981" />,
      title: '4. Final Colorization',
      desc: 'The model converts the tensor back into high-fidelity RGB space, returning the beautifully restored full-color image.'
    }
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '2rem' }}>
      <h2 className="text-center heading-font mb-4" style={{ fontSize: '3rem', background: 'linear-gradient(90deg, #6366f1, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        How It Works
      </h2>
      
      <div className="glass-panel mb-4">
        <h3 className="mb-2" style={{ fontSize: '1.5rem', color: '#fff' }}>Architecture: AutoEncoder + GAN</h3>
        <p>
          Image colorization is an intrinsically ill-posed problem, as a single grayscale pixel can logically map to many colors. 
          Our architecture combines the stable feature extraction capabilities of an <strong>AutoEncoder</strong> with the realistic 
          texture generation of a <strong>Generative Adversarial Network (GAN)</strong>.
        </p>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', marginTop: '1.5rem' }}>
          <p style={{ margin: 0, fontStyle: 'italic', color: '#ddd' }}>
            "The generator (AutoEncoder) learns to map the L channel (lightness) to the a,b channels (color components), 
            while the discriminator learns to distinguish between true color images and our generated ones, forcing the 
            generator to produce highly realistic tones."
          </p>
        </div>
      </div>

      <h3 className="heading-font mb-2 mt-4" style={{ fontSize: '2rem', textAlign: 'center' }}>Step-by-Step Workflow</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {steps.map((step, idx) => (
          <div key={idx} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
              {step.icon}
            </div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#fff' }}>{step.title}</h4>
            <p style={{ fontSize: '0.95rem' }}>{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
