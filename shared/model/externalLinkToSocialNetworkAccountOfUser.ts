export interface ExternalLinkToSocialNetworkAccountOfUser {
  url: string;
  type: SocialNetworkType;
}

export type ManyLinksToSocialNetworks =
  ExternalLinkToSocialNetworkAccountOfUser[];

export enum SocialNetworkType {
  FACEBOOK = 'facebook',
}
