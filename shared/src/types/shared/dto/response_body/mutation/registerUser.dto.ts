import { NestedDTO } from '../../../../../tools/shared';
import { AuthTokenPairDTO } from '../../other/authTokenPair.dto';

export class RegisterUserResponseDTO {
  @NestedDTO(() => AuthTokenPairDTO)
  authTokenPair!: AuthTokenPairDTO;
}
