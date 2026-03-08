import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Mail, MessageSquare, Clock, MapPin, ArrowLeft, Send,
  Zap, Phone, HelpCircle, ShoppingBag, Truck, RotateCcw
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
    // Simulate send
    await new Promise(r => setTimeout(r, 1500));
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setName(''); setEmail(''); setSubject(''); setMessage('');
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/store" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">TrendVault</span>
          </Link>
          <Link to="/store">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Store
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <MessageSquare className="w-3 h-3 mr-1" /> Get in Touch
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            How Can We{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
              Help You?
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a question, need support, or want to collaborate? We'd love to hear from you.
          </p>
        </motion.div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: Mail, title: 'Email Us', detail: 'ryanauralift@gmail.com', sub: 'All inquiries welcome' },
            { icon: Clock, title: 'Response Time', detail: 'Within 24 hours', sub: 'Mon-Fri, 9am-6pm EST' },
            { icon: MapPin, title: 'Based In', detail: 'United States', sub: 'Shipping worldwide' },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 bg-card border-border text-center hover:border-primary/30 transition-all">
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <card.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{card.title}</h3>
                <p className="text-primary font-medium text-sm">{card.detail}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" /> Send a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Name</label>
                    <Input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Subject</label>
                  <Input placeholder="How can we help?" value={subject} onChange={e => setSubject(e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Message</label>
                  <Textarea placeholder="Tell us more..." rows={5} value={message} onChange={e => setMessage(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={sending}>
                  {sending ? 'Sending...' : 'Send Message'}
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" /> Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border">
                    <h4 className="font-medium text-sm mb-2">{faq.q}</h4>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="p-6 bg-card border-border mt-4">
              <h3 className="font-semibold mb-3">Quick Links</h3>
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
                    className="flex items-center gap-2 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors text-sm"
                  >
                    <link.icon className="w-4 h-4 text-primary" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} TrendVault. All rights reserved.</p>
          <p className="mt-1">For all inquiries: <a href="mailto:ryanauralift@gmail.com" className="text-primary hover:underline">ryanauralift@gmail.com</a></p>
        </div>
      </footer>
    </div>
  );
}
