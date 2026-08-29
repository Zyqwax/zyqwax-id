export type SafeUser = {
  id: string;
  email: string;
  name: string | null;
  avatar?: string | null;
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
