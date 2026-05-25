import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Search, Archive, ArchiveRestore, X } from 'lucide-react';
import { medicineApi } from '../../api/medicineApi';
import { supplierApi } from '../../api/supplierApi';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/currencyFormatter';

const emptyForm = {
  medicine_name: '', generic_name: '', brand_name: '', category_id: '', supplier_id: '',
  dosage: '', description: '', quantity: 0, reorder_level: 10, unit_price: 0, selling_price: 0,
  expiration_date: '', batch_number: '', prescription_required: false, barcode: '',
};

export default function Medicines() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const qc = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['medicines', search, page, showArchived],
    queryFn: () =>
      medicineApi
        .list({
          search: search || undefined,
          page,
          limit: 10,
          archived: showArchived,
        })
        .then((r) => r.data.data),
    keepPreviousData: true,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => medicineApi.categories().then((r) => r.data.data),
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers-list'],
    queryFn: () => supplierApi.list({ limit: 100 }).then((r) => r.data.data.suppliers),
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => (editId ? medicineApi.update(editId, payload) : medicineApi.create(payload)),
    onSuccess: () => {
      toast.success(editId ? 'Updated' : 'Created');
      qc.invalidateQueries({ queryKey: ['medicines'] });
      qc.invalidateQueries({ queryKey: ['med-list'] });
      setModal(false);
      setForm(emptyForm);
      setEditId(null);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id) => medicineApi.archive(id),
    onSuccess: () => {
      toast.success('Moved to Archived — switch to the Archived tab to find it');
      qc.invalidateQueries({ queryKey: ['medicines'] });
      qc.invalidateQueries({ queryKey: ['med-list'] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id) => medicineApi.restore(id),
    onSuccess: () => {
      toast.success('Restored to Active medicines');
      qc.invalidateQueries({ queryKey: ['medicines'] });
      qc.invalidateQueries({ queryKey: ['med-list'] });
    },
  });

  const openEdit = (row) => {
    if (showArchived) return;
    setEditId(row.medicine_id);
    setForm({
      ...row,
      category_id: row.category_id || '',
      supplier_id: row.supplier_id || '',
      prescription_required: !!row.prescription_required,
    });
    setModal(true);
  };

  const handleArchive = (row, e) => {
    e?.stopPropagation();
    if (!window.confirm(`Archive "${row.medicine_name}"?\n\nIt will move to the Archived tab. You can restore it later.`)) return;
    archiveMutation.mutate(row.medicine_id);
  };

  const handleRestore = (row, e) => {
    e?.stopPropagation();
    restoreMutation.mutate(row.medicine_id);
  };

  const columns = [
    { key: 'medicine_name', label: 'Name' },
    { key: 'barcode', label: 'Barcode' },
    { key: 'category_name', label: 'Category', render: (r) => r.category_name || '—' },
    { key: 'quantity', label: 'Qty' },
    { key: 'selling_price', label: 'Price', render: (r) => formatCurrency(r.selling_price) },
    { key: 'expiration_date', label: 'Expiry', render: (r) => r.expiration_date || '—' },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <span className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {!showArchived ? (
            <>
              <Button variant="ghost" onClick={() => openEdit(r)}>Edit</Button>
              <Button variant="ghost" title="Archive" onClick={(e) => handleArchive(r, e)}>
                <Archive size={16} />
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={(e) => handleRestore(r, e)}>
              <ArchiveRestore size={16} className="inline mr-1" />
              Restore
            </Button>
          )}
        </span>
      ),
    },
  ];

  const medicines = data?.medicines || [];
  const totalPages = data?.meta?.totalPages || 1;
  const total = data?.meta?.total ?? 0;

  return (
    <section className="space-y-4">
      <header className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold">Medicines</h1>
        {!showArchived && (
          <Button onClick={() => { setEditId(null); setForm(emptyForm); setModal(true); }}>
            <Plus size={18} className="inline mr-1" /> Add Medicine
          </Button>
        )}
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => { setShowArchived(false); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            !showArchived ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Active
        </button>
        <button
          type="button"
          onClick={() => { setShowArchived(true); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            showArchived ? 'bg-amber-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Archived
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
        <input
          type="search"
          placeholder="Search by name, generic, brand, or barcode…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => setSearchInput('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500">
        {isFetching && !isLoading ? 'Searching…' : null}
        {!isLoading && (
          <>
            {total} {showArchived ? 'archived' : 'active'} medicine{total === 1 ? '' : 's'}
            {search ? ` matching "${search}"` : ''}
          </>
        )}
      </p>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <Table
            columns={columns}
            data={medicines}
            keyField="medicine_id"
            onRowClick={showArchived ? undefined : openEdit}
            emptyMessage={
              search
                ? `No ${showArchived ? 'archived' : 'active'} medicines match "${search}"`
                : showArchived
                  ? 'No archived medicines'
                  : 'No medicines yet — add your first medicine'
            }
          />
          <footer className="flex justify-center items-center gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </Button>
            <span className="py-2 text-sm">
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </footer>
        </>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Medicine' : 'Add Medicine'} size="lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate({
              ...form,
              quantity: Number(form.quantity) || 0,
              reorder_level: Number(form.reorder_level) || 10,
              unit_price: Number(form.unit_price) || 0,
              selling_price: Number(form.selling_price) || 0,
              category_id: form.category_id || null,
              supplier_id: form.supplier_id || null,
            });
          }}
          className="grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto"
        >
          {['medicine_name', 'generic_name', 'brand_name', 'barcode', 'dosage', 'batch_number', 'expiration_date'].map((f) => (
            <Input
              key={f}
              label={f.replace(/_/g, ' ')}
              value={form[f] || ''}
              onChange={(e) => setForm({ ...form, [f]: e.target.value })}
              className={f === 'medicine_name' ? 'col-span-2' : ''}
            />
          ))}
          <label className="text-sm col-span-2 sm:col-span-1">
            Category
            <select
              className="w-full mt-1 border rounded-xl px-3 py-2 dark:bg-gray-800"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            >
              <option value="">—</option>
              {categories?.map((c) => (
                <option key={c.category_id} value={c.category_id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm col-span-2 sm:col-span-1">
            Supplier
            <select
              className="w-full mt-1 border rounded-xl px-3 py-2 dark:bg-gray-800"
              value={form.supplier_id}
              onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
            >
              <option value="">—</option>
              {suppliers?.map((s) => (
                <option key={s.supplier_id} value={s.supplier_id}>{s.company_name}</option>
              ))}
            </select>
          </label>
          {['quantity', 'reorder_level', 'unit_price', 'selling_price'].map((f) => (
            <Input
              key={f}
              label={f.replace(/_/g, ' ')}
              type="number"
              value={form[f]}
              onChange={(e) => setForm({ ...form, [f]: e.target.value })}
            />
          ))}
          <label className="flex items-center gap-2 col-span-2">
            <input
              type="checkbox"
              checked={form.prescription_required}
              onChange={(e) => setForm({ ...form, prescription_required: e.target.checked })}
            />
            Prescription required
          </label>
          <Button type="submit" className="col-span-2" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </form>
      </Modal>
    </section>
  );
}
