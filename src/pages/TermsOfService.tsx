import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Scale, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/store">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Store
          </Button>
        </Link>

        <div className="space-y-8">
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: January 27, 2026</p>
          </div>

          <section className="glass rounded-xl p-8 border border-border">
            <h2 className="text-xl font-semibold text-white mb-4">1. Agreement to Terms</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                By accessing or using AuraOmega ("the Service"), you agree to be bound by these Terms
                of Service. If you disagree with any part of these terms, you may not access the Service.
              </p>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <h2 className="text-xl font-semibold text-white mb-4">2. Use of Service</h2>
            <div className="text-muted-foreground space-y-4">
              <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the Service in any way that violates applicable laws or regulations</li>
                <li>Attempt to gain unauthorized access to any portion of the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Engage in any fraudulent activity</li>
                <li>Resell products for commercial purposes without authorization</li>
              </ul>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <h2 className="text-xl font-semibold text-white mb-4">3. Account Registration</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                To access certain features of the Service, you may be required to register for an account.
                You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized account access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-white">4. Orders and Payment</h2>
            </div>
            <div className="text-muted-foreground space-y-4">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All prices are displayed in USD unless otherwise specified</li>
                <li>We reserve the right to refuse or cancel any order</li>
                <li>Payment is processed securely through Stripe</li>
                <li>You agree to provide current and accurate payment information</li>
                <li>Prices and availability are subject to change without notice</li>
              </ul>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <h2 className="text-xl font-semibold text-white mb-4">5. Shipping and Delivery</h2>
            <div className="text-muted-foreground space-y-4">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Delivery times are estimates and not guaranteed</li>
                <li>Risk of loss passes to you upon delivery to the carrier</li>
                <li>You are responsible for providing accurate shipping information</li>
                <li>Additional customs duties may apply for international orders</li>
              </ul>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <h2 className="text-xl font-semibold text-white mb-4">6. Intellectual Property</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                The Service and its original content, features, and functionality are owned by AuraOmega
                and are protected by international copyright, trademark, patent, trade secret, and other
                intellectual property laws.
              </p>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-white">7. Limitation of Liability</h2>
            </div>
            <div className="text-muted-foreground space-y-4">
              <p>
                To the maximum extent permitted by law, AuraOmega shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages, including without limitation,
                loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <h2 className="text-xl font-semibold text-white mb-4">8. Governing Law</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the
                United States, without regard to its conflict of law provisions.
              </p>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <h2 className="text-xl font-semibold text-white mb-4">9. Changes to Terms</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                We reserve the right to modify these terms at any time. We will provide notice of
                significant changes by posting the new Terms on this page and updating the "Last updated" date.
              </p>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <h2 className="text-xl font-semibold text-white mb-4">10. Contact Us</h2>
            <div className="text-muted-foreground">
              <p>
                If you have questions about these Terms, please contact us at:
              </p>
              <p className="mt-4">
                <a href="mailto:legal@auraomega.app" className="text-primary hover:underline">
                  legal@auraomega.app
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
