// SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Moon,
  Sun,
  Trash2,
  Laptop,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/auth.service';
import { PageHeader } from '../components/ui/PageHeader';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Session } from '../types/auth';
import { formatRelativeDateId, formatDateId } from '../utils/date';
import { containerStagger, itemFadeUp } from '../motion/variants';

export const SettingsPage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'preferences' | 'security' | 'danger'>('profile');

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Sessions State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Danger Dialogs
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'subscription') {
      authService.getMe().then((fresh) => {
        if (fresh) updateUser(fresh);
      }).catch(() => {});
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'security') {
      loadSessions();
    }
  }, [activeTab]);

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const data = await authService.getSessions();
      setSessions(data);
    } catch {
      // ignore
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const updated = await authService.updateProfile({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
      });
      updateUser(updated);
      success('Profil Diperbarui', 'Informasi akunmu berhasil disimpan');
    } catch (err: any) {
      error('Gagal Memperbarui Profil', err.response?.data?.message || err.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      await authService.revokeSession(id);
      success('Sesi Dicabut', 'Perangkat tersebut telah dikeluarkan');
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      error('Gagal Mencabut Sesi', err.response?.data?.message || err.message);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await authService.deleteAccount();
      success('Akun Dihapus', 'Seluruh data akunmu telah dihapus.');
      await logout();
      navigate('/login');
    } catch (err: any) {
      error('Gagal Menghapus Akun', err.response?.data?.message || err.message);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <motion.div
      variants={containerStagger}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      <motion.div variants={itemFadeUp}>
        <PageHeader
          title="Pengaturan"
          subtitle="Kelola profil, paket langganan, tampilan aplikasi, dan keamanan sesi akunmu"
        />
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemFadeUp}>
        <Tabs
          tabs={[
            { id: 'profile', label: 'Profil' },
            { id: 'subscription', label: 'Paket & Langganan' },
            { id: 'preferences', label: 'Preferensi' },
            { id: 'security', label: 'Keamanan & Sesi' },
            { id: 'danger', label: 'Zona Bahaya' },
          ]}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as any)}
        />
      </motion.div>

      {/* Tab Contents */}
      <motion.div variants={itemFadeUp}>
        {/* Subscription Tab */}
        {activeTab === 'subscription' && (() => {
          const subsList = Array.isArray(user?.subscription)
            ? user.subscription
            : user?.subscription
            ? [user.subscription]
            : [];
          const activeSub =
            subsList.length > 0
              ? [...subsList].sort(
                  (a, b) =>
                    new Date(b.expiresAt || 0).getTime() -
                    new Date(a.expiresAt || 0).getTime()
                )[0]
              : null;

          const tier = (user?.tier || 'FREE').toUpperCase();
          const isFree = tier === 'FREE';
          const isSuperAdmin = tier === 'SUPER_ADMIN';

          const getSubDetails = () => {
            if (isSuperAdmin) {
              return {
                title: 'Super Admin Access',
                badgeText: '♾️ Akses Penuh Sistem',
                badgeColor: '#8b5cf6',
                badgeBg: '#f3e8ff',
                daysLeftText: 'Unlimited Access',
                isLifetime: true,
                isExpired: false,
                diffDays: 9999,
                expFormatted: 'Selamanya',
              };
            }

            if (isFree || !activeSub) {
              return {
                title: 'Paket Gratis (Free)',
                badgeText: '● Akun Standar',
                badgeColor: '#64748b',
                badgeBg: '#f1f5f9',
                daysLeftText: 'Selamanya',
                isLifetime: false,
                isExpired: false,
                diffDays: 0,
                expFormatted: 'Tidak ada batas waktu',
              };
            }

            if (!activeSub.expiresAt) {
              return {
                title: `Paket ${tier}`,
                badgeText: '⭐ Aktif (Tanpa Batas)',
                badgeColor: '#10b981',
                badgeBg: '#ecfdf5',
                daysLeftText: 'Aktif Tanpa Batas Waktu',
                isLifetime: true,
                isExpired: false,
                diffDays: 9999,
                expFormatted: 'Tanpa batas',
              };
            }

            const expDate = new Date(activeSub.expiresAt);
            const now = new Date();
            const diffMs = expDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            const isLifetime = expDate.getFullYear() > 2090;
            const isExpired = diffDays <= 0;

            if (isLifetime) {
              return {
                title: `Paket ${tier} (Lifetime)`,
                badgeText: '♾️ Lifetime Access',
                badgeColor: '#8b5cf6',
                badgeBg: '#f3e8ff',
                daysLeftText: 'Akses Seumur Hidup',
                isLifetime: true,
                isExpired: false,
                diffDays: 9999,
                expFormatted: 'Seumur Hidup',
              };
            }

            if (isExpired) {
              return {
                title: `Paket ${tier}`,
                badgeText: '⚠️ Masa Aktif Berakhir',
                badgeColor: '#dc2626',
                badgeBg: '#fee2e2',
                daysLeftText: 'Sudah Berakhir',
                isLifetime: false,
                isExpired: true,
                diffDays: 0,
                expFormatted: formatDateId(expDate),
              };
            }

            return {
              title: `Paket ${tier}`,
              badgeText: `● Aktif (${diffDays} Hari Lagi)`,
              badgeColor: diffDays <= 5 ? '#d97706' : '#059669',
              badgeBg: diffDays <= 5 ? '#fef3c7' : '#ecfdf5',
              daysLeftText: `${diffDays} Hari Lagi`,
              isLifetime: false,
              isExpired: false,
              diffDays,
              expFormatted: formatDateId(expDate),
            };
          };

          const sub = getSubDetails();

          return (
            <div className="settings-section">
              <h3 className="card-title mb-4" style={{ marginBottom: 'var(--space-4)' }}>
                Status Paket & Langganan
              </h3>

              <div style={{ maxWidth: '580px' }}>
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(30, 64, 175, 0.04))',
                    border: '1px solid var(--primary-200, #bfdbfe)',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '20px',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted uppercase tracking-wider font-semibold">
                      Paket Saat Ini
                    </span>
                    <span
                      style={{
                        background: sub.badgeBg,
                        color: sub.badgeColor,
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        border: `1px solid ${sub.badgeColor}30`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {sub.badgeText}
                    </span>
                  </div>

                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-700, #1d4ed8)', marginBottom: '8px' }}>
                    Rinci.in {sub.title}
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.6 }}>
                    {tier === 'PRO' || tier === 'FAMILY' || tier === 'SUPER_ADMIN'
                      ? 'Akses penuh tanpa batas: Unlimited transaksi, OCR struk belanja, asisten Rinci AI, dan laporan analitik lengkap.'
                      : 'Akses fitur dasar pengelolaan keuangan harian. Upgrade ke PRO untuk menikmati pencatatan tanpa batas dan fitur AI.'}
                  </p>

                  {/* Masa Aktif Countdown Card */}
                  <div
                    style={{
                      background: 'var(--bg-card, #ffffff)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: sub.badgeBg,
                          color: sub.badgeColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Clock size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                          SISA MASA AKTIF
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: sub.badgeColor }}>
                          {sub.daysLeftText}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        BERLAKU SAMPAI
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {sub.expFormatted}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted">Nomor WhatsApp:</span>
                      <span style={{ fontWeight: 600 }}>{user?.phone || '-'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted">Status Akun:</span>
                      <span style={{ color: 'var(--success-text, #059669)', fontWeight: 600 }}>
                        {isFree ? 'Terdaftar' : 'Terverifikasi (Pakasir QRIS)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/#pricing')}
                  >
                    {isFree || sub.isExpired ? 'Upgrade ke Pro / Family' : 'Perpanjang / Ganti Paket'}
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="settings-section">
            <h3 className="card-title mb-4" style={{ marginBottom: 'var(--space-4)' }}>
              Informasi Pengguna
            </h3>
            <form onSubmit={handleUpdateProfile} style={{ maxWidth: '520px' }}>
              <Input
                label="Nomor WhatsApp"
                value={user?.phone || ''}
                disabled
                hint="Nomor WhatsApp terverifikasi sebagai identitas login utama"
              />

              <Input
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Input
                label="Alamat Email (Opsional)"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button
                type="submit"
                variant="primary"
                isLoading={isUpdatingProfile}
                style={{ marginTop: 'var(--space-4)' }}
              >
                Simpan Perubahan
              </Button>
            </form>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="settings-section">
            <h3 className="card-title mb-4" style={{ marginBottom: 'var(--space-4)' }}>
              Tampilan & Regional
            </h3>

            <div style={{ maxWidth: '520px' }}>
              <div className="settings-row">
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                    Tema Aplikasi
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    Pilih antara mode Terang atau Gelap
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={theme === 'light' ? 'primary' : 'outline'}
                    size="sm"
                    leftIcon={<Sun size={14} />}
                    onClick={() => setTheme('light')}
                  >
                    Terang
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'primary' : 'outline'}
                    size="sm"
                    leftIcon={<Moon size={14} />}
                    onClick={() => setTheme('dark')}
                  >
                    Gelap
                  </Button>
                </div>
              </div>

              <div className="settings-row">
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                    Mata Uang Standar
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    Mata uang utama pelaporan
                  </div>
                </div>
                <Badge variant="neutral">Rupiah Indonesia (IDR)</Badge>
              </div>

              <div className="settings-row">
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                    Bahasa Antarmuka
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    Bahasa sistem aplikasi
                  </div>
                </div>
                <Badge variant="neutral">Bahasa Indonesia</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Security & Sessions Tab */}
        {activeTab === 'security' && (
          <div className="settings-section">
            <div className="flex items-center justify-between mb-4" style={{ marginBottom: 'var(--space-4)' }}>
              <div>
                <h3 className="card-title">Sesi Login Aktif</h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  Daftar perangkat yang saat ini memiliki akses ke akunmu
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={loadSessions}>
                Muat Ulang
              </Button>
            </div>

            {isLoadingSessions ? (
              <div className="flex flex-col gap-3">
                <div className="session-item animate-pulse">Memuat sesi...</div>
              </div>
            ) : sessions.length === 0 ? (
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', padding: 'var(--space-4) 0' }}>
                Hanya ada 1 sesi aktif saat ini.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sessions.map((s) => (
                  <div key={s.id} className="session-item">
                    <div className="flex items-center gap-3">
                      <Laptop size={20} color="var(--text-secondary)" />
                      <div>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                          {s.device || 'Perangkat Web'}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                          IP: {s.ip || 'Lokal'} • Login: {formatRelativeDateId(s.createdAt)}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger"
                      onClick={() => handleRevokeSession(s.id)}
                    >
                      Cabut Sesi
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Danger Zone */}
        {activeTab === 'danger' && (
          <div className="settings-section" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--danger-500)' }}>
              <AlertTriangle size={20} />
              <h3 className="card-title" style={{ color: 'var(--danger-500)' }}>
                Zona Bahaya
              </h3>
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
              Tindakan di bawah ini bersifat permanen dan tidak dapat dibatalkan.
            </p>

            <div className="settings-row" style={{ borderBottom: 'none' }}>
              <div>
                <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                  Hapus Akun dan Seluruh Data Keuangan
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', maxWidth: '420px' }}>
                  Menghapus akun akan menghilangkan seluruh dompet, transaksi, kategori, anggaran, dan riwayat AI secara permanen dari server.
                </div>
              </div>

              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 size={14} />}
                onClick={() => setIsDeleteAccountOpen(true)}
              >
                Hapus Akun Saya
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Delete Account Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Hapus Akun Permanen?"
        message="PERINGATAN: Seluruh data keuangan, dompet, transaksi, dan anggaranmu akan dihapus secara permanen dari sistem Rinci.in dan TIDAK DAPAT dipulihkan kembali."
        confirmText="Ya, Hapus Akun Saya"
        isDanger
        isLoading={isDeletingAccount}
      />
    </motion.div>
  );
};
