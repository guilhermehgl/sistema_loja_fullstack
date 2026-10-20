import {
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { requireAdminPassword, validateAdminPassword } from './admin-password';
describe('Confirmação administrativa', () => {
  const original = process.env.ADMIN_PASSWORD;
  afterEach(() => {
    if (original === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = original;
  });
  it.each([undefined, '', '   '])(
    'recusa configuração ausente/vazia: %s',
    (configured) => {
      if (configured === undefined) delete process.env.ADMIN_PASSWORD;
      else process.env.ADMIN_PASSWORD = configured;
      expect(() => validateAdminPassword(undefined)).toThrow(
        ServiceUnavailableException,
      );
      expect(() => requireAdminPassword('qualquer')).toThrow(
        ServiceUnavailableException,
      );
    },
  );
  it.each([undefined, null, '', '   ', 123, {}, [], 'incorreta'])(
    'recusa entrada inválida: %j',
    (password) => {
      process.env.ADMIN_PASSWORD = 'somente-deste-teste';
      expect(validateAdminPassword(password)).toBe(false);
      expect(() => requireAdminPassword(password)).toThrow(ForbiddenException);
    },
  );
  it('aceita confirmação exata', () => {
    process.env.ADMIN_PASSWORD = 'somente-deste-teste';
    expect(validateAdminPassword(process.env.ADMIN_PASSWORD)).toBe(true);
    expect(() =>
      requireAdminPassword(process.env.ADMIN_PASSWORD),
    ).not.toThrow();
  });
});
