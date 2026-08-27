export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  enabled: boolean;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
}
