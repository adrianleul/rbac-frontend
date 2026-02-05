import React, { useState } from "react";

export type Field = {
  name: string;
  label: string;
  type: "text" | "select" | "date";
  options?: { label: string; value: string }[]; // For select fields
};

type Props = {
  fields: Field[];
  onSearch: (params: Record<string, string>) => void;
  onReset?: () => void;
};

const SearchForm: React.FC<Props> = ({ fields, onSearch, onReset }) => {
  const initialState = fields.reduce((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {} as Record<string, string>);

  const [formData, setFormData] = useState<Record<string, string>>(initialState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    <div className="grid gap-4 md:grid-cols-3 p-4 bg-gray-50 rounded-lg">
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

      <div className="flex gap-2">
        <button
          onClick={handleSearch}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Search
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default SearchForm;
