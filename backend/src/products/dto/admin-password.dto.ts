import { IsString, MinLength } from 'class-validator';

// DTO reutilizável para rotas que exigem credencial administrativa.
export class AdminPasswordDto {
  @IsString()
  @MinLength(1)
  adminPassword: string;
}
