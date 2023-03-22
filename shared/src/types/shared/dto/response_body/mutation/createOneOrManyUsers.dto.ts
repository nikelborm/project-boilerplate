import { NestedArrayDTO, NestedDTO } from '../../../../../tools/shared';
import { BasicUserInfoWithNullableAvatarWithIdDTO } from '../../other/basicUserInfoWithId.dto';

export class CreateOneUserResponseDTO {
  @NestedDTO(() => BasicUserInfoWithNullableAvatarWithIdDTO)
  user!: BasicUserInfoWithNullableAvatarWithIdDTO;
}

export class CreateManyUsersResponseDTO {
  @NestedArrayDTO(() => BasicUserInfoWithNullableAvatarWithIdDTO)
  createdUsers!: BasicUserInfoWithNullableAvatarWithIdDTO[];
}
