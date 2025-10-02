import { Module } from '@nestjs/common';
import { RemixController } from './remix/remix.controller';
import { RemixService } from './remix/remix.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { GoogleBusinessModule } from './google-business/google-business.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [AuthModule, GoogleBusinessModule, SupabaseModule],
  controllers: [AuthController, RemixController],
  providers: [PrismaService, RemixService],
})
export class AppModule {}
