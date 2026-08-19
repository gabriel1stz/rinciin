// NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ minHeight: '80vh', padding: 'var(--space-8)' }}
    >
      <span style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--primary-500)', lineHeight: 1 }}>
        404
      </span>
      <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', marginTop: 'var(--space-4)' }}>
        Halaman Tidak Ditemukan
      </h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: 'var(--space-2) 0 var(--space-6)' }}>
        Halaman yang kamu tuju tidak tersedia atau telah dipindahkan.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" leftIcon={<Home size={16} />}>
          Kembali ke Dashboard
        </Button>
      </Link>
    </div>
  );
};
