import {
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
export function validateAdminPassword(password: unknown): boolean {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured?.trim())
    throw new ServiceUnavailableException(
      'Operação administrativa indisponível.',
    );
  return (
    typeof password === 'string' && !!password.trim() && password === configured
  );
}
export function requireAdminPassword(password: unknown): void {
  if (!validateAdminPassword(password))
    throw new ForbiddenException('Senha de administrador inválida.');
}
