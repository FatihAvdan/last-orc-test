import React, { useState } from 'react';
import { SEOHead } from '../components/SEOHead';
import type { ContactRequest, ContactResponse } from '@devfolio/shared';

export function ContactPage(): React.ReactElement {
  const [formData, setFormData] = useState<ContactRequest>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json() as { error: string };
        setError(err.error || 'Failed to send message');
        setLoading(false);
        return;
      }

      const data = await response.json() as ContactResponse;
      if (data.success) {
        setSubmitted(true);
      } else {
        setError('Failed to send message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <SEOHead title="Contact | DevFolio" description="Get in touch" keywords="contact, message" />
        <h1>Thank You!</h1>
        <p>Your message has been sent. We will get back to you soon.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <SEOHead title="Contact | DevFolio" description="Get in touch with us" keywords="contact, message, support" />
      <h1>Contact Us</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        Have a question or want to get in touch? Send us a message.
      </p>

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1rem' }}
            placeholder="Your name"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1rem' }}
            placeholder="your@email.com"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="subject" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Subject</label>
          <input
            id="subject"
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1rem' }}
            placeholder="What's this about?"
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="message" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1rem', resize: 'vertical' }}
            placeholder="Your message..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '0.75rem', background: loading ? '#93c5fd' : '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
