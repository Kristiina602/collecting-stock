import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserForm } from './UserForm';
import { User } from '../types';

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: User) => void;
}

export const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ 
  isOpen, 
  onClose, 
  onUserCreated 
}) => {
  const { t } = useTranslation();

  const handleUserCreated = (user: User) => {
    onUserCreated(user);
    onClose(); // Close dialog after successful user creation
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <button className="dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="dialog-body">
          <UserForm onUserCreated={handleUserCreated} />
        </div>
      </div>
    </div>
  );
};
