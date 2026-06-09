import React, { useState } from 'react';
import { SEOHead } from '../components/SEOHead';
import type { ExportFormat, ExportRequest, ExportResponse } from '@devfolio/shared';

export function ExportPage(): React.ReactElement {
  const [portfolioId, setPortfolioId] = useState(1);
  const [format, setFormat] = useState<ExportFormat>('html');
  const [exportUrl, setExportUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async (): Promise<void> => {
    setError('');
    setExportUrl('');
    setLoading(true);

    try {
      const request: ExportRequest = { portfolioId, format };

      const response = await fetch('/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const err = await response.json() as { error: string };
        setError(err.error || 'Export failed');
        setLoading(false);
        return;
      }

      const data = await response.json() as ExportResponse;
      setExportUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <SEOHead title="Export Portfolio | DevFolio" description="Export your portfolio as HTML or PDF" keywords="export, download, portfolio" />
      <h1>Export Portfolio</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        Download your portfolio as an HTML page or PDF document.
      </p>

      <div style={{ background: '#f9fafb', padding: '2rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="portfolioId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Portfolio ID</label>
          <input
            id="portfolioId"
            type="number"
            value={portfolioId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPortfolioId(parseInt(e.target.value, 10))}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1rem' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Format</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="format"
                value="html"
                checked={format === 'html'}
                onChange={() => setFormat('html')}
              />
              HTML
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="format"
                value="pdf"
                checked={format === 'pdf'}
                onChange={() => setFormat('pdf')}
              />
              PDF
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={loading}
          style={{ width: '100%', padding: '0.75rem', background: loading ? '#93c5fd' : '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Generating...' : `Export ${format.toUpperCase()}`}
        </button>

        {error && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef2f2', borderRadius: '4px', color: '#dc2626' }}>
            {error}
          </div>
        )}

        {exportUrl && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#ecfdf5', borderRadius: '4px', color: '#065f46' }}>
            Export generated! <a href={exportUrl} target="_blank" rel="noopener noreferrer">Open {format.toUpperCase()}</a>
          </div>
        )}
      </div>
    </div>
  );
}
