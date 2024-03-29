export enum ContactType {
  PHONE = 'phone',
  EMAIL = 'email',
}

export interface ContactInformation {
  type: ContactType;
  value: string;
}

export type AlternativeContacts = ContactInformation[];
