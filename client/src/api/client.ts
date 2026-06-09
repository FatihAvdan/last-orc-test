import type { AuthResponse, RegisterRequest, LoginRequest } from '@devfolio/shared';

const API_BASE = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data as T;
  }

  async register(req: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  async login(req: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  async getPortfolios(): Promise<Portfolio[]> {
    return this.request<Portfolio[]>('/portfolios');
  }

  async getPortfolio(id: number): Promise<Portfolio> {
    return this.request<Portfolio>(`/portfolios/${id}`);
  }

  async createPortfolio(data: CreatePortfolioRequest): Promise<Portfolio> {
    return this.request<Portfolio>('/portfolios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePortfolio(id: number, data: UpdatePortfolioRequest): Promise<Portfolio> {
    return this.request<Portfolio>(`/portfolios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePortfolio(id: number): Promise<void> {
    return this.request<void>(`/portfolios/${id}`, {
      method: 'DELETE',
    });
  }

  clearToken(): void {
    localStorage.removeItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }
}

export interface Portfolio {
  id: number;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePortfolioRequest {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  tags: string[];
}

export type UpdatePortfolioRequest = Partial<CreatePortfolioRequest>;

export const api = new ApiClient();
