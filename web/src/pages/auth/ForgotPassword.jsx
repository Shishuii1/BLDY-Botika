import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function ForgotPassword() {
  const { register, handleSubmit } = useForm();

  const onSubmit = async ({ email }) => {
    const res = await authApi.forgotPassword(email);
    toast.success(res.data.data.message);
    if (res.data.data.resetToken) toast(`Dev token: ${res.data.data.resetToken}`, { duration: 8000 });
  };

  return (
    <article className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border">
      <h1 className="text-xl font-bold mb-6">Forgot password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" {...register('email', { required: true })} />
        <Button type="submit" className="w-full">Send reset link</Button>
      </form>
      <p className="text-center text-sm mt-4"><Link to="/login" className="text-primary">Back to login</Link></p>
    </article>
  );
}
