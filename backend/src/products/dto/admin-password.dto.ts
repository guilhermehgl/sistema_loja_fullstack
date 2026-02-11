import { IsString, MinLength } from 'class-validator';

export class AdminPasswordDto {
  @IsString()
  @MinLength(1)
  adminPassword: string;
}
