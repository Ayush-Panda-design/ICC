import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { login } from '../api/auth';

export default function LoginGate({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(password);
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Wrong password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-bg flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-red/10 flex items-center justify-center">
            <Lock className="text-accent-red" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-accent-red">ICC</h1>
            <p className="text-sm text-text-muted">Enter access password</p>
          </div>
        </div>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-3 py-2 rounded-lg border border-border bg-cream-card focus:outline-none focus:border-accent-yellow"
        />
        {error && <p className="text-sm text-accent-red">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full py-2 rounded-lg bg-accent-red text-white font-medium disabled:opacity-50"
        >
          {loading ? 'Checking…' : 'Unlock'}
        </button>
        <p className="text-xs text-text-muted">Set <code>ICC_ACCESS_PASSWORD</code> in server <code>.env</code>.</p>
      </form>
    </div>
  );
}
