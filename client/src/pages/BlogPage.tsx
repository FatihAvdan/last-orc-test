import React from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '@devfolio/shared';

const MOCK_POSTS: BlogPost[] = [
  {
    id: 1,
    user_id: 1,
    title: 'Getting Started with TypeScript',
    slug: 'getting-started-typescript',
    content_md: '# Getting Started\nTypeScript is great.',
    content_html: '<h1>Getting Started</h1><p>TypeScript is great.</p>',
    excerpt: 'Learn the basics of TypeScript',
    cover_image: null,
    tags: ['typescript', 'javascript'],
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    views: 42,
  },
  {
    id: 2,
    user_id: 1,
    title: 'Building REST APIs with Express',
    slug: 'building-rest-apis-express',
    content_md: '# REST APIs\nExpress makes it easy.',
    content_html: '<h1>REST APIs</h1><p>Express makes it easy.</p>',
    excerpt: 'How to build REST APIs',
    cover_image: null,
    tags: ['express', 'nodejs'],
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    views: 27,
  },
];

export function BlogPage(): React.ReactElement {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Blog</h1>
        <Link to="/blog/new" style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
          New Post
        </Link>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {MOCK_POSTS.map((post) => (
          <article key={post.id} style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <h2 style={{ margin: '0 0 0.5rem 0' }}>
              <Link to={`/blog/${post.slug}`} style={{ color: '#111827', textDecoration: 'none' }}>
                {post.title}
              </Link>
            </h2>
            <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>{post.excerpt}</p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem', color: '#9ca3af' }}>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
              <span>{post.views} views</span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {post.tags.map((tag) => (
                  <span key={tag} style={{ background: '#f3f4f6', padding: '0.125rem 0.5rem', borderRadius: '4px' }}>{tag}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
