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
  const isTeal = theme === 'teal';
  const accent = isTeal ? '#2DD4BF' : '#FF6B8A';
  const border = isTeal ? '#1E3A4A' : '#EAD9D9';
  const muted = isTeal ? '#7FBFB5' : '#6B6B9A';

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
        </p
