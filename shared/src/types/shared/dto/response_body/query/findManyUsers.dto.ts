import { NestedArrayDTO } from '../../../../../tools/shared';
import { BasicUserInfoWithNullableAvatarWithIdDTO } from '../../other/basicUserInfoWithId.dto';

export class FindManyUsersResponseDTO {
  @NestedArrayDTO(() => BasicUserInfoWithNullableAvatarWithIdDTO)
  users!: BasicUserInfoWithNullableAvatarWithIdDTO[];
}
