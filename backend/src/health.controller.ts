import { Controller, Get } from '@nestjs/common';

// Endpoint simples para monitoramento de disponibilidade do backend.
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'sistema-loja-backend',
    };
  }
}
