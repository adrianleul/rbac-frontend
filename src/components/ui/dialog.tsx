import * as React from 'react';
import { Modal } from 'antd';
import { cn } from '../../utils/cn';

// Dialog context to manage open state and trigger
const DialogContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

const Dialog: React.FC<{ open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }> = ({ open: controlledOpen, onOpenChange, children }) => {
  const [open, setOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const actualOpen = isControlled ? controlledOpen : open;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  return (
    <DialogContext.Provider value={{ open: actualOpen, setOpen: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ctx = React.useContext(DialogContext);
  if (!ctx) throw new Error('DialogTrigger must be used within a Dialog');
  return React.cloneElement(children as React.ReactElement, {
    onClick: () => ctx.setOpen(true),
  });
};

const DialogContent: React.FC<{
  title?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose?: () => void;
  style?: React.CSSProperties;
  width?: number | string;
}> = ({ title, className, children, footer, onClose, style, width }) => {
  const ctx = React.useContext(DialogContext);
  if (!ctx) throw new Error('DialogContent must be used within a Dialog');
  return (
    <Modal
      open={ctx.open}
      onCancel={() => {
        ctx.setOpen(false);
        onClose?.();
      }}
      title={title}
      footer={footer}
      className={cn(className)}
       destroyOnHidden
      style={style}
      width={width}
    >
      {children}
    </Modal>
  );
};

const DialogTitle: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={cn('text-lg font-semibold leading-none', className)}>{children}</div>
);

const DialogClose: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ctx = React.useContext(DialogContext);
  if (!ctx) throw new Error('DialogClose must be used within a Dialog');
  return React.cloneElement(children as React.ReactElement, {
    onClick: () => ctx.setOpen(false),
  });
};

export const DialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-4">{children}</div>
);

export const DialogFooter = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-4 w-900px flex justify-end gap-2', className)} {...props}>
    {children}
  </div>
);

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
};
