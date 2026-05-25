import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { dashboardApi } from '../../api/dashboardApi';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/currencyFormatter';
import { TrendingUp, Package, AlertTriangle, Users } from 'lucide-react';

function StatCard({ title, value, sub, icon: Icon, color }) {
  return (
    <article className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <header className="flex justify-between items-start">
        <section>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </section>
        <span className={`p-3 rounded-xl ${color}`}><Icon size={22} /></span>
      </header>
    </article>
  );
}

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.stats().then((r) => r.data.data),
    retry: 1,
  });

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <section className="p-6 rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100">
        <h1 className="text-xl font-bold">Dashboard unavailable</h1>
        <p className="mt-2 text-sm">
          Start the API server (<code className="bg-black/10 px-1 rounded">cd backend && npm run dev</code>), ensure MySQL is running, then run{' '}
          <code className="bg-black/10 px-1 rounded">npm run db:setup</code> if needed.
        </p>
      </section>
    );
  }

  const chartData = data?.chartData?.map((d) => ({ ...d, revenue: Number(d.revenue) })) || [];

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Today's Sales" value={formatCurrency(data?.daily?.revenue)} sub={`${data?.daily?.transactions || 0} transactions`} icon={TrendingUp} color="bg-primary/20 text-primary" />
        <StatCard title="Weekly Revenue" value={formatCurrency(data?.weekly?.revenue)} icon={TrendingUp} color="bg-secondary/20 text-secondary" />
        <StatCard title="Monthly Revenue" value={formatCurrency(data?.monthly?.revenue)} icon={TrendingUp} color="bg-emerald-100 text-emerald-600" />
        <StatCard title="Active Users" value={data?.activeUsers} icon={Users} color="bg-purple-100 text-purple-600" />
      </section>
      <section className="grid lg:grid-cols-2 gap-6">
        <article className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold mb-4">Revenue (7 days)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="#10B98133" />
            </AreaChart>
          </ResponsiveContainer>
        </article>
        <article className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold mb-4">Top Selling</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.topSelling || []}>
              <XAxis dataKey="medicine_name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="qty" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>
      <section className="grid lg:grid-cols-2 gap-6">
        <article className="p-5 bg-white dark:bg-gray-900 rounded-2xl border">
          <h2 className="font-semibold flex items-center gap-2 mb-3"><AlertTriangle className="text-amber-500" size={18} /> Low Stock</h2>
          <ul className="space-y-2 text-sm">
            {(data?.lowStock || []).map((m) => (
              <li key={m.medicine_id} className="flex justify-between"><span>{m.medicine_name}</span><span className="text-red-500">{m.quantity} left</span></li>
            ))}
          </ul>
        </article>
        <article className="p-5 bg-white dark:bg-gray-900 rounded-2xl border">
          <h2 className="font-semibold flex items-center gap-2 mb-3"><Package size={18} className="text-orange-500" /> Expiring Soon</h2>
          <ul className="space-y-2 text-sm">
            {(data?.expiring || []).map((m) => (
              <li key={m.medicine_id} className="flex justify-between"><span>{m.medicine_name}</span><span>{m.expiration_date}</span></li>
            ))}
          </ul>
        </article>
      </section>
    </section>
  );
}
