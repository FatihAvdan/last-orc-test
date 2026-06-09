import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost, BlogPostListResponse } from '@devfolio/shared';

export function BlogPage(): React.ReactElement {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchPosts(): Promise<void> {
      try {
        const response = await fetch('/blog');
        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json() as BlogPostListResponse;
        if (!cancelled) setPosts(data.posts);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPosts();
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Blog</h1>
        <Link to="/blog/new" style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
          New Post
        </Link>
      </div>

      {loading && <p style={{ color: '#6b7280' }}>Loading posts...</p>}

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <p style={{ color: '#6b7280' }}>No blog posts yet.</p>
      )}

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {posts.map((post) => (
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
                {post.tags.map((tag: string) => (
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
