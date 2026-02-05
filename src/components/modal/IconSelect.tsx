import { useState, useRef, useEffect } from "react";
import { icons as LucideIcons } from "lucide-react";

type IconSelectProps = {
  value: string;
  onChange: (iconName: string) => void;
};

const iconNames = Object.keys(LucideIcons);

const IconSelect = ({ value, onChange }: IconSelectProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
        setLoading(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle open with loading simulation
  const handleToggle = () => {
    if (!open) {
      setLoading(true);
      setOpen(true);
      // Simulate loading delay (e.g., 500ms)
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } else {
      setOpen(false);
      setLoading(false);
    }
  };

  const IconComponent = value
    ? (LucideIcons[value as keyof typeof LucideIcons] as React.FC<React.SVGProps<SVGSVGElement>>)
    : null;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <button
        type="button"
        className="w-full border p-2 rounded flex items-center justify-between"
        onClick={handleToggle}
        disabled={loading}
      >
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent className="w-5 h-5" />}
          <span>{value || "Select Icon"}</span>
        </div>
        <span className="select-none">{loading ? "⏳" : "▾"}</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 max-h-48 overflow-auto w-full bg-white border rounded shadow-lg">
          {loading ? (
            <div className="flex justify-center items-center p-4 text-gray-600">
              Loading icons...
            </div>
          ) : (
            <ul>
              {iconNames.map((iconName) => {
                const Icon = LucideIcons[iconName as keyof typeof LucideIcons] as React.FC<
                  React.SVGProps<SVGSVGElement>
                >;
                return (
                  <li
                    key={iconName}
                    className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => {
                      onChange(iconName);
                      setOpen(false);
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{iconName}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default IconSelect;
