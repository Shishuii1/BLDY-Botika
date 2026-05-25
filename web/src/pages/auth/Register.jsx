import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../app/store';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    const res = await authApi.register(data);
    setAuth(res.data.data.user, res.data.data.token);
    toast.success('Account created');
    navigate('/dashboard');
  };

  return (
    <article className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border">
      <h1 className="text-xl font-bold mb-6">Create account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full name" {...register('full_name')} error={errors.full_name?.message} />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Phone" {...register('phone')} />
        <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
        <Button type="submit" className="w-full" disabled={isSubmitting}>Register</Button>
      </form>
      <p className="text-center text-sm mt-4"><Link to="/login" className="text-primary">Back to login</Link></p>
    </article>
  );
}
