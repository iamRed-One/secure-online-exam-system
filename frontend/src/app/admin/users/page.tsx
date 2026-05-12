'use client';
import { useEffect, useState } from 'react';
import apiFetch from '../../lib/api';

type User = { id: string; email: string; role: string; created_at: string };

export default function AdminUsersPage() {
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await apiFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setSuccess(`User ${form.email} created.`);
      setForm({ email: '', password: '', role: 'STUDENT' });
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  }

  const ROLE_BADGE: Record<string, string> = {
    STUDENT: 'bg-blue-100 text-blue-800',
    TEACHER: 'bg-green-100 text-green-800',
    ADMIN:   'bg-red-100 text-red-800',
  };

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">User Management</h1>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}

      {/* Create user form */}
      <section className="bg-white border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Create New User</h2>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end">
          <input
            required type="email" placeholder="Email"
            className="border rounded-lg px-3 py-2 text-sm text-black flex-1 min-w-[180px]"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
          <input
            required type="password" placeholder="Password"
            className="border rounded-lg px-3 py-2 text-sm text-black flex-1 min-w-[140px]"
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
          <select
            className="border rounded-lg px-3 py-2 text-sm text-black"
            value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
          >
            <option value="STUDENT">STUDENT</option>
            <option value="TEACHER">TEACHER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <button type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700">
            Create
          </button>
        </form>
      </section>

      {/* Users table */}
      <section className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-800">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${ROLE_BADGE[u.role] || ''}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
