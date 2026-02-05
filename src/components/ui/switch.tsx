import * as Switch from "@radix-ui/react-switch";

export function RadixSwitch({ id, checked, onCheckedChange }: {
  id: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor={id} className="text-sm font-medium">
        Status
      </label>
      <Switch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="w-11 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-green-500 transition-colors"
      >
        <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-md transition-transform translate-x-0.5 data-[state=checked]:translate-x-5" />
      </Switch.Root>
    </div>
  );
}
