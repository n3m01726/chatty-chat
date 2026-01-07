import { useState, useEffect, useRef } from 'react';

// IMPORTANT : Tu devras créer un compte gratuit sur Tenor
// https://tenor.com/gifapi/documentation
// Et remplacer cette clé par la tienne
const TENOR_API_KEY = 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCF0'; // Clé de démo

/**
 * Composant GIF Picker - Recherche et sélection de GIFs via Tenor API
 */
export default function GifPicker({ onSelectGif, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);
  const pickerRef = useRef(null);
  
  // Focus sur l'input au montage
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);
  
  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  // Fermer en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  
  // Charger les GIFs tendances au démarrage
  useEffect(() => {
    fetchTrendingGifs();
  }, []);
  
  // Rechercher des GIFs
  const searchGifs = async (query) => {
    if (!query.trim()) {
      fetchTrendingGifs();
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=20&media_filter=gif`
      );
      
      if (!response.ok) throw new Error('Erreur de recherche');
      
      const data = await response.json();
      setGifs(data.results || []);
    } catch (err) {
      console.error('Erreur recherche GIF:', err);
      setError('Impossible de charger les GIFs');
    } finally {
      setLoading(false);
    }
  };
  
  // Charger les GIFs tendances
  const fetchTrendingGifs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://tenor.googleapis.com/v2/featured?key=${TENOR_API_KEY}&limit=20&media_filter=gif`
      );
      
      if (!response.ok) throw new Error('Erreur de chargement');
      
      const data = await response.json();
      setGifs(data.results || []);
    } catch (err) {
      console.error('Erreur chargement GIFs:', err);
      setError('Impossible de charger les GIFs tendances');
    } finally {
      setLoading(false);
    }
  };
  
  // Gérer la recherche avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchGifs(searchTerm);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const handleSelectGif = (gif) => {
    // On prend la version "gif" de taille moyenne
    const gifUrl = gif.media_formats?.gif?.url || gif.media_formats?.tinygif?.url;
    
    if (gifUrl) {
      onSelectGif({
        url: gifUrl,
        title: gif.content_description || 'GIF'
      });
    }
  };
  
  return (
    <div className="gif-picker-overlay">
      <div className="gif-picker" ref={pickerRef}>
        <div className="gif-picker__header">
          <h3 className="gif-picker__title">Rechercher un GIF</h3>
          <button onClick={onClose} className="gif-picker__close">✕</button>
        </div>
        
        <div className="gif-picker__search">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="gif-picker__search-input"
          />
        </div>
        
        <div className="gif-picker__content">
          {loading && (
            <div className="gif-picker__loading">Chargement...</div>
          )}
          
          {error && (
            <div className="gif-picker__error">{error}</div>
          )}
          
          {!loading && !error && gifs.length === 0 && (
            <div className="gif-picker__empty">Aucun GIF trouvé</div>
          )}
          
          {!loading && !error && gifs.length > 0 && (
            <div className="gif-picker__grid">
              {gifs.map((gif) => (
                <div
                  key={gif.id}
                  className="gif-picker__item"
                  onClick={() => handleSelectGif(gif)}
                >
                  <img
                    src={gif.media_formats?.tinygif?.url || gif.media_formats?.gif?.url}
                    alt={gif.content_description}
                    className="gif-picker__image"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="gif-picker__footer">
          Powered by Tenor
        </div>
      </div>
    </div>
  );
}