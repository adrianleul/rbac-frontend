import { useState, useRef } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { KeySquare } from 'lucide-react';
import { resetPassword } from '../../../../api/system/user';

interface ResetUserPasswordModalProps {
  userId: number;
  username: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export const ResetUserPasswordModal = ({
  userId,
  username,
  onSuccess,
  onError
}: ResetUserPasswordModalProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = async () => {
    // Clear previous errors
    setError('');

    // Validation
    if (!newPassword.trim()) {
      setError('New password is required');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);

      await resetPassword(userId.toString(), newPassword);

      // Success
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setIsOpen(false);

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Show success message
      console.log('Password reset successfully for user:', username);

    } catch (error) {
      console.error('Password reset failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      setError(errorMessage);

      // Call error callback
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form when closing
      setNewPassword('');
      setConfirmPassword('');
      setError('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger  >
        <button
          title="Reset Password"
          className="p-1 w-8 h-8 bg-green-100 hover:bg-green-300 rounded"
        >
          <KeySquare style={{ color: "green" }} />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md" footer={null}>
        <DialogTitle>Reset Password</DialogTitle>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">Resetting password for: <strong>{username}</strong></p>

          <div>
            <label className="block mb-1 text-sm font-medium">New Password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Confirm Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <DialogClose  >
            <Button variant="outline" disabled={isLoading}>Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleReset}
            disabled={isLoading || !newPassword.trim() || !confirmPassword.trim()}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Resetting...
              </div>
            ) : (
              'Reset Password'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
