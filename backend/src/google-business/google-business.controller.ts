import { Controller, Get, Query } from '@nestjs/common';
import { GoogleBusinessService } from './google-business.service';

@Controller('api/google-business')
export class GoogleBusinessController {
  constructor(private readonly googleBusinessService: GoogleBusinessService) {}

  @Get('place-details')
  async getPlaceDetails() {
    return this.googleBusinessService.getPlaceDetails();
  }

  @Get('reviews')
  async getReviews(@Query('refresh') refresh?: string) {
    const forceRefresh = refresh === 'true';
    return this.googleBusinessService.getReviews(forceRefresh);
  }

  @Get('stats')
  async getBusinessStats() {
    return this.googleBusinessService.getBusinessStats();
  }
}
