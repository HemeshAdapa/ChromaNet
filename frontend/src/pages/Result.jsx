import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, RefreshCcw, Settings, Activity, Layers, Cpu, Clock, SlidersHorizontal } from 'lucide-react';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { inputImage, outputImage } = location.state || {};

  const [sliderPos, setSliderPos] = useState(50);
  const [brightness, setBrightness] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [temperature, setTemperature] = useState(0);

  useEffect(() => {
    if (!inputImage || !outputImage) {
      navigate('/upload');
    }
  }, [inputImage, outputImage, navigate]);

  if (!inputImage || !outputImage) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = outputImage;
    a.download = `colorized_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Temperature overlay calculation
  // > 0 = warmer (orange/yellow tint), < 0 = cooler (blue tint)
  const tempColor = temperature > 0 ? 'rgba(255, 150, 0, ' : 'rgba(0, 100, 255, ';
  const tempOpacity = Math.abs(temperature) / 200; // max 50% opacity
  const filterStyle = {
    filter: `brightness(${brightness}%) saturate(${saturation}%)`,
  };

  return (
    <div className="flex flex-col items-center" style={{ minHeight: '80vh', padding: '2rem 1rem', width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
      
      <p className="text-secondary mb-6 text-center" style={{ fontSize: '1.1rem' }}>
        Drag the slider to compare before and after.
      </p>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', width: '100%', alignItems: 'flex-start', justifyContent: 'center' }}>
        
        {/* Left: Image Slider */}
        <div className="glass-panel" style={{ flex: '1 1 500px', padding: '1.5rem', position: 'relative', borderRadius: '16px' }}>
           <div 
             style={{ 
               position: 'relative', 
               width: '100%', 
               aspectRatio: '5/4', 
               backgroundColor: '#111', 
               borderRadius: '12px', 
               overflow: 'hidden' 
             }}
           >
             {/* Base Image (Colorized and Filtered) */}
             <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
               <img 
                 src={outputImage} 
                 alt="Colorized Output" 
                 style={{ width: '100%', height: '100%', objectFit: 'cover', ...filterStyle }} 
               />
               {/* Temperature Overlay */}
               <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: `${tempColor}${tempOpacity})`, pointerEvents: 'none', mixBlendMode: 'overlay' }}></div>
             </div>

             {/* Overlay Image (Grayscale Input) */}
             <div style={{ 
               position: 'absolute', 
               top: 0, 
               left: 0, 
               width: '100%', 
               height: '100%', 
               clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
               pointerEvents: 'none'
             }}>
               <img 
                 src={inputImage} 
                 alt="Grayscale Input" 
                 style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
               />
             </div>
             
             {/* Slider Thumb Line */}
             <div style={{ position: 'absolute', top: '0', bottom: '0', left: `${sliderPos}%`, width: '3px', backgroundColor: 'rgba(255,255,255,0.8)', transform: 'translateX(-50%)', pointerEvents: 'none', boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
                {/* Knob */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', color: '#333' }}>
                  <SlidersHorizontal size={18} />
                </div>
             </div>
             
             {/* Invisible native range input for smooth dragging */}
             <input 
               type="range" 
               min="0" 
               max="100" 
               value={sliderPos}
               onChange={(e) => setSliderPos(e.target.value)}
               style={{
                 position: 'absolute',
                 top: 0, left: 0, width: '100%', height: '100%',
                 opacity: 0,
                 cursor: 'ew-resize',
                 margin: 0
               }} 
             />
           </div>
        </div>
        
        {/* Right: Adjustments and Metrics Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: '0 0 340px' }}>
          
          {/* Adjustments Panel */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <h3 className="flex items-center gap-2 mb-6" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              <Settings size={20} color="#a78bfa" /> Adjustments
            </h3>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span style={{ fontSize: '0.9rem', color: '#e5e7eb' }}>Intensity / Brightness</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{brightness}%</span>
              </div>
              <input type="range" min="0" max="200" value={brightness} onChange={(e) => setBrightness(e.target.value)} style={{ width: '100%', accentColor: '#8b5cf6', cursor: 'pointer' }} />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span style={{ fontSize: '0.9rem', color: '#e5e7eb' }}>Saturation</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{saturation}%</span>
              </div>
              <input type="range" min="0" max="200" value={saturation} onChange={(e) => setSaturation(e.target.value)} style={{ width: '100%', accentColor: '#8b5cf6', cursor: 'pointer' }} />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span style={{ fontSize: '0.9rem', color: '#e5e7eb' }}>Temperature</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{temperature}</span>
              </div>
              <input type="range" min="-100" max="100" value={temperature} onChange={(e) => setTemperature(e.target.value)} style={{ width: '100%', accentColor: '#8b5cf6', cursor: 'pointer' }} />
            </div>
          </div>
          
          {/* Metrics Panel */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <h3 className="flex items-center gap-2 mb-6" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              <Activity size={20} color="#e5e7eb" /> Metrics
            </h3>
            
            <div className="flex items-start gap-4 mb-5">
               <Layers size={18} color="#9ca3af" className="mt-1" />
               <div>
                 <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '2px' }}>Model Type</div>
                 <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>AutoEncoder + GAN</div>
               </div>
            </div>
            
            <div className="flex items-start gap-4 mb-5">
               <Cpu size={18} color="#9ca3af" className="mt-1" />
               <div>
                 <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '2px' }}>Input Size</div>
                 <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>128×128</div>
               </div>
            </div>
            
            <div className="flex items-start gap-4">
               <Clock size={18} color="#9ca3af" className="mt-1" />
               <div>
                 <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '2px' }}>Inference Time</div>
                 <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>790 ms</div>
               </div>
            </div>
            
          </div>
          
        </div>
      </div>
      
      <div className="flex justify-center gap-4 mt-8 w-full max-w-2xl">
        <button onClick={handleDownload} className="btn-primary" style={{ background: '#10b981', boxShadow: '0 4px 15px rgba(16,185,129,0.3)', padding: '0.8rem 2rem', flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Download size={20} />
          Download Result
        </button>
        
        <button onClick={() => navigate('/upload')} className="btn-secondary" style={{ padding: '0.8rem 2rem', flex: 1, display: 'flex', justifyContent: 'center' }}>
          <RefreshCcw size={20} />
          Process Another
        </button>
      </div>
    </div>
  );
}
