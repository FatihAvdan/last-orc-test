import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';
import type { PublicProfile } from '@devfolio/shared';

export function PublicProfilePage(): React.ReactElement {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile(): Promise<void> {
      try {
        const response = await fetch(`/p/${slug}`);
        if (!response.ok) throw new Error('Profile not found');
        const data = await response.json() as PublicProfile;
        if (!cancelled) setProfile(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProfile();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: '#6b7280' }}>Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <SEOHead title="Profile Not Found | DevFolio" description="Profile not found" keywords="portfolio" />
        <h1>Profile Not Found</h1>
        <p style={{ color: '#6b7280' }}>{error || 'The profile you are looking for does not exist.'}</p>
      </div>
    );
  }

  const aboutSection = profile.sections.find((s) => s.type === 'about');
  const skillSections = profile.sections.filter((s) => s.type === 'skills');

  return (
    <div>
      <SEOHead
        title={`${profile.title} | DevFolio`}
        description={`${profile.user.name}'s developer portfolio`}
        keywords="portfolio, developer, projects"
        ogType="profile"
        canonicalUrl={`https://devfolio.app/p/${slug || ''}`}
      />

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', color: profile.theme.colors.text, marginBottom: '0.5rem' }}>
            {profile.title}
          </h1>
          <p style={{ color: profile.theme.colors.textSecondary, fontSize: '1.125rem' }}>
            {profile.user.email}
          </p>
        </header>

        {aboutSection && (
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ color: profile.theme.colors.primary }}>
              {aboutSection.title}
            </h2>
            <p style={{ color: profile.theme.colors.text }}>
              {(aboutSection.content as Record<string, string>).bio}
            </p>
          </section>
        )}

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: profile.theme.colors.primary }}>Projects</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {profile.projects.map((project) => (
              <div key={project.id} style={{ background: profile.theme.colors.surface, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${profile.theme.colors.border}` }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: profile.theme.colors.text }}>{project.title}</h3>
                <p style={{ color: profile.theme.colors.textSecondary, margin: '0 0 1rem 0' }}>{project.description}</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {project.live_url && <a href={project.live_url} target="_blank" rel="noopener noreferrer" style={{ color: profile.theme.colors.primary }}>Live Demo</a>}
                  {project.repo_url && <a href={project.repo_url} target="_blank" rel="noopener noreferrer" style={{ color: profile.theme.colors.primary }}>Source Code</a>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {skillSections.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ color: profile.theme.colors.primary }}>Skills</h2>
            {skillSections.map((section) => {
              const content = section.content as Record<string, string[]>;
              return (
                <div key={section.id}>
                  {Object.entries(content).map(([category, items]) => (
                    <div key={category} style={{ marginBottom: '1rem' }}>
                      <h4 style={{ color: profile.theme.colors.text, marginBottom: '0.5rem' }}>{category}</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {items.map((item) => (
                          <span key={item} style={{ background: profile.theme.colors.primary, color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.875rem' }}>
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
        )}

        {profile.blogPosts.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ color: profile.theme.colors.primary }}>Recent Blog Posts</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {profile.blogPosts.map((post) => (
                <article key={post.id} style={{ padding: '1rem', background: profile.theme.colors.surface, borderRadius: '8px', border: `1px solid ${profile.theme.colors.border}` }}>
                  <h3 style={{ margin: '0 0 0.25rem 0', color: profile.theme.colors.text }}>{post.title}</h3>
                  <p style={{ color: profile.theme.colors.textSecondary, margin: 0, fontSize: '0.875rem' }}>{post.excerpt}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
