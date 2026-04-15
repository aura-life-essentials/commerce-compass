import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Zap } from 'lucide-react';

const emailSchema = z.string().trim().email({ message: "Invalid email address" }).max(255);
const passwordSchema = z.string().min(8, { message: "Password must be at least 8 characters" }).max(100);
const displayNameSchema = z.string().trim().max(100).optional();

const loginSchema = z.object({ email: emailSchema, password: passwordSchema });
const signupSchema = z.object({ email: emailSchema, password: passwordSchema, displayName: displayNameSchema });

export default function Auth() {
  const navigate = useNavigate();
  const { user, isLoading, signIn, signUp } = useAuthContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupDisplayName, setSignupDisplayName] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  useEffect(() => {
    if (user && !isLoading) navigate('/command-center');
  }, [user, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const v = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
      if (!v.success) { setError(v.error.errors[0].message); setIsSubmitting(false); return; }
      const { error } = await signIn(loginEmail, loginPassword);
      if (error) {
        setError(error.message.includes('Invalid login credentials') ? 'Invalid email or password.' : error.message.includes('Email not confirmed') ? 'Please confirm your email first.' : error.message);
      } else { navigate('/command-center'); }
    } catch { setError('An unexpected error occurred.'); }
    finally { setIsSubmitting(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null); setIsSubmitting(true);
    try {
      const v = signupSchema.safeParse({ email: signupEmail, password: signupPassword, displayName: signupDisplayName || undefined });
      if (!v.success) { setError(v.error.errors[0].message); setIsSubmitting(false); return; }
      const { error } = await signUp(signupEmail, signupPassword, signupDisplayName || undefined);
      if (error) {
        setError(error.message.includes('User already registered') ? 'Account already exists. Please log in.' : error.message);
      } else {
        setSuccess('Account created! Check your email to confirm, then log in.');
        setSignupEmail(''); setSignupPassword(''); setSignupDisplayName('');
      }
    } catch { setError('An unexpected error occurred.'); }
    finally { setIsSubmitting(false); }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null); setIsSubmitting(true);
    try {
      const v = emailSchema.safeParse(forgotEmail);
      if (!v.success) { setError('Please enter a valid email.'); setIsSubmitting(false); return; }
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) { setError(error.message); }
      else { setSuccess('Password reset link sent! Check your email.'); }
    } catch { setError('An unexpected error occurred.'); }
    finally { setIsSubmitting(false); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_32px_hsl(var(--primary)/0.35)]">
              <Zap className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">AuraOmega</h1>
          <p className="text-muted-foreground">Autonomous Revenue Operating System</p>
        </div>

        <Card className="bg-card/80 border-border backdrop-blur-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm text-primary font-medium">Secure Access</span>
            </div>
            <CardTitle className="text-xl text-foreground">
              {showForgot ? 'Reset Password' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {showForgot ? 'Enter your email to receive a reset link' : 'Sign in to access your command center'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 border-primary/30 bg-primary/10">
                <AlertDescription className="text-foreground">{success}</AlertDescription>
              </Alert>
            )}

            {showForgot ? (
              <div className="space-y-4">
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email</Label>
                    <Input id="forgot-email" type="email" placeholder="you@example.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="bg-background" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : 'Send Reset Link'}
                  </Button>
                </form>
                <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => { setShowForgot(false); setError(null); setSuccess(null); }}>
                  Back to login
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                  <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Login</TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input id="login-email" type="email" placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="bg-background" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="bg-background" required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : 'Sign In'}
                    </Button>
                    <button type="button" onClick={() => { setShowForgot(true); setError(null); setSuccess(null); }} className="w-full text-sm text-primary hover:underline mt-2">
                      Forgot password?
                    </button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-4">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Display Name (optional)</Label>
                      <Input id="signup-name" type="text" placeholder="Your Name" value={signupDisplayName} onChange={(e) => setSignupDisplayName(e.target.value)} className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" type="email" placeholder="you@example.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className="bg-background" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input id="signup-password" type="password" placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="bg-background" required minLength={8} />
                      <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</> : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-muted-foreground text-sm">Protected by enterprise-grade security</p>
        </div>
      </div>
    </div>
  );
}
