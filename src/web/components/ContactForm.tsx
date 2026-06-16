import { useState, useRef } from 'react';
import { useTheme } from '@/lib/theme';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface ContactFormProps {
  className?: string;
}

export function ContactForm({ className }: ContactFormProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const { theme } = useTheme();
  const isPine = theme === 'pine';
  const accent = isPine ? '#10B981' : '#FF6B8A';
  const border = isPine ? '#1E3A4A' : '#EAD9D9';
  const muted = isPine ? '#7FBFB5' : '#6B6B9A';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    const data = new FormData(e.currentTarget);
    if (data.get('website')) { setStatus('success'); return; }
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Unbekannter Fehler.');
      }
      setStatus('success');
      formRef.current?.reset();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unbekannter Fehler.');
      setStatus('error');
    }
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '0.9375rem',
    border: `1.5px solid ${border}`,
    borderRadius: '0.625rem',
    padding: '0.625rem 0.875rem',
    width: '100%',
    boxSizing: 'border-box',
    background: 'transparent',
    color: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '0.875rem',
    fontWeight: 600,
    color: muted,
    display: 'block',
    marginBottom: '0.375rem',
  };

  if (status === 'success') {
    return (
      <div style={{ background: '#f0faf4', border: '1.5px solid #a8d5b5', borderRadius: '0.75rem', padding: '1rem 1.25rem', marginTop: '1rem' }}>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1d6b3a', margin: 0 }}>
          ✓ Nachricht gesendet! Wir melden uns in der Regel innerhalb von 48 Stunden.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={className} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
      <input name="website" type="text" tabIndex={-1} aria-hidden="true" autoComplete="off" style={{ display: 'none' }} />
      <div>
        <label htmlFor="cf-name" style={labelStyle}>Name</label>
        <input id="cf-name" name="name" type="text" required autoComplete="name" placeholder="Dein Name" disabled={status === 'loading'} style={inputStyle} />
      </div>
      <div>
        <label htmlFor="cf-email" style={labelStyle}>E-Mail-Adresse</label>
        <input id="cf-email" name="email" type="email" required autoComplete="email" placeholder="deine@email.de" disabled={status === 'loading'} style={inputStyle} />
      </div>
      <div>
        <label htmlFor="cf-message" style={labelStyle}>Nachricht</label>
        <textarea id="cf-message" name="message" required rows={5} placeholder="Wie können wir dir helfen?" disabled={status === 'loading'} style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }} />
      </div>
      {status === 'error' && (
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', color: '#c0392b', background: '#fdf0ee', border: '1px solid #f5c6c0', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', margin: 0 }}>
          {errorMessage}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button type="submit" disabled={status === 'loading'} style={{ alignSelf: 'flex-start', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, color: '#fff', background: accent, border: 'none', borderRadius: '2rem', padding: '0.625rem 1.75rem', cursor: status === 'loading' ? 'not-allowed' : 'pointer', opacity: status === 'loading' ? 0.6 : 1 }}>
          {status === 'loading' ? 'Wird gesendet …' : 'Nachricht senden'}
        </button>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8125rem', color: muted, margin: 0 }}>
          Wir antworten in der Regel innerhalb von 48 Stunden (Mo–So).
        </p>
      </div>
    </form>
  );
}
