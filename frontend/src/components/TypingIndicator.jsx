/**
 * Composant TypingIndicator - Affiche qui est en train d'écrire
 */
export default function TypingIndicator({ typingUsers }) {
    if (!typingUsers || typingUsers.length === 0) {
      return null;
    }
  
    // Formater le texte selon le nombre d'utilisateurs
    const getTypingText = () => {
      const count = typingUsers.length;
      
      if (count === 1) {
        return `${typingUsers[0].username} est en train d'écrire`;
      } else if (count === 2) {
        return `${typingUsers[0].username} et ${typingUsers[1].username} sont en train d'écrire`;
      } else if (count === 3) {
        return `${typingUsers[0].username}, ${typingUsers[1].username} et ${typingUsers[2].username} sont en train d'écrire`;
      } else {
        return `Plusieurs personnes sont en train d'écrire`;
      }
    };
  
    return (
      <div className="typing-indicator">
        <div className="typing-indicator__dots">
          <span className="typing-indicator__dot"></span>
          <span className="typing-indicator__dot"></span>
          <span className="typing-indicator__dot"></span>
        </div>
        <span className="typing-indicator__text">
          {getTypingText()}...
        </span>
      </div>
    );
  }