// Configuration des variables d'environnement pour Vite
export const config = {
  GOOGLE_PLACE_ID: 'ChIJVVXZlqAT5kcRICTpgHlqx9A',
  GOOGLE_API_KEY: 'AIzaSyBuwRyhi7erxNsoXzc8XlX0cK9oC8g--MI',
  API_BASE_URL: 'https://maps.googleapis.com/maps/api/place/details/json'
};

// Service pour récupérer les avis Google
export async function getGoogleReviews() {
  try {
    const url = `${config.API_BASE_URL}?place_id=${config.GOOGLE_PLACE_ID}&fields=name,rating,user_ratings_total,reviews,formatted_address,formatted_phone_number&key=${config.GOOGLE_API_KEY}&language=fr`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      return {
        success: true,
        data: {
          name: data.result.name,
          rating: data.result.rating,
          totalReviews: data.result.user_ratings_total,
          reviews: data.result.reviews || [],
          address: data.result.formatted_address,
          phone: data.result.formatted_phone_number
        }
      };
    } else {
      console.error('API Error:', data.status, data.error_message);
      return {
        success: false,
        error: data.status,
        message: data.error_message
      };
    }
  } catch (error) {
    console.error('Fetch Error:', error);
    return {
      success: false,
      error: 'FETCH_ERROR',
      message: error.message
    };
  }
}

// Formatter une date relative
export function formatRelativeTime(timestamp) {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `il y a ${years} an${years > 1 ? 's' : ''}`;
  if (months > 0) return `il y a ${months} mois`;
  if (weeks > 0) return `il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  if (days > 0) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  if (hours > 0) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  return 'à l\'instant';
}

// Générer les étoiles HTML
export function generateStars(rating) {
  return '⭐'.repeat(rating);
}
