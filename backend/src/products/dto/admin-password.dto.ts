import { IsString, Matches } from 'class-validator';
export class AdminPasswordDto {
  @IsString()
  @Matches(/\S/, { message: 'Informe a confirmação administrativa.' })
  adminPassword: string;
}
