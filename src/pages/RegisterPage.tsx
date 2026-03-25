import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/auth';
import { getErrorMessage } from '../api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const RegisterPage: React.FC = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', username: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((e2) => ({ ...e2, [field]: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.email.includes('@')) errs.email = 'Enter a valid email address.';
    if (form.username.length < 3) errs.username = 'Username must be at least 3 characters.';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const { data: tokenData } = await authApi.register({
        email: form.email,
        username: form.username,
        password: form.password,
      });
      // Store token in Zustand persist format so API interceptor can read it
      const authState = { state: { token: tokenData.access_token, user: null } };
      localStorage.setItem('mythic-auth', JSON.stringify(authState));
      const { data: user } = await authApi.me();
      setAuth(tokenData.access_token, user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Mythic AI
        </h1>
        <p className="mt-2 text-gray-400 text-sm">Create your account</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit} noValidate aria-label="Registration form">
          <div className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
              required
              placeholder="you@example.com"
              error={errors.email}
            />
            <Input
              label="Username"
              type="text"
              value={form.username}
              onChange={set('username')}
              autoComplete="username"
              required
              placeholder="your_username"
              error={errors.username}
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={set('password')}
              autoComplete="new-password"
              required
              placeholder="at least 8 characters"
              error={errors.password}
            />
            <Input
              label="Confirm password"
              type="password"
              value={form.confirm}
              onChange={set('confirm')}
              autoComplete="new-password"
              required
              placeholder="repeat password"
              error={errors.confirm}
            />

            {apiError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2" role="alert">
                {apiError}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full mt-1">
              Create account
            </Button>
          </div>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-purple-400 hover:text-purple-300 font-medium underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
