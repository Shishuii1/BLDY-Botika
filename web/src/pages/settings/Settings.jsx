import { useTheme } from '../../context/ThemeContext';

export default function Settings() {
  const { dark, toggle } = useTheme();
  return (
    <section className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <article className="p-6 bg-white dark:bg-gray-900 rounded-2xl border space-y-4">
        <h2 className="font-semibold">Appearance</h2>
        <label className="flex items-center justify-between">
          <span>Dark mode</span>
          <input type="checkbox" checked={dark} onChange={toggle} className="w-5 h-5 accent-primary" />
        </label>
        <p className="text-sm text-gray-500">VAT rate: 12% · Senior/PWD discount: 20%</p>
      </article>
    </section>
  );
}
