import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    setError(null);
    setFile(selectedFile);
    
    // Create preview
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processImage = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.post(`${backendUrl}/colorize`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        // Create base64 for original to pass in state
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          navigate('/result', {
            state: {
              inputImage: reader.result,
              outputImage: response.data.image
            }
          });
        };
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to colorize image. Ensure backend API is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: '60vh', paddingTop: '2rem' }}>
      <h2 className="heading-font mb-4 text-center" style={{ fontSize: '2.5rem' }}>Upload Image</h2>
      <p className="mb-4 text-center">Select or drag & drop a grayscale image to colorize.</p>
      
      <div 
        className="glass-panel text-center" 
        style={{ 
          width: '100%', 
          maxWidth: '600px', 
          padding: '3rem',
          border: '2px dashed var(--glass-border)',
          position: 'relative'
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleChange} 
          accept="image/*" 
          style={{ display: 'none' }} 
        />
        
        {preview ? (
          <div>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img 
                src={preview} 
                alt="Preview" 
                style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px' }} 
              />
              <button 
                onClick={(e) => { e.stopPropagation(); clearSelection(); }}
                style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '-15px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>
            <p className="mt-2 text-secondary">{file.name}</p>
          </div>
        ) : (
          <div style={{ cursor: 'pointer' }}>
            <UploadCloud size={64} color="#8b5cf6" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#fff' }}>Click to upload</h3>
            <p style={{ fontSize: '0.9rem' }}>or drag and drop your image here</p>
            <p style={{ fontSize: '0.8rem', marginTop: '1rem', opacity: 0.6 }}>Supports JPG, PNG, WEBP</p>
          </div>
        )}
      </div>
      
      {error && (
        <div style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: '8px', marginTop: '1rem', border: '1px solid #ef4444' }}>
          {error}
        </div>
      )}
      
      <div className="mt-4">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="spinner"></div>
            <p className="heading-font" style={{ color: '#a78bfa', animation: 'pulse 1.5s infinite' }}>
              Processing with Deep Learning model...
            </p>
          </div>
        ) : (
          <button 
            onClick={processImage} 
            disabled={!file} 
            className="btn-primary"
            style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}
          >
            <ImageIcon size={24} />
            Colorize Image
          </button>
        )}
      </div>
    </div>
  );
}
