import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useI18n } from '@/contexts/I18nContext';
import { Shield } from 'lucide-react';

interface PrivacyPolicyModalProps {
  children: React.ReactNode;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ children }) => {
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
            <Shield className="w-5 h-5" />
            Privacy Policy
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold mb-2">1. Information We Collect</h3>
              <p className="text-muted-foreground mb-2">
                We collect information you provide directly to us, such as:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Personal profile information (name, email, age, gender, height)</li>
                <li>Health metrics (weight, BMI measurements, nutrition data)</li>
                <li>App usage and preferences</li>
                <li>Device and technical information</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">2. How We Use Your Information</h3>
              <p className="text-muted-foreground mb-2">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Provide and improve our health tracking services</li>
                <li>Calculate and display your health metrics</li>
                <li>Send you notifications and reminders (with your consent)</li>
                <li>Analyze app usage to improve user experience</li>
                <li>Ensure app security and prevent abuse</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">3. Information Sharing</h3>
              <p className="text-muted-foreground">
                We do not sell, trade, or otherwise transfer your personal health information to third parties. 
                Your data is stored securely and is only accessible to you and our secure systems.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">4. Data Security</h3>
              <p className="text-muted-foreground">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. All data is encrypted in transit 
                and at rest.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">5. Your Rights</h3>
              <p className="text-muted-foreground mb-2">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and associated data</li>
                <li>Export your data</li>
                <li>Opt out of notifications</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">6. Medical Disclaimer</h3>
              <p className="text-muted-foreground">
                This app is for informational purposes only and is not intended to replace professional 
                medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers 
                regarding your health.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">7. Contact Us</h3>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy, please contact us through the app settings 
                or at our support channels.
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