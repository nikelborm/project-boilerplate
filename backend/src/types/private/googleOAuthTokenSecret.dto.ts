import { IsString, IsUrl } from 'class-validator';
import { IsArrayOfURLs, NestedDTO } from '../../tools/shared';

/* eslint-disable camelcase */
export class GoogleOAuthTokenSecretDTO {
  @IsString()
  client_id!: string;

  @IsString()
  project_id!: string;

  @IsUrl()
  auth_uri!: string;

  @IsUrl()
  token_uri!: string;

  @IsUrl()
  auth_provider_x509_cert_url!: string;

  @IsString()
  client_secret!: string;

  @IsArrayOfURLs()
  redirect_uris!: string[];

  @IsArrayOfURLs()
  javascript_origins!: string[];
}
/* eslint-enable camelcase */
export class GoogleOAuthTokenSecretWrapperDTO {
  @NestedDTO(() => GoogleOAuthTokenSecretDTO)
  web!: GoogleOAuthTokenSecretDTO;
}
