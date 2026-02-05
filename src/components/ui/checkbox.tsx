import * as React from 'react';
import { cn } from '../../utils/cn';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <input
      type="checkbox"
      ref={ref}
      className={cn(
        'h-4 w-4 rounded border border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500',
        className
      )}
      {...props}
    />
  )
);
Checkbox.displayName = 'Checkbox';
