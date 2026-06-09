import React, { useState, useMemo } from 'react';
import { marked } from 'marked';

interface BlogEditorProps {
  initialContent?: string;
  initialTitle?: string;
  initialExcerpt?: string;
  initialTags?: string[];
  onSave: (data: { title: string; content_md: string; excerpt: string; tags: string[]; is_published: boolean }) => void;
}

export function BlogEditor({ initialContent, initialTitle, initialExcerpt, initialTags, onSave }: BlogEditorProps): React.ReactElement {
  const [title, setTitle] = useState(initialTitle || '');
  const [contentMd, setContentMd] = useState(initialContent || '');
  const [excerpt, setExcerpt] = useState(initialExcerpt || '');
  const [tags, setTags] = useState(initialTags || []);
  const [tagInput, setTagInput] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const previewHtml = useMemo(() => marked.parse(contentMd) as string, [contentMd]);

  const handleAddTag = (): void => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string): void => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = (): void => {
    onSave({ title, content_md: contentMd, excerpt, tags, is_published: isPublished });
  };

  return (
    <div className="blog-editor" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Post title"
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', fontSize: '1.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Excerpt (optional)"
          value={excerpt}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExcerpt(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Add tag"
          value={tagInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(); }}
          style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', flex: 1 }}
        />
        <button type="button" onClick={handleAddTag} style={{ padding: '0.5rem 1rem' }}>Add</button>
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          {tags.map((tag) => (
            <span key={tag} style={{ background: '#e9ecef', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}>
              {tag}
              <button type="button" onClick={() => handleRemoveTag(tag)} style={{ marginLeft: '0.25rem', border: 'none', background: 'none', cursor: 'pointer' }}>&times;</button>
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <button type="button" onClick={() => setPreviewMode(!previewMode)} style={{ marginRight: '0.5rem', padding: '0.5rem 1rem' }}>
          {previewMode ? 'Edit' : 'Preview'}
        </button>
      </div>

      {previewMode ? (
        <div
          style={{ minHeight: '400px', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', background: '#fff' }}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      ) : (
        <textarea
          placeholder="Write your markdown here..."
          value={contentMd}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContentMd(e.target.value)}
          style={{ width: '100%', minHeight: '400px', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.875rem' }}
        />
      )}

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <input type="checkbox" checked={isPublished} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsPublished(e.target.checked)} />
          Publish
        </label>
        <button type="button" onClick={handleSave} style={{ padding: '0.75rem 2rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Save Post
        </button>
      </div>
    </div>
  );
}
