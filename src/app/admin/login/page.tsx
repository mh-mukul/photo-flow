'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { login, type LoginState } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, LogIn } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" aria-disabled={pending} disabled={pending}>
      {pending ? 'Logging in...' : <> <LogIn className="mr-2 h-4 w-4" /> Login </>}
    </Button>
  );
}

export default function LoginPage() {
  const initialState: LoginState | undefined = undefined;
  const [state, dispatch] = useFormState(login, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.message && state.errors) { // Only show toast if there are errors with a message
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-primary">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin panel.</CardDescription>
        </CardHeader>
        <form action={dispatch}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="admin"
                required
                className={state?.errors?.username ? 'border-destructive' : ''}
              />
              {state?.errors?.username && (
                <p className="text-xs text-destructive">{state.errors.username.join(', ')}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className={state?.errors?.password ? 'border-destructive' : ''}
              />
              {state?.errors?.password && (
                <p className="text-xs text-destructive">{state.errors.password.join(', ')}</p>
              )}
            </div>
            {state?.errors?.credentials && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {state.errors.credentials.join(', ')}
                </AlertDescription>
              </Alert>
            )}
             {state?.message && !state.errors?.credentials && state.errors && ( // Generic message not tied to specific fields
                <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {state.message}
                    </AlertDescription>
                </Alert>
            )}
          </CardContent>
          <CardFooter>
            <LoginButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
