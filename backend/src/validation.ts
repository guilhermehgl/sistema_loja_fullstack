import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
function details(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => [
    ...Object.values(error.constraints ?? {}),
    ...details(error.children ?? []),
  ]);
}
export function createValidationPipe() {
  return new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors) =>
      new BadRequestException({
        message: 'Dados inválidos enviados para a API.',
        errors: details(errors),
      }),
  });
}
