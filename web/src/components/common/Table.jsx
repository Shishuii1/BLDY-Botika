export default function Table({ columns, data, keyField = 'id', onRowClick, emptyMessage = 'No data found' }) {
  if (!data?.length) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {data.map((row) => (
            <tr
              key={row[keyField]}
              onClick={() => onRowClick?.(row)}
              className={`hover:bg-primary/5 transition ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-gray-800 dark:text-gray-200">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
