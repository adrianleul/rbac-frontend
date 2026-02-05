import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { Search, X } from "lucide-react";

export type Field = {
  name: string;
  label: string;
  type: "text" | "select" | "date";
  options?: { label: string; value: string }[]; // for select
};

type Props = {
  triggerLabel?: string;
  title?: string;
  fields: Field[];
  onSearch: (params: Record<string, string>) => void;
  onReset?: () => void;
};

const SearchDialog: React.FC<Props> = ({
  triggerLabel = "Search",
  title = "Search Filters",
  fields,
  onSearch,
  onReset,
}) => {
  const initialState = fields.reduce((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {} as Record<string, string>);

  const [formData, setFormData] = useState<Record<string, string>>(initialState);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    onSearch(formData);
  };

  const handleReset = () => {
    setFormData(initialState);
    onReset?.();
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger  >
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">
          <Search className="w-6 h-6" />
          {triggerLabel}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 shadow-lg z-50">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-semibold">{title}</Dialog.Title>
            <Dialog.Close  >
              <button>
                <X className="w-5 h-5 text-gray-600 hover:text-black" />
              </button>
            </Dialog.Close>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => {
              if (field.type === "select") {
                return (
                  <select
                    key={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="border p-2 rounded"
                  >
                    <option value="">{field.label}</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                );
              }
              return (
                <input
                  key={field.name}
                  type={field.type}
                  name={field.name}
                  placeholder={field.label}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
              );
            })}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close  >
              <button
                onClick={handleSearch}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Search
              </button>
            </Dialog.Close>
            <button
              onClick={handleReset}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Reset
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SearchDialog;
