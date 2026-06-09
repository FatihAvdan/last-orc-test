import React, { useState } from 'react';
import { SEOHead } from '../components/SEOHead';
import type { ExportFormat, ExportRequest } from '@devfolio/shared';

export function ExportPage(): React.ReactElement {
  const [portfolioId, setPortfolioId] = useState(1);
  const [format, setFormat] = useState<ExportFormat>('html');
  const [exportUrl, setExportUrl] = useState('');

  const handleExport = (): void => {
    const request: ExportRequest = { portfolioId, format };
    console.log('Exporting:', request);
    setExportUrl(`/api/export?portfolioId=${portfolioId}&format=${format}`);
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
          style={{ width: '100%', padding: '0.75rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' }}
        >
          Export {format.toUpperCase()}
        </button>

        {exportUrl && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#ecfdf5', borderRadius: '4px', color: '#065f46' }}>
            Export generated! <a href={exportUrl} target="_blank" rel="noopener noreferrer">Open {format.toUpperCase()}</a>
          </div>
        )}
      </div>
    </div>
  );
}
