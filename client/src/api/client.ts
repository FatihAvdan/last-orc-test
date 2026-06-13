import type {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  Portfolio,
  PortfolioListResponse,
  PortfolioDetailResponse,
  PortfolioCreateRequest,
  PortfolioUpdateRequest,
} from '@devfolio/shared';

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

    if (response.status === 204) {
      return undefined as T;
    }

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

  async getPortfolios(): Promise<PortfolioListResponse> {
    return this.request<PortfolioListResponse>('/portfolios');
  }

  async getPortfolio(id: number): Promise<PortfolioDetailResponse> {
    return this.request<PortfolioDetailResponse>(`/portfolios/${id}`);
  }

  async createPortfolio(data: PortfolioCreateRequest): Promise<PortfolioDetailResponse> {
    return this.request<PortfolioDetailResponse>('/portfolios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePortfolio(id: number, data: PortfolioUpdateRequest): Promise<PortfolioDetailResponse> {
    return this.request<PortfolioDetailResponse>(`/portfolios/${id}`, {
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

  get isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export { type Portfolio };
export const api = new ApiClient();
