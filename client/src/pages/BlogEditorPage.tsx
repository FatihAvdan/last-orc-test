import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BlogEditor } from '../components/BlogEditor';
import type { BlogPost } from '@devfolio/shared';

export function BlogEditorPage(): React.ReactElement {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [error, setError] = useState('');

  const handleSave = async (data: {
    title: string;
    content_md: string;
    excerpt: string;
    tags: string[];
    is_published: boolean;
  }): Promise<void> => {
    setError('');
    const postSlug = slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    try {
      const response = await fetch('/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          slug: postSlug,
        }),
      });

      if (!response.ok) {
        const err = await response.json() as { error: string };
        setError(err.error || 'Failed to save post');
        return;
      }

      await response.json() as BlogPost;
      navigate('/blog');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    }
  };

  return (
    <div>
      <h1>{slug ? 'Edit Blog Post' : 'New Blog Post'}</h1>
      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      <BlogEditor onSave={handleSave} />
    </div>
  );
}
