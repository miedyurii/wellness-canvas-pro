import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const DeleteAccountModal = () => {
  const { session, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        body: { userId: session.user.id },
        headers: { Authorization: \`Bearer \${session.access_token}\` }
      });
      if (error) throw new Error(error.message || 'Deletion failed');
      toast({ title: 'Account deleted' });
      await signOut();
      setOpen(false);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to delete account' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Delete account?</DialogTitle></DialogHeader>
        <p>This will permanently delete your account and data.</p>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
