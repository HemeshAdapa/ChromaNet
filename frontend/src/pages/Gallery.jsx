import { useEffect, useState } from 'react';
import { Trash2, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const res = await axios.get(`${backendUrl}/api/gallery`);
      setItems(res.data);
    } catch (error) {
      console.error('Failed to fetch gallery', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this colorized image?')) return;
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      await axios.delete(`${backendUrl}/api/gallery/${id}`);
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  return (
    <div className="flex flex-col items-center" style={{ minHeight: '80vh', padding: '2rem 1rem', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 className="heading-font mb-2 text-center" style={{ fontSize: '2.5rem', color: 'white' }}>
        History Gallery
      </h2>
      <p className="text-secondary mb-8 text-center" style={{ fontSize: '1.1rem' }}>
        View and manage your previously colorized images side-by-side.
      </p>

      {loading ? (
        <div className="text-secondary">Loading gallery...</div>
      ) : items.length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '3rem', borderRadius: '16px', opacity: 0.8 }}>
          <ImageIcon size={48} className="mx-auto mb-4" color="#9ca3af" />
          <h3 className="mb-2" style={{ fontSize: '1.2rem', color: '#e5e7eb' }}>No images yet</h3>
          <p className="text-secondary">Upload and colorize an image to see it here!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', width: '100%' }}>
          {items.map(item => (
            <div key={item.id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', position: 'relative' }}>
              
              <button 
                onClick={() => handleDelete(item.id)}
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', zIndex: 10, transition: 'all 0.2s ease' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                title="Delete Image"
              >
                <Trash2 size={18} />
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
                <div className="flex flex-col">
                  <span className="mb-2 text-center" style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Before (Grayscale)</span>
                  <div style={{width:'100%', aspectRatio:'1/1', overflow:'hidden', borderRadius:'8px', backgroundColor:'#111'}}>
                      <img src={item.inputUrl} alt="Grayscale" style={{ width: '100%', height:'100%', objectFit: 'cover', filter: 'grayscale(100%)' }} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="mb-2 text-center" style={{ fontSize: '0.9rem', color: '#10b981' }}>After (Colorized)</span>
                  <div style={{width:'100%', aspectRatio:'1/1', overflow:'hidden', borderRadius:'8px', backgroundColor:'#111', boxShadow: '0 0 10px rgba(16,185,129,0.1)'}}>
                      <img src={item.outputUrl} alt="Colorized" style={{ width: '100%', height:'100%', objectFit: 'cover' }} />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center" style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                {new Date(item.timestamp).toLocaleString()}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
