'use client';
import { useEffect, useState } from 'react';
import apiFetch from '../../lib/api';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type User = { id: string; email: string; role: string; created_at: string };

export default function AdminUsersPage() {
  const pathname = usePathname();
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ email: '', password: '', role: 'STUDENT' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function fetchUsers() {
    try {
      const data = await apiFetch('/admin/users');
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handleDeleteUser(id: string, email: string) {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    try {
      await apiFetch(`/admin/users/${id}`, { method: 'DELETE' },
        { loading: 'Deleting user…', success: 'User deleted', error: 'Failed to delete user' });
      fetchUsers();
    } catch {}
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await apiFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify(form),
      }, { loading: 'Creating user…', success: 'User created!', error: 'Failed to create user' });
      setSuccess(`User ${form.email} created.`);
      setForm({ email: '', password: '', role: 'STUDENT' });
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  }

  const ROLE_BADGE: Record<string, string> = {
    STUDENT: 'bg-blue-100 text-blue-700',
    TEACHER: 'bg-emerald-100 text-emerald-700',
    ADMIN:   'bg-red-100 text-red-700',
  };

  const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500';

  const tabs = [
    { label: 'Users', href: '/admin/users' },
    { label: 'Exams & Questions', href: '/admin/exams' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="ADMIN" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title="User Management" role="ADMIN" />
        <main className="flex-1 p-8 overflow-auto">
        {/* Tab navigation */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6">
          {tabs.map(tab => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? 'bg-white shadow-sm text-slate-800'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {error   && <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}
        {success && <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">{success}</div>}

        {/* Create user form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Create New User</h2>
          <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs text-slate-500 mb-1">Email</label>
              <input
                required
                type="email"
                placeholder="user@example.com"
                className={inputCls}
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-slate-500 mb-1">Password</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                className={inputCls}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>
            <div className="min-w-[130px]">
              <label className="block text-xs text-slate-500 mb-1">Role</label>
              <select
                className={inputCls}
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              >
                <option value="STUDENT">STUDENT</option>
                <option value="TEACHER">TEACHER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Create
            </button>
          </form>
        </div>

        {/* Users table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left font-medium tracking-wide">Email</th>
                <th className="px-6 py-3 text-left font-medium tracking-wide">Role</th>
                <th className="px-6 py-3 text-left font-medium tracking-wide">Joined</th>
                <th className="px-6 py-3 text-left font-medium tracking-wide"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-800">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${ROLE_BADGE[u.role] || 'bg-slate-100 text-slate-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteUser(u.id, u.email)}
                      className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-slate-400 text-sm">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </main>
      </div>
    </div>
  );
}
