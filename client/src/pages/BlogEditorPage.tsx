import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BlogEditor } from '../components/BlogEditor';

export function BlogEditorPage(): React.ReactElement {
  const navigate = useNavigate();

  const handleSave = (data: { title: string; content_md: string; excerpt: string; tags: string[]; is_published: boolean }): void => {
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    console.log('Saving post:', { ...data, slug });
    navigate('/blog');
  };

  return (
    <div>
      <h1>New Blog Post</h1>
      <BlogEditor onSave={handleSave} />
    </div>
  );
}
