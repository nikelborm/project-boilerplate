import { Type } from 'class-transformer';
import { IsArray, IsDefined, ValidateNested } from 'class-validator';
import { AuthTokenPairDTO } from '../../other/authTokenPair.dto';

export class RegisterUserResponseDTO {
  @IsDefined()
  @ValidateNested()
  @Type(() => AuthTokenPairDTO)
  authTokenPair!: AuthTokenPairDTO;
}
