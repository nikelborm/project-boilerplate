import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { AuthTokenPairDTO } from '../../other/authTokenPair.dto';

export class RegisterUserResponseDTO {
  @IsDefined()
  @ValidateNested()
  @Type(() => AuthTokenPairDTO)
  authTokenPair!: AuthTokenPairDTO;
}
