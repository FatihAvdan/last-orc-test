export interface UserPayload {
  id: number;
  email: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

export interface ErrorResponse {
  error: string;
  statusCode: number;
}

// Portfolio types
export type ThemePreset = 'minimal' | 'dark' | 'gradient' | 'glass' | 'cyber';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
  border: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
  mono: string;
}

export interface Theme {
  id: number;
  name: string;
  preset: ThemePreset;
  colors: ThemeColors;
  fonts: ThemeFonts;
  created_at: string;
}

export interface Portfolio {
  id: number;
  user_id: number;
  title: string;
  slug: string;
  theme_id: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  theme?: Theme;
}

export interface PortfolioCreateRequest {
  title: string;
  slug: string;
  theme_id?: number;
  is_published?: boolean;
}

export interface PortfolioUpdateRequest {
  title?: string;
  slug?: string;
  theme_id?: number;
  is_published?: boolean;
}

export interface ProjectShowcase {
  id: number;
  portfolio_id: number;
  title: string;
  description: string;
  image_url: string | null;
  live_url: string | null;
  repo_url: string | null;
  order_index: number;
  created_at: string;
}

export interface ProjectCreateRequest {
  title: string;
  description: string;
  image_url?: string;
  live_url?: string;
  repo_url?: string;
  order_index?: number;
}

export interface ProjectUpdateRequest {
  title?: string;
  description?: string;
  image_url?: string | null;
  live_url?: string | null;
  repo_url?: string | null;
  order_index?: number;
}

export type CVSectionType = 'experience' | 'education' | 'skills' | 'about';

export interface CVSection {
  id: number;
  portfolio_id: number;
  type: CVSectionType;
  title: string;
  content: Record<string, unknown>;
  order_index: number;
  created_at: string;
}

export interface CVSectionCreateRequest {
  type: CVSectionType;
  title: string;
  content: Record<string, unknown>;
  order_index?: number;
}

export interface CVSectionUpdateRequest {
  type?: CVSectionType;
  title?: string;
  content?: Record<string, unknown>;
  order_index?: number;
}

export interface PortfolioListResponse {
  portfolios: Portfolio[];
}

export interface PortfolioDetailResponse {
  portfolio: Portfolio;
  projects: ProjectShowcase[];
  sections: CVSection[];
}

// Blog types
export interface BlogPost {
  id: number;
  user_id: number;
  title: string;
  slug: string;
  content_md: string;
  content_html: string;
  excerpt: string;
  cover_image: string | null;
  tags: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
  views: number;
}

export interface BlogPostCreateRequest {
  title: string;
  slug: string;
  content_md: string;
  excerpt?: string;
  cover_image?: string;
  tags?: string[];
  is_published?: boolean;
}

export interface BlogPostUpdateRequest {
  title?: string;
  slug?: string;
  content_md?: string;
  excerpt?: string;
  cover_image?: string | null;
  tags?: string[];
  is_published?: boolean;
}

export interface BlogPostListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
}

// Analytics types
export interface AnalyticsSnapshot {
  total_page_views: number;
  unique_visitors: number;
  views_today: number;
  views_this_week: number;
  views_this_month: number;
  top_pages: Array<{ path: string; views: number }>;
  daily_views: Array<{ date: string; views: number }>;
  referrers: Array<{ source: string; count: number }>;
  countries: Array<{ country: string; count: number }>;
}

// SEO types
export interface SEOMeta {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  canonicalUrl: string;
}

// Contact types
export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

// Export types
export type ExportFormat = 'html' | 'pdf';

export interface ExportRequest {
  portfolioId: number;
  format: ExportFormat;
}

export interface ExportResponse {
  url: string;
  format: ExportFormat;
  generatedAt: string;
}

// Public profile
export interface PublicProfile {
  id: number;
  slug: string;
  title: string;
  user: {
    name: string;
    email: string;
  };
  theme: Theme;
  projects: ProjectShowcase[];
  sections: CVSection[];
  blogPosts: BlogPost[];
  created_at: string;
  updated_at: string;
}
