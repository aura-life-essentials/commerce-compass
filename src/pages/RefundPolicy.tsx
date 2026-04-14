import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, Package, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const RefundPolicy = () => {
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
              <RotateCcw className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Refund & Return Policy</h1>
            <p className="text-muted-foreground">Last updated: January 27, 2026</p>
            <Badge className="mt-4 bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              30-Day Money-Back Guarantee
            </Badge>
          </div>

          <section className="glass rounded-xl p-8 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-white">Return Window</h2>
            </div>
            <div className="text-muted-foreground space-y-4">
              <p>
                We offer a <strong className="text-white">30-day return policy</strong> from the date of delivery.
                Items must be returned in their original condition with all tags and packaging intact.
              </p>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Eligible for Return</h2>
            </div>
            <div className="text-muted-foreground space-y-4">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Unopened items in original packaging</li>
                <li>Defective or damaged products</li>
                <li>Items that don't match the description</li>
                <li>Wrong items received</li>
                <li>Products with manufacturing defects</li>
              </ul>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <h2 className="text-xl font-semibold text-white mb-4">Non-Returnable Items</h2>
            <div className="text-muted-foreground space-y-4">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Personalized or custom-made products</li>
                <li>Intimate or sanitary products</li>
                <li>Perishable goods</li>
                <li>Digital products or subscriptions (after access)</li>
                <li>Items marked as "Final Sale"</li>
              </ul>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-white">How to Request a Return</h2>
            </div>
            <div className="text-muted-foreground space-y-4">
              <ol className="list-decimal list-inside space-y-3 ml-4">
                <li>
                  <strong className="text-white">Contact Us:</strong> Email us at{" "}
                  <a href="mailto:returns@auraomega.app" className="text-primary hover:underline">
                    returns@auraomega.app
                  </a>{" "}
                  with your order number and reason for return
                </li>
                <li>
                  <strong className="text-white">Receive Approval:</strong> We'll review your request and send
                  you a return authorization within 24-48 hours
                </li>
                <li>
                  <strong className="text-white">Ship the Item:</strong> Pack the item securely and ship it
                  to the provided return address
                </li>
                <li>
                  <strong className="text-white">Receive Refund:</strong> Once we receive and inspect your
                  return, we'll process your refund within 5-7 business days
                </li>
              </ol>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <h2 className="text-xl font-semibold text-white mb-4">Refund Process</h2>
            <div className="text-muted-foreground space-y-4">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Refunds are issued to the original payment method</li>
                <li>Processing time: 5-7 business days after receiving return</li>
                <li>Bank processing may take additional 3-5 business days</li>
                <li>Shipping costs are non-refundable (unless we made an error)</li>
                <li>Partial refunds may apply for items not in original condition</li>
              </ul>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <h2 className="text-xl font-semibold text-white mb-4">Exchanges</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                We're happy to exchange items for a different size or color, subject to availability.
                To request an exchange, follow the same process as returns and indicate your preferred
                replacement item.
              </p>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <h2 className="text-xl font-semibold text-white mb-4">Damaged or Defective Items</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                If you receive a damaged or defective item, please contact us within 48 hours of
                delivery with photos of the damage. We'll arrange a replacement or full refund,
                including any return shipping costs.
              </p>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <h2 className="text-xl font-semibold text-white mb-4">Subscription Cancellations</h2>
            <div className="text-muted-foreground space-y-4">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cancel anytime through your account dashboard</li>
                <li>Access continues until the end of your billing period</li>
                <li>No refunds for partial billing periods</li>
                <li>Free trial cancellations: Cancel before trial ends to avoid charges</li>
              </ul>
            </div>
          </section>

          <section className="glass rounded-xl p-8 border border-border">
            <h2 className="text-xl font-semibold text-white mb-4">Contact Us</h2>
            <div className="text-muted-foreground">
              <p>
                Questions about returns or refunds? We're here to help:
              </p>
              <p className="mt-4">
                Email:{" "}
                <a href="mailto:returns@auraomega.app" className="text-primary hover:underline">
                  returns@auraomega.app
                </a>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Response time: Within 24 hours
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
