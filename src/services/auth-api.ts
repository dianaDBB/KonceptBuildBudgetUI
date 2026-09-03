import axiosClient from './api';
import { LoginCredentials, LoginResponse } from '@/types/authentication';

const ACCESS_TOKEN_KEY = 'konceptbuild.accessToken';
const USERNAME_KEY = 'konceptbuild.username';

class AuthApi {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getUsername(): string | null {
    return localStorage.getItem(USERNAME_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return Boolean(token) && !this.isTokenExpired(token);
  }

  async login(credentials: LoginCredentials): Promise<void> {
    const response = await axiosClient.post<LoginResponse>('/auth/login', credentials, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });

    const accessToken = response.data.accessToken;
    if (!accessToken) {
      throw new Error('Login response did not include an access token.');
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(USERNAME_KEY, response.data.username || credentials.username);
  }

  public clearAccessToken(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
  }

  async logout(): Promise<void> {
    const token = this.getAccessToken();

    if (token && !this.isTokenExpired(token)) {
      try {
        await axiosClient.post('/auth/logout', undefined, {
          headers: { Accept: 'application/json' },
        });
      } catch {
        // Ignore API failures on logout
      }
    }

    this.clearAccessToken();
  }

  isTokenExpired(token: string | null): boolean {
    if (!token) {
      return true;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }

  async checkAuthentication(): Promise<void> {
    const token = this.getAccessToken();

    if (this.isTokenExpired(token)) {
      this.clearAccessToken();
    }
  }
}

export default new AuthApi();
