export type SafeUser = {
  id: string;
  email: string;
  name: string | null;
  username?: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  avatarPublicId?: string | null;
  emailVerified?: boolean;
  usernameChangedAt?: string | null;
  emailChangedAt?: string | null;
  nameChangedAt?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  user: SafeUser;
  accessToken: string;
};

export type ApiErrorShape = {
  error?: string;
  message?: string;
};
