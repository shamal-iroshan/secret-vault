export type VaultItemType = "password" | "note";

export type EncryptedPayload = {
  iv: string;
  data: string;
};

export type VaultForm = {
  title: string;
  username: string;
  website: string;
  secret: string;
  note: string;
  type: VaultItemType;
};

export type VaultItem = VaultForm & {
  id: string;
  createdAt?: string;
  createdAtClient?: string;
};

export type UserVaultDocument = {
  uid: string;
  email: string | null;
  salt: string;
  keyCheck: EncryptedPayload;
};

export type VaultFirestoreDocument = {
  encrypted?: EncryptedPayload;
  createdAt?: {
    toDate?: () => Date;
  };
};

export const emptyForm: VaultForm = {
  title: "",
  username: "",
  website: "",
  secret: "",
  note: "",
  type: "password",
};
