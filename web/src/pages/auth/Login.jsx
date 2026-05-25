import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../app/store';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
});

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      const payload = res.data?.data;
      if (!payload?.token || !payload?.user) {
        toast.error('Invalid server response. Check backend logs.');
        return;
      }
      setAuth(payload.user, payload.token);
      toast.success('Welcome back!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK'
          ? 'Cannot reach API. Run: cd backend && npm run dev (port 5000)'
          : null) ||
        err.message ||
        'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
    >
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500 flex items-center justify-center text-white text-2xl font-bold mb-3">
          P
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">PharmaSys</h1>
        <p className="text-gray-500 text-sm mt-1">Pharmacy POS & Inventory</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" autoComplete="email" {...register('email')} error={errors.email?.message} />
        <Input label="Password" type="password" autoComplete="current-password" {...register('password')} error={errors.password?.message} />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        <Link to="/forgot-password" className="text-emerald-600 hover:underline">Forgot password?</Link>
      </p>
      <p className="text-center text-xs text-gray-400 mt-6"></p>
    </motion.div>
  );
}
