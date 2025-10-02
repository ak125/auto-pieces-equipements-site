import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface GoogleReview {
  id: string;
  author_name: string;
  rating: number;
  text: string;
  time: number;
  profile_photo_url?: string;
}

export interface GooglePlaceDetails {
  name: string;
  rating: number;
  user_ratings_total: number;
  formatted_address: string;
  formatted_phone_number?: string;
  opening_hours?: any;
  website?: string;
  reviews?: GoogleReview[];
}

@Injectable()
export class GoogleBusinessService {
  private readonly apiKey: string;
  private readonly placeId: string;

  constructor(
    private supabaseService: SupabaseService,
  ) {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    this.placeId = process.env.GOOGLE_PLACE_ID || '';

    if (!this.apiKey || !this.placeId) {
      throw new Error('Google Maps API credentials are missing');
    }
  }

  /**
   * Récupère les détails du lieu depuis Google Places API
   */
  async getPlaceDetails(): Promise<GooglePlaceDetails> {
    try {
      const fields = 'name,rating,user_ratings_total,formatted_address,formatted_phone_number,opening_hours,website,reviews';
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${this.placeId}&fields=${fields}&key=${this.apiKey}&language=fr`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new HttpException(
          `Google API HTTP error: ${response.statusText}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      const data = await response.json();

      if (data.status !== 'OK') {
        throw new HttpException(
          `Google Places API error: ${data.status}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      return data.result;
    } catch (error) {
      console.error('Error fetching place details:', error);
      throw new HttpException(
        'Failed to fetch place details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Récupère les avis depuis Google et les cache dans Supabase
   */
  async getReviews(forceRefresh = false): Promise<GoogleReview[]> {
    try {
      // Vérifier si on a des avis en cache
      if (!forceRefresh) {
        const cachedReviews = await this.getCachedReviews();
        if (cachedReviews && cachedReviews.length > 0) {
          return cachedReviews;
        }
      }

      // Sinon, récupérer depuis Google
      const placeDetails = await this.getPlaceDetails();
      const reviews = placeDetails.reviews || [];

      // Sauvegarder en cache
      await this.cacheReviews(reviews);

      return reviews;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }

  /**
   * Récupère les avis depuis le cache Supabase
   */
  private async getCachedReviews(): Promise<GoogleReview[] | null> {
    try {
      const supabase = this.supabaseService.getClient();
      const { data, error } = await supabase
        .from('google_reviews_cache')
        .select('*')
        .order('cached_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;

      // Vérifier si le cache a moins de 24h
      const cacheAge = Date.now() - new Date(data.cached_at).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 heures

      if (cacheAge > maxAge) return null;

      return data.reviews;
    } catch (error) {
      console.error('Error fetching cached reviews:', error);
      return null;
    }
  }

  /**
   * Sauvegarde les avis dans Supabase
   */
  private async cacheReviews(reviews: GoogleReview[]): Promise<void> {
    try {
      const supabase = this.supabaseService.getClient();
      await supabase.from('google_reviews_cache').insert({
        reviews,
        cached_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error caching reviews:', error);
      // Non-bloquant
    }
  }

  /**
   * Récupère les statistiques du business
   */
  async getBusinessStats() {
    const placeDetails = await this.getPlaceDetails();
    
    return {
      name: placeDetails.name,
      rating: placeDetails.rating,
      totalReviews: placeDetails.user_ratings_total,
      address: placeDetails.formatted_address,
      phone: placeDetails.formatted_phone_number,
      website: placeDetails.website,
      openingHours: placeDetails.opening_hours,
    };
  }
}
