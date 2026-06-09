import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { BlogEditorPage } from './pages/BlogEditorPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { ContactPage } from './pages/ContactPage';
import { ExportPage } from './pages/ExportPage';
import { SEOHead } from './components/SEOHead';

export function App(): React.ReactElement {
  return (
    <>
      <SEOHead
        title="DevFolio"
        description="Create your developer portfolio"
        keywords="portfolio, developer, resume, CV"
      />
      <nav style={{ padding: '1rem', background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/blog" style={{ marginRight: '1rem' }}>Blog</Link>
        <Link to="/blog/new" style={{ marginRight: '1rem' }}>New Post</Link>
        <Link to="/analytics" style={{ marginRight: '1rem' }}>Analytics</Link>
        <Link to="/contact" style={{ marginRight: '1rem' }}>Contact</Link>
        <Link to="/export" style={{ marginRight: '1rem' }}>Export</Link>
      </nav>
      <main style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/new" element={<BlogEditorPage />} />
          <Route path="/blog/:slug/edit" element={<BlogEditorPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/p/:slug" element={<PublicProfilePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/export" element={<ExportPage />} />
        </Routes>
      </main>
    </>
  );
}

function HomePage(): React.ReactElement {
  return (
    <div>
      <h1>Welcome to DevFolio</h1>
      <p>Create your developer portfolio and share it with the world.</p>
    </div>
  );
}
