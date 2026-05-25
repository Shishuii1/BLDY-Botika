import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { customerApi } from '../../api/customerApi';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';

const emptyForm = { full_name: '', email: '', phone: '', address: '', senior_citizen: false, pwd: false };

export default function Customers() {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerApi.list({ limit: 50 }).then((r) => r.data.data.customers),
  });

  const save = useMutation({
    mutationFn: () => (editId ? customerApi.update(editId, form) : customerApi.create(form)),
    onSuccess: () => {
      toast.success(editId ? 'Customer updated' : 'Customer added');
      qc.invalidateQueries({ queryKey: ['customers'] });
      setModal(false);
      setForm(emptyForm);
      setEditId(null);
    },
  });

  const remove = useMutation({
    mutationFn: (id) => customerApi.remove(id),
    onSuccess: () => {
      toast.success('Customer deleted');
      qc.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Could not delete customer');
    },
  });

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (row) => {
    setEditId(row.customer_id);
    setForm({
      full_name: row.full_name || '',
      email: row.email || '',
      phone: row.phone || '',
      address: row.address || '',
      senior_citizen: !!row.senior_citizen,
      pwd: !!row.pwd,
    });
    setModal(true);
  };

  const handleDelete = (row) => {
    if (row.customer_id === 1) {
      toast.error('The default walk-in customer cannot be deleted');
      return;
    }
    if (!window.confirm(`Delete customer "${row.full_name}"?`)) return;
    remove.mutate(row.customer_id);
  };

  const columns = [
    { key: 'full_name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'loyalty_points', label: 'Points' },
    { key: 'senior_citizen', label: 'Senior', render: (r) => (r.senior_citizen ? 'Yes' : '—') },
    { key: 'pwd', label: 'PWD', render: (r) => (r.pwd ? 'Yes' : '—') },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <span className="flex gap-2">
          <Button variant="ghost" onClick={() => openEdit(r)}>Edit</Button>
          {r.customer_id !== 1 && (
            <Button variant="danger" onClick={() => handleDelete(r)}>Delete</Button>
          )}
        </span>
      ),
    },
  ];

  if (isLoading) return <Loader />;

  return (
    <section className="space-y-4">
      <header className="flex justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button onClick={openAdd}>Add Customer</Button>
      </header>
      <Table columns={columns} data={data || []} keyField="customer_id" />
      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Customer' : 'Add Customer'}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.full_name.trim()) {
              toast.error('Full name is required');
              return;
            }
            save.mutate();
          }}
          className="space-y-3"
        >
          <Input label="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <label className="flex gap-2">
            <input type="checkbox" checked={form.senior_citizen} onChange={(e) => setForm({ ...form, senior_citizen: e.target.checked })} />
            Senior Citizen
          </label>
          <label className="flex gap-2">
            <input type="checkbox" checked={form.pwd} onChange={(e) => setForm({ ...form, pwd: e.target.checked })} />
            PWD
          </label>
          <Button type="submit" className="w-full" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : 'Save'}
          </Button>
        </form>
      </Modal>
    </section>
  );
}
