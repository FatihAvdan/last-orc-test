import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';
import type { BlogPost } from '@devfolio/shared';

export function BlogPostPage(): React.ReactElement {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchPost(): Promise<void> {
      try {
        const response = await fetch(`/blog/${slug}`);
        if (!response.ok) throw new Error('Post not found');
        const data = await response.json() as BlogPost;
        if (!cancelled) setPost(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPost();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: '#6b7280' }}>Loading post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <SEOHead title="Post Not Found | DevFolio" description="Blog post not found" keywords="blog" />
        <h1>Post Not Found</h1>
        <p style={{ color: '#6b7280' }}>{error || 'The blog post you are looking for does not exist.'}</p>
        <Link to="/blog" style={{ color: '#3b82f6' }}>Back to Blog</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <SEOHead
        title={`${post.title} | DevFolio Blog`}
        description={post.excerpt || post.title}
        keywords={post.tags.join(', ')}
        ogType="article"
        canonicalUrl={`https://devfolio.app/blog/${post.slug}`}
      />

      <Link to="/blog" style={{ color: '#3b82f6', fontSize: '0.875rem', marginBottom: '1rem', display: 'inline-block' }}>
        ← Back to Blog
      </Link>

      {post.cover_image && (
        <img src={post.cover_image} alt={post.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '2rem' }} />
      )}

      <h1 style={{ fontSize: '2.5rem', lineHeight: 1.2, marginBottom: '0.5rem' }}>{post.title}</h1>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem', color: '#6b7280', fontSize: '0.875rem' }}>
        <span>{new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        <span>{post.views} views</span>
      </div>

      {post.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem' }}>
          {post.tags.map((tag: string) => (
            <span key={tag} style={{ background: '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.875rem', color: '#374151' }}>{tag}</span>
          ))}
        </div>
      )}

      <article
        style={{ lineHeight: 1.8, fontSize: '1.125rem', color: '#374151' }}
        dangerouslySetInnerHTML={{ __html: post.content_html }}
      />

      <div style={{ marginTop: '3rem', padding: '2rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <Link to={`/blog/${post.slug}/edit`} style={{ color: '#3b82f6', marginRight: '1rem' }}>
          Edit Post
        </Link>
        <Link to="/contact" style={{ color: '#3b82f6' }}>
          Contact Author
        </Link>
      </div>
    </div>
  );
}
