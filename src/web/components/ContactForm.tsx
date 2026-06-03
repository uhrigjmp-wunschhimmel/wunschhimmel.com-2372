import { useState, useRef } from 'react';
import styles from './contactForm.module.css';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface ContactFormProps {
  className?: string;
}

export function ContactForm({ className }: ContactFormProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const data = new FormData(e.currentTarget);

    // Honeypot check (anti-spam) — should always be empty
    if (data.get('website')) {
      setStatus('success'); // Silently swallow bot submissions
      return;
    }

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

  if (status === 'success') {
    return (
      <div className={`${styles.success} ${className ?? ''}`} role="alert">
        <span className={styles.successIcon}>✓</span>
        <p>Nachricht gesendet! Wir melden uns in der Regel innerhalb von 48 Stunden.</p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`${styles.form} ${className ?? ''}`}
      noValidate
    >
      {/* Honeypot — hidden from users, bots fill it in */}
      <input
        name="website"
        type="text"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        style={{ display: 'none' }}
      />

      <div className={styles.field}>
        <label htmlFor="cf-name">Name</label>
        <input
          id="cf-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Dein Name"
          disabled={status === 'loading'}
          minLength={2}
          maxLength={100}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="cf-email">E-Mail-Adresse</label>
        <input
          id="cf-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="deine@email.de"
          disabled={status === 'loading'}
          maxLength={200}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="cf-message">Nachricht</label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={5}
          placeholder="Wie können wir dir helfen?"
          disabled={status === 'loading'}
          minLength={10}
          maxLength={2000}
        />
      </div>

      {status === 'error' && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className={styles.submit}
      >
        {status === 'loading' ? 'Wird gesendet …' : 'Nachricht senden'}
      </button>

      <p className={styles.note}>
        Wir antworten in der Regel innerhalb von 48 Stunden (Mo–So).
      </p>
    </form>
  );
}
