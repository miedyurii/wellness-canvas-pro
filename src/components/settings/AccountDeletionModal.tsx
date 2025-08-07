import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AccountDeletionModalProps {
  children: React.ReactNode;
}

export const AccountDeletionModal: React.FC<AccountDeletionModalProps> = ({ children }) => {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const expectedText = t('common.delete').toUpperCase();
  const isConfirmValid = confirmText.toUpperCase() === expectedText && confirmChecked;

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    
    try {
      // Call the edge function to delete all user data
      const { error: deleteError } = await supabase.functions.invoke('delete-user-account', {
        body: { userId: user.id }
      });
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Sign out the user
      await signOut();
      
      toast.success(t('dialogs.account_deleted'));
      setIsOpen(false);
      
      // Redirect to home page
      window.location.href = '/';
      
    } catch (error) {
      console.error('Account deletion failed:', error);
      toast.error(t('dialogs.account_deletion_failed'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            {t('dialogs.delete_account_title')}
          </DialogTitle>
          <DialogDescription className="text-left space-y-3">
            <p>{t('dialogs.delete_account_description')}</p>
            
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="font-medium text-sm">
                {t('settings.delete_account_warning')}
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirm-text">
              {t('dialogs.type_delete_to_confirm')}
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={expectedText}
              className="font-mono"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirm-deletion"
              checked={confirmChecked}
              onCheckedChange={(checked) => setConfirmChecked(checked === true)}
            />
            <Label htmlFor="confirm-deletion" className="text-sm">
              {t('settings.delete_account_confirm')}
            </Label>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={!isConfirmValid || isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-destructive-foreground/30 border-t-destructive-foreground" />
                {t('dialogs.deleting_account')}
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                {t('common.delete')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};