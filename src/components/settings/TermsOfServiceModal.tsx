import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useI18n } from '@/contexts/I18nContext';
import { FileText } from 'lucide-react';

interface TermsOfServiceModalProps {
  children: React.ReactNode;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ children }) => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Terms of Service
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold mb-2">1. Acceptance of Terms</h3>
              <p className="text-muted-foreground">
                By accessing and using this wellness application, you accept and agree to be bound by the 
                terms and provision of this agreement. If you do not agree to abide by the above, please 
                do not use this service.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">2. Use License</h3>
              <p className="text-muted-foreground mb-2">
                Permission is granted to temporarily use this application for personal, non-commercial 
                health tracking purposes. This license includes the right to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Track and monitor your personal health metrics</li>
                <li>Access analysis and insights features</li>
                <li>Export your personal data</li>
                <li>Receive notifications and reminders</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">3. Restrictions</h3>
              <p className="text-muted-foreground mb-2">
                You are specifically restricted from:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Using the app for any commercial purpose</li>
                <li>Attempting to reverse engineer or hack the application</li>
                <li>Sharing your account credentials with others</li>
                <li>Using the app to store false or misleading health information</li>
                <li>Interfering with the app's security features</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">4. Medical Disclaimer</h3>
              <p className="text-muted-foreground">
                <strong>IMPORTANT:</strong> This application is not a medical device and is not intended 
                to diagnose, treat, cure, or prevent any disease. The information provided should not be 
                used for diagnosing or treating a health problem or disease. Always consult with a 
                healthcare professional before making any healthcare decisions or for guidance about a 
                specific medical condition.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">5. User Account Responsibilities</h3>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your account and password and 
                for restricting access to your device. You agree to accept responsibility for all activities 
                that occur under your account.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">6. Data Accuracy</h3>
              <p className="text-muted-foreground">
                While we strive to provide accurate calculations and insights, you acknowledge that health 
                metrics can vary and should be used as general guidance only. Always verify important health 
                information with healthcare professionals.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">7. Limitation of Liability</h3>
              <p className="text-muted-foreground">
                In no event shall the application owners be liable for any damages including, without limitation, 
                indirect or consequential damages, or any damages whatsoever arising from use or loss of use, 
                data, or profits, arising out of or in connection with the use of this application.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">8. Termination</h3>
              <p className="text-muted-foreground">
                We reserve the right to terminate your access to the application at any time, without notice, 
                for conduct that we believe violates these Terms of Service or is harmful to other users, 
                the application, or third parties.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">9. Changes to Terms</h3>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Changes will be effective immediately 
                upon posting. Your continued use of the application constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </section>
          </div>
        </ScrollArea>
        <div className="flex justify-end pt-4">
          <Button onClick={() => setOpen(false)}>
            {t('common.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};