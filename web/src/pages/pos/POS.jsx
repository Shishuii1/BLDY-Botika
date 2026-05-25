import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Search, Trash2, Printer, UserMinus } from 'lucide-react';
import { medicineApi } from '../../api/medicineApi';
import { customerApi } from '../../api/customerApi';
import { salesApi } from '../../api/salesApi';
import { useCartStore } from '../../app/store';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { formatCurrency } from '../../utils/currencyFormatter';


export default function POS() {
  const [search, setSearch] = useState('');
  const [barcode, setBarcode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [discountType, setDiscountType] = useState('none');
  const [loading, setLoading] = useState(false);

  const { items, addItem, updateQty, removeItem, clear, subtotal, customerId, setCustomerId, clearCustomer } = useCartStore();

  const { data: medicines } = useQuery({
    queryKey: ['medicines-pos', search],
    queryFn: () => medicineApi.list({ search, limit: 20 }).then((r) => r.data.data.medicines),
  });

  const { data: customers } = useQuery({
    queryKey: ['customers-pos'],
    queryFn: () => customerApi.list({ limit: 100 }).then((r) => r.data.data.customers),
  });

  const customer = customers?.find((c) => c.customer_id === Number(customerId));
  const sub = subtotal();

  useEffect(() => {
    if (!customer) return;
    if (customer.pwd) {
      setDiscountType('pwd');
    } else if (customer.senior_citizen) {
      setDiscountType('senior');
    }
  }, [customer]);

  let discount = 0;
  if (discountType === 'senior' || discountType === 'pwd') discount = sub * 0.2;
  const afterDiscount = sub - discount;
  const total = afterDiscount;
  const amountPaidValue = amountPaid === '' ? total : Number(amountPaid);
  const change = Math.max(0, amountPaidValue - total);
  const canCheckout = items.length > 0 && !loading;

  const handleBarcode = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    try {
      const res = await medicineApi.byBarcode(barcode.trim());
      addItem(res.data.data);
      setBarcode('');
      toast.success('Added to cart');
    } catch {
      toast.error('Medicine not found');
    }
  };

  const checkout = async () => {
    if (!items.length) return toast.error('Cart is empty');
    setLoading(true);
    try {
      const res = await salesApi.create({
        items: items.map((i) => ({ medicine_id: i.medicine_id, quantity: i.quantity })),
        payment_method: paymentMethod,
        amount_paid: amountPaidValue,
        discount_type: discountType,
        customer_id: customerId ? Number(customerId) : undefined,
      });
      toast.success(`Sale ${res.data.data.invoice_number} completed!`);
      clear();
      setAmountPaid('');
      window.open(salesApi.receiptUrl(res.data.data.sale_id), '_blank');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
      <article className="flex-1 flex flex-col min-h-0">
        <h1 className="text-2xl font-bold mb-4">Point of Sale</h1>
        <div className="grid gap-4 mb-4">
          <label className="text-sm">
            Customer
            <div className="flex gap-2 mt-1">
              <select
                value={customerId || ''}
                onChange={(e) => setCustomerId(e.target.value || null)}
                className="w-full border rounded-xl px-3 py-2 dark:bg-gray-800"
              >
                <option value="">Walk-in / no customer</option>
                {customers?.map((c) => (
                  <option key={c.customer_id} value={c.customer_id}>
                    {c.full_name} {c.senior_citizen ? '(Senior)' : c.pwd ? '(PWD)' : ''}
                  </option>
                ))}
              </select>
              {customerId && (
                <Button type="button" variant="ghost" onClick={() => clearCustomer()} title="Clear customer">
                  <UserMinus size={18} />
                </Button>
              )}
            </div>
          </label>
          {customer && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 p-3 text-sm">
              <p className="font-semibold">Selected customer:</p>
              <p>{customer.full_name}</p>
              <p>{customer.phone || 'No phone'}</p>
              <p>{customer.email || 'No email'}</p>
              <p>{customer.senior_citizen ? 'Senior discount applied' : customer.pwd ? 'PWD discount applied' : 'No special discount'}</p>
            </div>
          )}
          <form onSubmit={handleBarcode} className="flex gap-2">
            <Input placeholder="Scan barcode..." value={barcode} onChange={(e) => setBarcode(e.target.value)} className="flex-1" />
            <Button type="submit">Add</Button>
          </form>
          <Input placeholder="Search medicines..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-0" />
        </div>
        <ul className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-2">
          {medicines?.map((m) => (
            <li key={m.medicine_id}>
              <button
                type="button"
                onClick={() => addItem(m)}
                className="w-full text-left p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition"
              >
                <p className="font-medium text-sm truncate">{m.medicine_name}</p>
                <p className="text-primary font-bold">{formatCurrency(m.selling_price)}</p>
                <p className="text-xs text-gray-500">Stock: {m.quantity}</p>
              </button>
            </li>
          ))}
        </ul>
      </article>
      <aside className="w-full lg:w-96 flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-lg">
        <h2 className="font-semibold mb-3 flex items-center gap-2"><Search size={18} /> Cart</h2>
        <ul className="flex-1 overflow-y-auto space-y-2 mb-4">
          {items.map((i) => (
            <li key={i.medicine_id} className="flex items-center gap-2 text-sm border-b pb-2">
              <span className="flex-1 truncate">{i.medicine_name}</span>
              <input type="number" min="1" value={i.quantity} onChange={(e) => updateQty(i.medicine_id, Number(e.target.value))} className="w-12 px-1 border rounded" />
              <span>{formatCurrency(i.selling_price * i.quantity)}</span>
              <button type="button" onClick={() => removeItem(i.medicine_id)} className="text-red-500"><Trash2 size={16} /></button>
            </li>
          ))}
        </ul>
        <label className="text-sm mb-2">Discount
          <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-xl">
            <option value="none">None</option>
            <option value="senior">Senior 20%</option>
            <option value="pwd">PWD 20%</option>
          </select>
        </label>
        <label className="text-sm mb-2">Payment
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-xl">
            <option value="cash">Cash</option>
            <option value="gcash">GCash</option>
            <option value="card">Card</option>
          </select>
        </label>
        <Input label="Amount Paid" type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
        <footer className="space-y-1 text-sm mt-2 border-t pt-2">
          <p className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(sub)}</span></p>
          <p className="flex justify-between"><span>Discount</span><span>-{formatCurrency(discount)}</span></p>
          <p className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary">{formatCurrency(total)}</span></p>
          <p className="flex justify-between"><span>Change</span><span>{formatCurrency(change)}</span></p>
        </footer>
        <Button className="w-full mt-4" onClick={checkout} disabled={!canCheckout}>
          <Printer size={18} className="inline mr-2" />{loading ? 'Processing...' : 'Complete Sale'}
        </Button>
      </aside>
    </section>
  );
}
