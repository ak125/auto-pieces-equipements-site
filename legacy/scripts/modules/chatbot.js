/**
 * Module de gestion du chatbot
 * Auto Pièces Équipements
 */

// Configuration
const CONFIG = {
  initialDelay: 800, // Délai initial avant les messages automatiques (ms)
  typingDelay: 300,  // Délai de frappe simulé (ms par caractère)
  maxTypingDelay: 2000, // Délai maximum de frappe simulée
  responses: {
    welcome: "Bonjour ! Comment puis-je vous aider à trouver la pièce idéale pour votre véhicule ?",
    default: "Merci pour votre message. Un conseiller vous répondra dans les plus brefs délais.",
    help: "Je peux vous aider à trouver des pièces, suivre une commande ou vous mettre en relation avec un expert.",
    greetings: "Bonjour ! Comment puis-je vous être utile aujourd'hui ?",
    piecesInfo: "Nous proposons des pièces détachées neuves pour toutes les marques. Que recherchez-vous précisément ?",
    livraison: "Nous livrons en 24-48h dans toute l'Île-de-France. Les frais de livraison sont offerts dès 50€ d'achat."
  }
};

// Expressions régulières pour la détection d'intentions
const INTENTS = [
  { pattern: /\b(bonjour|salut|hey|coucou)\b/i, response: 'greetings' },
  { pattern: /\b(pièces?|catalogue|disponib|stock)\b/i, response: 'piecesInfo' },
  { pattern: /\b(livraison|délai|expédition|retrait)\b/i, response: 'livraison' },
  { pattern: /\b(aide|help|assistance)\b/i, response: 'help' }
];

/**
 * Initialise le chatbot
 */
export function setupChatbot() {
  const chatToggle = document.getElementById('chat-toggle');
  const chatbox = document.getElementById('chatbot');
  const closeChat = document.getElementById('close-chat');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.querySelector('.chat-messages');
  
  if (!chatToggle || !chatbox || !closeChat || !chatInput || !chatMessages) {
    console.warn('Éléments du chatbot manquants');
    return;
  }
  
  // Gestionnaire d'ouverture/fermeture du chat
  chatToggle.addEventListener('click', () => {
    chatbox.classList.toggle('hidden');
    
    // Faire défiler jusqu'au dernier message
    scrollToBottom(chatMessages);
  });
  
  closeChat.addEventListener('click', () => {
    chatbox.classList.add('hidden');
  });
  
  // Gestion des messages
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const userMessage = chatInput.value.trim();
      if (userMessage) {
        handleUserMessage(userMessage, chatMessages, chatInput);
      }
    }
  });
  
  // Message de bienvenue après un délai
  setTimeout(() => {
    addBotMessage(CONFIG.responses.welcome, chatMessages);
  }, CONFIG.initialDelay);
}

/**
 * Traite un message utilisateur
 */
function handleUserMessage(message, chatMessages, chatInput) {
  // Ajouter le message de l'utilisateur
  addUserMessage(message, chatMessages);
  
  // Réinitialiser l'input
  chatInput.value = '';
  
  // Défilement vers le bas
  scrollToBottom(chatMessages);
  
  // Indiquer que le bot est en train d'écrire
  showBotTyping(chatMessages);
  
  // Déterminer la réponse appropriée
  const responseKey = determineResponse(message);
  const botResponse = CONFIG.responses[responseKey];
  
  // Simuler le délai de frappe avant la réponse
  const typingTime = Math.min(
    botResponse.length * CONFIG.typingDelay,
    CONFIG.maxTypingDelay
  );
  
  setTimeout(() => {
    // Supprimer l'indicateur de frappe
    removeBotTyping(chatMessages);
    
    // Ajouter la réponse du bot
    addBotMessage(botResponse, chatMessages);
    
    // Faire défiler jusqu'au dernier message
    scrollToBottom(chatMessages);
  }, typingTime);
}

/**
 * Détermine la réponse appropriée en fonction du message
 */
function determineResponse(message) {
  // Détecter l'intention en fonction des mots-clés
  for (const intent of INTENTS) {
    if (intent.pattern.test(message)) {
      return intent.response;
    }
  }
  
  // Réponse par défaut si aucune intention n'est détectée
  return 'default';
}

/**
 * Ajoute un message utilisateur à la conversation
 */
function addUserMessage(message, container) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', 'user');
  messageDiv.textContent = message;
  container.appendChild(messageDiv);
}

/**
 * Ajoute un message bot à la conversation
 */
function addBotMessage(message, container) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', 'bot');
  messageDiv.textContent = message;
  container.appendChild(messageDiv);
}

/**
 * Affiche l'indicateur "bot est en train d'écrire"
 */
function showBotTyping(container) {
  const typingDiv = document.createElement('div');
  typingDiv.classList.add('message', 'bot', 'typing');
  typingDiv.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  container.appendChild(typingDiv);
}

/**
 * Supprime l'indicateur "bot est en train d'écrire"
 */
function removeBotTyping(container) {
  const typingElement = container.querySelector('.typing');
  if (typingElement) {
    typingElement.remove();
  }
}

/**
 * Fait défiler la conversation jusqu'en bas
 */
function scrollToBottom(container) {
  container.scrollTop = container.scrollHeight;
}
