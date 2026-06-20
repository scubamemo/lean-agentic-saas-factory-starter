import { Module } from '@nestjs/common';
import { TenancyModule } from './tenancy/tenancy.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [TenancyModule, AuthModule],
})
export class AppModule {}
