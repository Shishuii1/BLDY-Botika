import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../../api/reportApi';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/currencyFormatter';

export default function Reports() {
  const [from, setFrom] = useState(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  const { data: financial, isLoading } = useQuery({
    queryKey: ['financial', from, to],
    queryFn: () => reportApi.financial({ from, to }).then((r) => r.data.data),
  });

  const download = async (type) => {
    try {
      const fn = type === 'pdf' ? reportApi.salesPdf : reportApi.salesExcel;
      const res = await fn({ from, to });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-report.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Report download failed', err);
      toast.error(err.response?.data?.message || 'Unable to download report');
    }
  };

  if (isLoading) return <Loader />;

  const columns = [
    { key: 'medicine_name', label: 'Medicine' },
    { key: 'qty_sold', label: 'Qty Sold' },
    { key: 'revenue', label: 'Revenue', render: (r) => formatCurrency(r.revenue) },
  ];

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <header className="flex flex-wrap gap-4 items-end">
        <label className="text-sm">From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="block border rounded-xl px-3 py-2 mt-1" /></label>
        <label className="text-sm">To<input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="block border rounded-xl px-3 py-2 mt-1" /></label>
        <Button variant="outline" onClick={() => download('pdf')}>Export PDF</Button>
        <Button variant="outline" onClick={() => download('excel')}>Export Excel</Button>
      </header>
      <section className="grid md:grid-cols-3 gap-4">
        <article className="p-5 bg-white dark:bg-gray-900 rounded-xl border"><p className="text-gray-500 text-sm">Total Sales</p><p className="text-2xl font-bold">{financial?.summary?.total_sales}</p></article>
        <article className="p-5 bg-white dark:bg-gray-900 rounded-xl border"><p className="text-gray-500 text-sm">Revenue</p><p className="text-2xl font-bold text-primary">{formatCurrency(financial?.summary?.revenue)}</p></article>
        <article className="p-5 bg-white dark:bg-gray-900 rounded-xl border"><p className="text-gray-500 text-sm">VAT Collected</p><p className="text-2xl font-bold">{formatCurrency(financial?.summary?.total_vat)}</p></article>
      </section>
      <h2 className="font-semibold">Top Selling Products</h2>
      <Table columns={columns} data={financial?.topSelling || []} keyField="medicine_id" />
    </section>
  );
}
