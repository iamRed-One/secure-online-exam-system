'use client';
import { useEffect, useState } from 'react';


import apiFetch from '../lib/api';
import DashboardLayout from '../layout/DashboardLayout';
import { useModal } from '../hooks/useModal';
import { Modal } from '../components/ui/modal';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';
import Label from '../components/form/Label';

type Profile = {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  phone: string | null;
  bio: string | null;
  created_at: string;
};

export default function ProfilePage() {
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [role, setRole]         = useState('STUDENT');

  // Edit info modal
  const infoModal  = useModal();
  const [form, setForm] = useState({ fullName: '', phone: '', bio: '' });

  // Change password modal
  const pwdModal = useModal();
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwdError, setPwdError]   = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setRole(payload.role || 'STUDENT');
      } catch {}
    }
    apiFetch('/profile')
      .then((data: Profile) => {
        setProfile(data);
        setForm({ fullName: data.full_name || '', phone: data.phone || '', bio: data.bio || '' });
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveInfo() {
    setSaving(true); setError(''); setSuccess('');
    try {
      const data = await apiFetch('/profile', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setProfile(data);
      setSuccess('Profile updated successfully.');
      infoModal.closeModal();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    setPwdError(''); setPwdSuccess('');
    if (pwdForm.newPassword !== pwdForm.confirm) return setPwdError('Passwords do not match');
    setSaving(true);
    try {
      await apiFetch('/profile/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword }),
      });
      setPwdSuccess('Password changed successfully.');
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' });
      setTimeout(() => pwdModal.closeModal(), 1500);
    } catch (err: unknown) {
      setPwdError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  }

  const ROLE_BADGE: Record<string, string> = {
    STUDENT: 'bg-blue-100 text-blue-700',
    TEACHER: 'bg-emerald-100 text-emerald-700',
    ADMIN:   'bg-red-100 text-red-700',
  };

  if (loading) return (
    <DashboardLayout role={role as 'STUDENT' | 'TEACHER' | 'ADMIN'}>
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Loading profile…</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role={role as 'STUDENT' | 'TEACHER' | 'ADMIN'}>
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 font-outfit">My Profile</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your personal information and security settings.</p>
            </div>

            {error   && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}
            {success && <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">{success}</div>}

            {/* Avatar + name card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-brand-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                {(profile?.full_name?.[0] || profile?.email?.[0] || 'U').toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                  {profile?.full_name || 'No name set'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</p>
                <span className={`mt-2 inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${ROLE_BADGE[profile?.role || 'STUDENT']}`}>
                  {profile?.role}
                </span>
              </div>
              <button
                onClick={infoModal.openModal}
                className="flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 shadow-theme-xs transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 18 18" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M15.09 2.782a2 2 0 112.828 2.828L6.574 16.952l-2.828.707.707-2.828L15.09 2.782z" fill="currentColor"/>
                </svg>
                Edit
              </button>
            </div>

            {/* Personal information card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">Personal Information</h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Full Name</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{profile?.full_name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email Address</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{profile?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{profile?.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Role</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90 capitalize">{profile?.role?.toLowerCase()}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bio</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{profile?.bio || '—'}</p>
                </div>
              </div>
            </div>

            {/* Security card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Security</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update your password to keep your account secure.</p>
                </div>
                <button
                  onClick={pwdModal.openModal}
                  className="flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 shadow-theme-xs transition"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Member since */}
            <p className="text-xs text-gray-400 text-center pb-4">
              Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
            </p>

          </div>

      {/* Edit info modal */}
      <Modal isOpen={infoModal.isOpen} onClose={infoModal.closeModal} className="max-w-[600px] m-4">
        <div className="p-6 lg:p-10 no-scrollbar overflow-y-auto">
          <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-1">Edit Personal Information</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Update your details to keep your profile up to date.</p>

          <div className="space-y-5">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" type="text" placeholder="Your full name" value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="text" placeholder="+1 234 567 8900" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                rows={3}
                placeholder="Tell us a bit about yourself…"
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-300 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6 justify-end">
            <Button size="sm" variant="outline" onClick={infoModal.closeModal}>Cancel</Button>
            <Button size="sm" onClick={handleSaveInfo} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Change password modal */}
      <Modal isOpen={pwdModal.isOpen} onClose={pwdModal.closeModal} className="max-w-[480px] m-4">
        <div className="p-6 lg:p-10">
          <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-1">Change Password</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter your current password and choose a new one.</p>

          {pwdError   && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{pwdError}</p>}
          {pwdSuccess && <p className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{pwdSuccess}</p>}

          <div className="space-y-4">
            <div>
              <Label htmlFor="current">Current Password</Label>
              <Input id="current" type="password" placeholder="••••••••" value={pwdForm.currentPassword}
                onChange={e => setPwdForm(f => ({ ...f, currentPassword: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="newpwd">New Password</Label>
              <Input id="newpwd" type="password" placeholder="Min. 6 characters" value={pwdForm.newPassword}
                onChange={e => setPwdForm(f => ({ ...f, newPassword: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="confirm">Confirm New Password</Label>
              <Input id="confirm" type="password" placeholder="Repeat new password" value={pwdForm.confirm}
                onChange={e => setPwdForm(f => ({ ...f, confirm: e.target.value }))} />
            </div>
          </div>

          <div className="flex gap-3 mt-6 justify-end">
            <Button size="sm" variant="outline" onClick={pwdModal.closeModal}>Cancel</Button>
            <Button size="sm" onClick={handleChangePassword} disabled={saving}>
              {saving ? 'Saving…' : 'Change Password'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
