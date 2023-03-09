import { NestedArrayDTO, NestedDTO } from '../../../../../tools/shared';
import { BasicUserInfoWithIdDTO } from '../../other/basicUserInfoWithId.dto';

export class CreateOneUserResponse {
  @NestedDTO(() => BasicUserInfoWithIdDTO)
  user!: BasicUserInfoWithIdDTO;
}

export class CreateManyUsersResponseDTO {
  @NestedArrayDTO(() => BasicUserInfoWithIdDTO)
  createdUsers!: BasicUserInfoWithIdDTO[];
}
