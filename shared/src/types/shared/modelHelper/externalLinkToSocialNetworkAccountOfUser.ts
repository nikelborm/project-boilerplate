export enum SocialNetworkType {
  FACEBOOK = 'facebook',
}

export interface ExternalLinkToSocialNetworkAccountOfUser {
  url: string;
  type: SocialNetworkType;
}

export type ManyLinksToSocialNetworks =
  ExternalLinkToSocialNetworkAccountOfUser[];
