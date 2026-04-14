import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AuraOmegaLogo } from '@/components/branding/AuraOmegaLogo';

import {
  Mail, MessageSquare, Clock, MapPin, ArrowLeft, Send,
  Phone, HelpCircle, ShoppingBag, Truck, RotateCcw, ShieldCheck
} from 'lucide-react';

const faqs = [
  { q: 'How long does shipping take?', a: 'Standard shipping takes 5-12 business days. Express shipping is available at checkout for 2-5 business days.' },
  { q: 'What is your return policy?', a: 'We offer hassle-free 30-day returns on all products. Items must be in original condition.' },
  { q: 'Do you ship internationally?', a: 'Yes! We ship to over 50 countries worldwide. Shipping times may vary by location.' },
  { q: 'How can I track my order?', a: 'Once shipped, you\'ll receive a tracking number via email. You can also check your order status on our Order History page.' },
];

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    if (!name.trim() || !email.trim()) {
      toast.error('Please provide your name and email.');
      setSending(false);
      return;
    }

    const { error } = await supabase.from('lead_contacts').insert({
      full_name: name,
      email,
      company_name: subject || null,
      message: message || null,
      source: 'contact_page',
      metadata: {
        intake_surface: 'contact_page',
      },
    });

    if (error) {
      toast.error('Could not send your message right now. Please try again.');
      setSending(false);
      return;
    }

    toast.success('Message sent securely. We\'ll review it privately and get back to you.');
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="min-w-0">
            <AuraOmegaLogo subtitle="Private lead intake" className="max-w-[16rem]" />
          </Link>
          <Link to="/store">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Store
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <Badge className="mb-4 border-primary/20 bg-primary/10 text-primary">
            <MessageSquare className="w-3 h-3 mr-1" /> Secure Contact
          </Badge>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Start a{' '}
            <span className="brand-wordmark">Private Conversation</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Share your name, contact details, and project goals here. Your information is stored privately and is only viewable by the owner account inside this app.
          </p>
        </motion.div>

        <div className="mb-12 grid gap-4 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: 'Private by default', detail: 'Owner-only dashboard', sub: 'No public lead list or shared access' },
            { icon: Clock, title: 'Response Time', detail: 'Within 24 hours', sub: 'Mon-Fri, 9am-6pm EST' },
            { icon: MapPin, title: 'Based In', detail: 'United States', sub: 'Shipping worldwide' },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-border bg-card p-6 text-center transition-all hover:border-primary/30">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <card.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-1 font-semibold">{card.title}</h3>
                <p className="text-sm font-medium text-primary">{card.detail}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border bg-card p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <Send className="h-5 w-5 text-primary" /> Send a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Name</label>
                    <Input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Email</label>
                    <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Company or Project</label>
                  <Input placeholder="Brand, company, or project name" value={subject} onChange={e => setSubject(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Message</label>
                  <Textarea placeholder="Tell us what you're building and what you need help monetizing..." rows={5} value={message} onChange={e => setMessage(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={sending}>
                  {sending ? 'Sending...' : 'Send Secure Message'}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-border bg-card p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <HelpCircle className="h-5 w-5 text-primary" /> Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="rounded-xl border border-border bg-muted/30 p-4">
                    <h4 className="mb-2 text-sm font-medium">{faq.q}</h4>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="mt-4 border-border bg-card p-6">
              <h3 className="mb-3 font-semibold">Quick Links</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: ShoppingBag, label: 'Browse Store', to: '/store' },
                  { icon: Truck, label: 'Track Order', to: '/orders' },
                  { icon: RotateCcw, label: 'Returns', to: '/refunds' },
                  { icon: Phone, label: 'Email Support', to: 'mailto:ryanauralift@gmail.com' },
                ].map(link => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="flex items-center gap-2 rounded-lg bg-muted/20 p-3 text-sm transition-colors hover:bg-muted/40"
                  >
                    <link.icon className="h-4 w-4 text-primary" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="mt-4 border-primary/20 bg-primary/5 p-6">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold">Direct contact</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Prefer email? Reach out directly and your inquiry will still be handled privately.
                  </p>
                  <a href="mailto:ryanauralift@gmail.com" className="mt-3 inline-flex text-sm font-medium text-primary hover:underline">
                    ryanauralift@gmail.com
                  </a>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>

      <footer className="mt-12 border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Aura Omega. All rights reserved.</p>
          <p className="mt-1">Private inquiries: <a href="mailto:ryanauralift@gmail.com" className="text-primary hover:underline">ryanauralift@gmail.com</a></p>
        </div>
      </footer>
    </div>
  );
}
