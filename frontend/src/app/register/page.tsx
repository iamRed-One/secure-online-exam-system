'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiFetch from '../lib/api';

export default function RegisterPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [role, setRole]         = useState('STUDENT');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      });
      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm space-y-4"
      >
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">Secure Exam System</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 text-sm px-3 py-2 rounded">
            {error}
          </div>
        )}

        <input
          type="email" required placeholder="Email address"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email} onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password" required placeholder="Password"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password} onChange={e => setPassword(e.target.value)}
        />
        <input
          type="password" required placeholder="Confirm password"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={confirm} onChange={e => setConfirm(e.target.value)}
        />

        <div>
          <label className="block text-sm text-gray-600 mb-1">I am a</label>
          <div className="flex gap-3">
            {['STUDENT', 'TEACHER'].map(r => (
              <label key={r} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio" name="role" value={r}
                  checked={role === r} onChange={() => setRole(r)}
                />
                <span className="text-sm capitalize">{r.toLowerCase()}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
