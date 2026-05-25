import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { supplierApi } from '../../api/supplierApi';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';

const emptyForm = { company_name: '', contact_person: '', email: '', phone: '', address: '' };

const fieldLabels = {
  company_name: 'Company name',
  contact_person: 'Contact person',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
};

export default function Suppliers() {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => supplierApi.list({ limit: 50 }).then((r) => r.data.data.suppliers),
  });

  const save = useMutation({
    mutationFn: () => (editId ? supplierApi.update(editId, form) : supplierApi.create(form)),
    onSuccess: () => {
      toast.success(editId ? 'Supplier updated' : 'Supplier added');
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      qc.invalidateQueries({ queryKey: ['suppliers-list'] });
      setModal(false);
      setForm(emptyForm);
      setEditId(null);
    },
  });

  const remove = useMutation({
    mutationFn: (id) => supplierApi.remove(id),
    onSuccess: () => {
      toast.success('Supplier removed');
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      qc.invalidateQueries({ queryKey: ['suppliers-list'] });
    },
  });

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (row) => {
    setEditId(row.supplier_id);
    setForm({
      company_name: row.company_name || '',
      contact_person: row.contact_person || '',
      email: row.email || '',
      phone: row.phone || '',
      address: row.address || '',
    });
    setModal(true);
  };

  const handleDelete = (row) => {
    if (!window.confirm(`Remove supplier "${row.company_name}"?`)) return;
    remove.mutate(row.supplier_id);
  };

  const columns = [
    { key: 'company_name', label: 'Company' },
    { key: 'contact_person', label: 'Contact' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <span className="flex gap-2">
          <Button variant="ghost" onClick={() => openEdit(r)}>Edit</Button>
          <Button variant="danger" onClick={() => handleDelete(r)}>Delete</Button>
        </span>
      ),
    },
  ];

  if (isLoading) return <Loader />;

  return (
    <section className="space-y-4">
      <header className="flex justify-between">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <Button onClick={openAdd}>Add Supplier</Button>
      </header>
      <Table columns={columns} data={data || []} keyField="supplier_id" />
      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Supplier' : 'Add Supplier'}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.company_name.trim()) {
              toast.error('Company name is required');
              return;
            }
            save.mutate();
          }}
          className="space-y-3"
        >
          {Object.keys(fieldLabels).map((f) => (
            <Input
              key={f}
              label={fieldLabels[f]}
              value={form[f] || ''}
              onChange={(e) => setForm({ ...form, [f]: e.target.value })}
              required={f === 'company_name'}
            />
          ))}
          <Button type="submit" className="w-full" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : 'Save'}
          </Button>
        </form>
      </Modal>
    </section>
  );
}
