import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { inventoryApi } from '../../api/inventoryApi';
import { medicineApi } from '../../api/medicineApi';
import { useAuthStore } from '../../app/store';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/currencyFormatter';

const emptyAdjust = { medicine_id: '', action_type: 'stock_in', quantity: 1, notes: '' };
const emptyEdit = { quantity: 0, reorder_level: 10, batch_number: '', expiration_date: '', notes: '' };

export default function Inventory() {
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role_name === 'super_admin';
  const [adjustModal, setAdjustModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [adjustForm, setAdjustForm] = useState(emptyAdjust);
  const [editForm, setEditForm] = useState(emptyEdit);
  const [editId, setEditId] = useState(null);
  const qc = useQueryClient();

  const { data: summary } = useQuery({
    queryKey: ['inv-summary'],
    queryFn: () => inventoryApi.summary().then((r) => r.data.data),
    retry: 1,
  });
  const { data: lowStock } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => inventoryApi.lowStock().then((r) => r.data.data),
    retry: 1,
  });
  const { data: logs, isLoading } = useQuery({
    queryKey: ['inv-logs'],
    queryFn: () => inventoryApi.logs({ limit: 20 }).then((r) => r.data.data),
    retry: 1,
  });
  const { data: medicines } = useQuery({
    queryKey: ['med-list'],
    queryFn: () => medicineApi.list({ limit: 200 }).then((r) => r.data.data.medicines),
    retry: 1,
  });

  const adjust = useMutation({
    mutationFn: (d) => inventoryApi.adjust({ ...d, medicine_id: Number(d.medicine_id), quantity: Number(d.quantity) }),
    onSuccess: () => {
      toast.success('Stock updated');
      qc.invalidateQueries();
      setAdjustModal(false);
      setAdjustForm(emptyAdjust);
    },
  });

  const updateStock = useMutation({
    mutationFn: () =>
      inventoryApi.updateStock(editId, {
        quantity: Number(editForm.quantity),
        reorder_level: Number(editForm.reorder_level),
        batch_number: editForm.batch_number,
        expiration_date: editForm.expiration_date || null,
        notes: editForm.notes,
      }),
    onSuccess: () => {
      toast.success('Inventory record updated');
      qc.invalidateQueries();
      setEditModal(false);
      setEditId(null);
    },
  });

  const openEdit = (row) => {
    setEditId(row.medicine_id);
    setEditForm({
      quantity: row.quantity ?? 0,
      reorder_level: row.reorder_level ?? 10,
      batch_number: row.batch_number || '',
      expiration_date: row.expiration_date || '',
      notes: '',
    });
    setEditModal(true);
  };

  const logColumns = [
    { key: 'created_at', label: 'Date' },
    { key: 'medicine_name', label: 'Medicine' },
    { key: 'action_type', label: 'Action' },
    { key: 'quantity_change', label: 'Change' },
    { key: 'quantity_after', label: 'After' },
    { key: 'user_name', label: 'User' },
  ];

  const stockColumns = [
    { key: 'medicine_name', label: 'Medicine' },
    { key: 'quantity', label: 'On hand' },
    { key: 'reorder_level', label: 'Reorder at' },
    { key: 'batch_number', label: 'Batch' },
    { key: 'expiration_date', label: 'Expiry' },
    {
      key: 'selling_price',
      label: 'Value',
      render: (r) => formatCurrency(Number(r.selling_price) * Number(r.quantity)),
    },
    ...(isSuperAdmin
      ? [{
          key: 'actions',
          label: '',
          render: (r) => <Button variant="ghost" onClick={() => openEdit(r)}>Edit</Button>,
        }]
      : []),
  ];

  if (isLoading) return <Loader />;

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Button onClick={() => { setAdjustForm(emptyAdjust); setAdjustModal(true); }}>Stock Adjustment</Button>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ['Total Medicines', summary?.total_medicines ?? '—'],
          ['Total Units', summary?.total_units ?? '—'],
          ['Stock Value', summary?.total_value != null ? formatCurrency(summary.total_value) : '—'],
          ['Low Stock Items', summary?.low_stock_count ?? '—'],
        ].map(([l, v]) => (
          <article key={l} className="p-4 bg-white dark:bg-gray-900 rounded-xl border">
            <p className="text-sm text-gray-500">{l}</p>
            <p className="text-xl font-bold">{v}</p>
          </article>
        ))}
      </section>

      <article>
        <h2 className="font-semibold mb-2 text-amber-600">Low Stock Alerts</h2>
        <ul className="text-sm space-y-1">
          {(lowStock || []).slice(0, 8).map((m) => (
            <li key={m.medicine_id} className="flex justify-between gap-2">
              <span>{m.medicine_name}: {m.quantity} units</span>
              {isSuperAdmin && (
                <button type="button" className="text-primary text-xs font-medium" onClick={() => openEdit(m)}>
                  Edit
                </button>
              )}
            </li>
          ))}
        </ul>
      </article>

      {isSuperAdmin && (
        <article className="space-y-2">
          <h2 className="font-semibold">Stock on hand</h2>
          <p className="text-sm text-gray-500">Super Admin can correct quantity, reorder level, batch, and expiry.</p>
          <Table columns={stockColumns} data={medicines || []} keyField="medicine_id" emptyMessage="No medicines" />
        </article>
      )}

      <article>
        <h2 className="font-semibold mb-2">Recent activity</h2>
        <Table columns={logColumns} data={logs?.logs || []} keyField="log_id" emptyMessage="No inventory logs" />
      </article>

      <Modal open={adjustModal} onClose={() => setAdjustModal(false)} title="Stock Adjustment">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            adjust.mutate(adjustForm);
          }}
          className="space-y-3"
        >
          <label className="text-sm block">
            Medicine
            <select
              required
              className="w-full border rounded-xl px-3 py-2 mt-1 dark:bg-gray-800"
              value={adjustForm.medicine_id}
              onChange={(e) => setAdjustForm({ ...adjustForm, medicine_id: e.target.value })}
            >
              <option value="">Select</option>
              {medicines?.map((m) => (
                <option key={m.medicine_id} value={m.medicine_id}>
                  {m.medicine_name} ({m.quantity} in stock)
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm block">
            Action
            <select
              className="w-full border rounded-xl px-3 py-2 mt-1 dark:bg-gray-800"
              value={adjustForm.action_type}
              onChange={(e) => setAdjustForm({ ...adjustForm, action_type: e.target.value })}
            >
              <option value="stock_in">Stock In</option>
              <option value="stock_out">Stock Out</option>
              <option value="adjustment">Adjustment</option>
              <option value="damaged">Damaged</option>
              <option value="expired">Expired</option>
            </select>
          </label>
          <label className="text-sm block">
            Quantity
            <input
              type="number"
              min="1"
              required
              className="w-full border rounded-xl px-3 py-2 mt-1 dark:bg-gray-800"
              value={adjustForm.quantity}
              onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
            />
          </label>
          <Input
            label="Notes"
            value={adjustForm.notes}
            onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
          />
          <Button type="submit" className="w-full" disabled={adjust.isPending}>
            {adjust.isPending ? 'Saving…' : 'Submit'}
          </Button>
        </form>
      </Modal>

      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit stock (Super Admin)">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateStock.mutate();
          }}
          className="space-y-3"
        >
          <Input
            label="Quantity on hand"
            type="number"
            min="0"
            required
            value={editForm.quantity}
            onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
          />
          <Input
            label="Reorder level"
            type="number"
            min="0"
            value={editForm.reorder_level}
            onChange={(e) => setEditForm({ ...editForm, reorder_level: e.target.value })}
          />
          <Input
            label="Batch number"
            value={editForm.batch_number}
            onChange={(e) => setEditForm({ ...editForm, batch_number: e.target.value })}
          />
          <Input
            label="Expiration date"
            type="date"
            value={editForm.expiration_date}
            onChange={(e) => setEditForm({ ...editForm, expiration_date: e.target.value })}
          />
          <Input
            label="Correction notes"
            value={editForm.notes}
            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
          />
          <Button type="submit" className="w-full" disabled={updateStock.isPending}>
            {updateStock.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </Modal>
    </section>
  );
}
