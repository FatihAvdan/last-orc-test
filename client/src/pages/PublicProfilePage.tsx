import React from 'react';
import { useParams } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';
import type { PublicProfile } from '@devfolio/shared';

const MOCK_PROFILE: PublicProfile = {
  id: 1,
  slug: 'johndoe',
  title: 'John Doe - Full Stack Developer',
  user: {
    name: 'John Doe',
    email: 'john@example.com',
  },
  theme: {
    id: 1,
    name: 'Minimal',
    preset: 'minimal',
    colors: {
      primary: '#3b82f6',
      secondary: '#10b981',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      textSecondary: '#6b7280',
      accent: '#f59e0b',
      border: '#e5e7eb',
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    created_at: '2024-01-01T00:00:00Z',
  },
  projects: [
    {
      id: 1,
      portfolio_id: 1,
      title: 'E-Commerce Platform',
      description: 'A full-stack e-commerce platform built with React and Node.js',
      image_url: null,
      live_url: 'https://example.com',
      repo_url: 'https://github.com/johndoe/ecommerce',
      order_index: 0,
      created_at: '2024-02-01T00:00:00Z',
    },
    {
      id: 2,
      portfolio_id: 1,
      title: 'Task Manager API',
      description: 'RESTful API for task management with real-time updates',
      image_url: null,
      live_url: 'https://tasks.example.com',
      repo_url: 'https://github.com/johndoe/taskmanager',
      order_index: 1,
      created_at: '2024-03-01T00:00:00Z',
    },
  ],
  sections: [
    {
      id: 1,
      portfolio_id: 1,
      type: 'about',
      title: 'About Me',
      content: { bio: 'Full stack developer with 5 years of experience' },
      order_index: 0,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      portfolio_id: 1,
      type: 'skills',
      title: 'Skills',
      content: { languages: ['TypeScript', 'JavaScript', 'Python', 'Go'], frameworks: ['React', 'Node.js', 'Express'] },
      order_index: 1,
      created_at: '2024-01-01T00:00:00Z',
    },
  ],
  blogPosts: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
};

export function PublicProfilePage(): React.ReactElement {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div>
      <SEOHead
        title={`${MOCK_PROFILE.title} | DevFolio`}
        description={`${MOCK_PROFILE.user.name}'s developer portfolio`}
        keywords="portfolio, developer, projects"
        ogType="profile"
        canonicalUrl={`https://devfolio.app/p/${slug}`}
      />

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', color: MOCK_PROFILE.theme.colors.text, marginBottom: '0.5rem' }}>
            {MOCK_PROFILE.title}
          </h1>
          <p style={{ color: MOCK_PROFILE.theme.colors.textSecondary, fontSize: '1.125rem' }}>
            {MOCK_PROFILE.user.email}
          </p>
        </header>

        {MOCK_PROFILE.sections.find((s) => s.type === 'about') && (
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ color: MOCK_PROFILE.theme.colors.primary }}>
              {MOCK_PROFILE.sections.find((s) => s.type === 'about')?.title}
            </h2>
            <p style={{ color: MOCK_PROFILE.theme.colors.text }}>
              {(MOCK_PROFILE.sections.find((s) => s.type === 'about')?.content as Record<string, string>).bio}
            </p>
          </section>
        )}

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: MOCK_PROFILE.theme.colors.primary }}>Projects</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {MOCK_PROFILE.projects.map((project) => (
              <div key={project.id} style={{ background: MOCK_PROFILE.theme.colors.surface, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${MOCK_PROFILE.theme.colors.border}` }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: MOCK_PROFILE.theme.colors.text }}>{project.title}</h3>
                <p style={{ color: MOCK_PROFILE.theme.colors.textSecondary, margin: '0 0 1rem 0' }}>{project.description}</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {project.live_url && <a href={project.live_url} target="_blank" rel="noopener noreferrer" style={{ color: MOCK_PROFILE.theme.colors.primary }}>Live Demo</a>}
                  {project.repo_url && <a href={project.repo_url} target="_blank" rel="noopener noreferrer" style={{ color: MOCK_PROFILE.theme.colors.primary }}>Source Code</a>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: MOCK_PROFILE.theme.colors.primary }}>Skills</h2>
          {MOCK_PROFILE.sections.filter((s) => s.type === 'skills').map((section) => {
            const content = section.content as Record<string, string[]>;
            return (
              <div key={section.id}>
                {Object.entries(content).map(([category, items]) => (
                  <div key={category} style={{ marginBottom: '1rem' }}>
                    <h4 style={{ color: MOCK_PROFILE.theme.colors.text, marginBottom: '0.5rem' }}>{category}</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {items.map((item) => (
                        <span key={item} style={{ background: MOCK_PROFILE.theme.colors.primary, color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.875rem' }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
