import { Module } from '@nestjs/common';
import { GoogleBusinessController } from './google-business.controller';
import { GoogleBusinessService } from './google-business.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [GoogleBusinessController],
  providers: [GoogleBusinessService],
  exports: [GoogleBusinessService],
})
export class GoogleBusinessModule {}
