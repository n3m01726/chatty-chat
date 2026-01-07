/**
 * Formate un timestamp en format lisible
 * @param {string|Date} timestamp - Le timestamp à formater
 * @param {boolean} showDate - Afficher la date si ce n'est pas aujourd'hui
 * @returns {string} - Heure formatée (ex: "14:30" ou "Hier à 14:30")
 */
export function formatTime(timestamp, showDate = false) {
    const date = new Date(timestamp);
    const now = new Date();
    
    const timeStr = date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    if (!showDate) {
      return timeStr;
    }
    
    // Vérifier si c'est aujourd'hui
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return timeStr;
    }
    
    // Vérifier si c'est hier
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isYesterday) {
      return `Hier à ${timeStr}`;
    }
    
    // Sinon, afficher la date complète
    const dateStr = date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
    
    return `${dateStr} à ${timeStr}`;
  }
  
  /**
   * Formate un timestamp en format relatif (il y a X minutes)
   * @param {string|Date} timestamp 
   * @returns {string}
   */
  export function formatRelativeTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "À l'instant";
    if (diffMins === 1) return "Il y a 1 minute";
    if (diffMins < 60) return `Il y a ${diffMins} minutes`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "Il y a 1 heure";
    if (diffHours < 24) return `Il y a ${diffHours} heures`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    
    return formatTime(timestamp, true);
  }