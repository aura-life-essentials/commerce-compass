import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
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
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: January 27, 2026</p>
          </div>

          <section className="glass rounded-xl p-8 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-white">Information We Collect</h2>
            </div>
            <div className="text-muted-foreground space-y-4">
              <p>We collect information you provide directly to us, including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name, email address, and contact information</li>
                <li>Billing and shipping addresses</li>
                <li>Payment information (processed securely via Stripe)</li>
                <li>Order history and preferences</li>
                <li>Communications with customer support</li>
              </ul>
              <p>We automatically collect certain information when you visit our site:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Device and browser information</li>
                <li>IP address and location data</li>
                <li>Pages viewed and interactions</li>
                <li>Referral sources</li>
              </ul>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-white">How We Use Your Information</h2>
            </div>
            <div className="text-muted-foreground space-y-4">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Process and fulfill your orders</li>
                <li>Send order confirmations and shipping updates</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Send promotional communications (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Prevent fraud and enhance security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-white">Data Security</h2>
            </div>
            <div className="text-muted-foreground space-y-4">
              <p>
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>SSL/TLS encryption for all data transmissions</li>
                <li>Secure payment processing through Stripe (PCI-DSS compliant)</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and authentication requirements</li>
                <li>Data encryption at rest and in transit</li>
              </ul>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <h2 className="text-xl font-semibold text-white mb-4">Your Rights</h2>
            <div className="text-muted-foreground space-y-4">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt out of marketing communications</li>
                <li>Data portability (receive your data in a structured format)</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at{" "}
                <a href="mailto:privacy@trendvault.store" className="text-primary hover:underline">
                  privacy@trendvault.store
                </a>
              </p>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <h2 className="text-xl font-semibold text-white mb-4">Cookies</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                We use cookies and similar technologies to enhance your experience, analyze site usage,
                and assist in our marketing efforts. You can manage cookie preferences through your
                browser settings.
              </p>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <h2 className="text-xl font-semibold text-white mb-4">Third-Party Services</h2>
            <div className="text-muted-foreground space-y-4">
              <p>We may share information with trusted third parties:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Payment processors (Stripe) for secure transactions</li>
                <li>Shipping carriers for order delivery</li>
                <li>Analytics providers to improve our services</li>
                <li>Marketing platforms (with your consent)</li>
              </ul>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <h2 className="text-xl font-semibold text-white mb-4">Contact Us</h2>
            <div className="text-muted-foreground">
              <p>
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <p className="mt-4">
                <a href="mailto:privacy@trendvault.store" className="text-primary hover:underline">
                  privacy@trendvault.store
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
