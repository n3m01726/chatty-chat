/**
 * Parse le markdown simplifié (à la Discord)
 * Supporte: **gras**, *italique*, __souligné__, ~~barré~~, `code`, ```code block```
 * 
 * @param {string} text - Le texte à parser
 * @returns {string} - HTML sécurisé
 */
export function parseMarkdown(text) {
    if (!text) return '';
    
    // Escape HTML pour éviter XSS
    let html = escapeHtml(text);
    
    // Code blocks (doit être fait en premier pour éviter les conflits)
    html = html.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
    });
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    
    // Gras
    html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italique
    html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
    
    // Souligné
    html = html.replace(/__([^_]+)__/g, '<u>$1</u>');
    
    // Barré
    html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    
    // Liens (détection automatique)
    html = html.replace(
      /(https?:\/\/[^\s<]+)/g, 
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    // Remplacer les retours à la ligne par des <br>
    html = html.replace(/\n/g, '<br>');
    
    return html;
  }
  
  /**
   * Escape les caractères HTML pour éviter XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  /**
   * Vérifie si un texte contient du markdown
   */
  export function hasMarkdown(text) {
    const markdownPatterns = [
      /\*\*[^\*]+\*\*/,  // Gras
      /\*[^\*]+\*/,       // Italique
      /__[^_]+__/,        // Souligné
      /~~[^~]+~~/,        // Barré
      /`[^`]+`/,          // Code
      /```[\s\S]*?```/    // Code block
    ];
    
    return markdownPatterns.some(pattern => pattern.test(text));
  }