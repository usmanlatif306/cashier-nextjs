interface AuthResponse {
  success: boolean;
  message: string;
  client_secret?: string;
  link?: string;
}
