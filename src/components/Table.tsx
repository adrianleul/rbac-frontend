const Table = ({
  columns,
  renderRow,
  data,
  selectable = false,
  onSelectRow,
  selectedRows = [],
}: {
  columns: { header: string; accessor: string; className?: string }[];
  renderRow: (item: any) => React.ReactNode;
  data: any[];
  selectable?: boolean;
  onSelectRow?: (id: any | null, checked: boolean, bulkIds?: any[]) => void;
  selectedRows?: any[];
}) => {
  const isAllSelected = data.length > 0 && selectedRows.length === data.length;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectRow) {
      if (e.target.checked) {
        const allIds = data.map((item) => item.id);
        onSelectRow?.(null, true, allIds); // Send full list when selecting all
      } else {
        onSelectRow?.(null, false, []); // Empty list when unselecting all
      }
    }
  };

  return (
    <table className="w-full border border-gray-300">
      <thead className="bg-gray-100">
        <tr className="text-center text-gray-600 text-sm">
          {selectable && (
            <th className="p-2 border-b border-gray-300">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
              />
            </th>
          )}
          {columns.map((col) => (
            <th
              key={col.accessor}
              className={`p-2 border-b border-gray-300 ${col.className ?? ""}`}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{data.map((item) => renderRow(item))}</tbody>
    </table>
  );
};

export default Table;
