import React, { useState, useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import { Shield, ShieldCheck, Smartphone, AlertCircle } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MFAModalProps {
  children: React.ReactNode;
}

export const MFAModal: React.FC<MFAModalProps> = ({ children }) => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'check' | 'setup' | 'verify' | 'disable'>('check');

  useEffect(() => {
    if (isOpen) {
      checkMFAStatus();
    }
  }, [isOpen]);

  const checkMFAStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      
      const totp = data.totp.find(factor => factor.status === 'verified');
      setMfaEnabled(!!totp);
      setStep(totp ? 'check' : 'setup');
    } catch (error) {
      console.error('Error checking MFA status:', error);
      toast.error(t('errors.server_error'));
    }
  };

  const startMFASetup = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });
      
      if (error) throw error;
      
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setStep('verify');
    } catch (error) {
      console.error('Error starting MFA setup:', error);
      toast.error(t('errors.server_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMFASetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error) throw factors.error;
      
      const totp = factors.data.totp[0];
      if (!totp) throw new Error('No TOTP factor found');

      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: totp.id,
        code: verificationCode,
      });

      if (error) throw error;
      
      setMfaEnabled(true);
      toast.success(t('settings.mfa_enabled'));
      setIsOpen(false);
      setStep('check');
      setVerificationCode('');
    } catch (error) {
      console.error('Error verifying MFA:', error);
      toast.error('Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const disableMFA = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      
      const totp = data.totp.find(factor => factor.status === 'verified');
      if (!totp) throw new Error('No verified TOTP factor found');

      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: totp.id,
      });

      if (unenrollError) throw unenrollError;
      
      setMfaEnabled(false);
      toast.success(t('settings.mfa_disabled'));
      setIsOpen(false);
      setStep('setup');
    } catch (error) {
      console.error('Error disabling MFA:', error);
      toast.error(t('errors.server_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'check':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-4">
              <ShieldCheck className="w-16 h-16 text-success" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('settings.mfa_enabled')}
              </p>
            </div>
          </div>
        );

      case 'setup':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-4">
              <Shield className="w-16 h-16 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account with two-factor authentication.
              </p>
            </div>
          </div>
        );

      case 'verify':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Scan QR Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      Secret key: <code className="font-mono text-xs">{secret}</code>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-2">
              <Label htmlFor="verification-code">
                {t('auth.enter_mfa_code')}
              </Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="text-center font-mono text-lg tracking-wider"
                maxLength={6}
              />
            </div>
            
            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Use an authenticator app like Google Authenticator, Authy, or 1Password to scan the QR code above.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderFooter = () => {
    switch (step) {
      case 'check':
        return (
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              {t('common.close')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setStep('disable')}
            >
              {t('settings.disable_mfa')}
            </Button>
          </>
        );

      case 'setup':
        return (
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={startMFASetup}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading && <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />}
              {t('settings.enable_mfa')}
            </Button>
          </>
        );

      case 'verify':
        return (
          <>
            <Button variant="outline" onClick={() => setStep('setup')}>
              {t('common.back')}
            </Button>
            <Button 
              onClick={verifyMFASetup}
              disabled={isLoading || verificationCode.length !== 6}
              className="gap-2"
            >
              {isLoading && <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />}
              {t('common.confirm')}
            </Button>
          </>
        );

      case 'disable':
        return (
          <>
            <Button variant="outline" onClick={() => setStep('check')}>
              {t('common.cancel')}
            </Button>
            <Button 
              variant="destructive"
              onClick={disableMFA}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading && <div className="w-4 h-4 animate-spin rounded-full border-2 border-destructive-foreground/30 border-t-destructive-foreground" />}
              {t('settings.disable_mfa')}
            </Button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {step === 'disable' ? t('settings.disable_mfa') : t('settings.mfa_setup')}
          </DialogTitle>
          <DialogDescription>
            {step === 'disable' 
              ? 'This will remove two-factor authentication from your account.'
              : t('settings.mfa_description')
            }
          </DialogDescription>
        </DialogHeader>
        
        {step === 'disable' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-4">
              <AlertCircle className="w-16 h-16 text-warning" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Are you sure you want to disable two-factor authentication? This will make your account less secure.
            </p>
          </div>
        ) : (
          renderStep()
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {renderFooter()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};