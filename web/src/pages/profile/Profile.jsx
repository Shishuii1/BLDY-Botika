import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../app/store';
import { authApi } from '../../api/authApi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import Table from '../../components/common/Table';

const emptyUserForm = {
  full_name: '',
  email: '',
  password: '',
  phone: '',
  role_id: '',
  branch_id: 1,
};

function roleLabel(name) {
  return name?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '';
}

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role_name === 'super_admin' || user?.role_name === 'admin';
  const [userForm, setUserForm] = useState(emptyUserForm);
  const qc = useQueryClient();

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => authApi.roles().then((r) => r.data.data),
    enabled: isSuperAdmin,
    retry: 1,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => authApi.listUsers().then((r) => r.data.data.users),
    enabled: isSuperAdmin,
    retry: 1,
  });

  const createUser = useMutation({
    mutationFn: (payload) => authApi.createUser(payload),
    onSuccess: () => {
      toast.success('User account created');
      qc.invalidateQueries({ queryKey: ['users'] });
      setUserForm(emptyUserForm);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Unable to create user account');
    },
  });

  const assignableRoles = (roles || []).filter((r) => r.role_name !== 'super_admin');

  const userColumns = [
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role_name', label: 'Role', render: (r) => roleLabel(r.role_name) },
    { key: 'phone', label: 'Phone', render: (r) => r.phone || '—' },
    {
      key: 'is_active',
      label: 'Status',
      render: (r) => (
        <span className={r.is_active ? 'text-emerald-600' : 'text-gray-400'}>
          {r.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <section className="space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold">Profile</h1>

      <article className="p-6 bg-white dark:bg-gray-900 rounded-2xl border space-y-3">
        <p><strong>Name:</strong> {user?.full_name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> <span className="capitalize">{roleLabel(user?.role_name)}</span></p>
        <p><strong>Phone:</strong> {user?.phone || '—'}</p>
      </article>

      {isSuperAdmin && (
        <>
          <article className="p-6 bg-white dark:bg-gray-900 rounded-2xl border space-y-4">
            <h2 className="text-lg font-semibold">Create user account</h2>
            <p className="text-sm text-gray-500">
              Only Super Admin can add staff accounts (pharmacist, cashier, inventory).
            </p>
            {rolesLoading ? (
              <Loader />
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!userForm.full_name.trim() || !userForm.email.trim() || !userForm.password || !userForm.role_id) {
                    toast.error('Fill in name, email, password, and role');
                    return;
                  }
                  createUser.mutate({
                    ...userForm,
                    role_id: Number(userForm.role_id),
                    branch_id: Number(userForm.branch_id) || 1,
                  });
                }}
                className="space-y-3"
              >
                <Input
                  label="Full name"
                  value={userForm.full_name}
                  onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  required
                />
                <Input
                  label="Phone"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                />
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                  <select
                    className="mt-1 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                    value={userForm.role_id}
                    onChange={(e) => setUserForm({ ...userForm, role_id: e.target.value })}
                    required
                  >
                    <option value="">Select role…</option>
                    {assignableRoles.map((r) => (
                      <option key={r.role_id} value={r.role_id}>
                        {roleLabel(r.role_name)}
                      </option>
                    ))}
                  </select>
                </label>
                <Button type="submit" disabled={createUser.isPending}>
                  {createUser.isPending ? 'Creating…' : 'Create account'}
                </Button>
              </form>
            )}
          </article>

          <article className="space-y-3">
            <h2 className="text-lg font-semibold">Staff accounts</h2>
            {usersLoading ? <Loader /> : <Table columns={userColumns} data={users || []} keyField="user_id" />}
          </article>
        </>
      )}
    </section>
  );
}
