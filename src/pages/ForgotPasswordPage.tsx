import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { resetPassword } from '../services/auth';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-warm-700 mb-2">The Gran Plan</h1>
          <p className="text-xl text-warm-500">Reset your password</p>
        </div>

        <Card variant="elevated" padding="lg">
          {success ? (
            <div className="text-center space-y-4">
              <Alert variant="success">
                Check your email for a password reset link.
              </Alert>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <Alert variant="error">{error}</Alert>}

              <p className="text-warm-600 text-lg">
                Enter your email and we'll send you a link to reset your password.
              </p>

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />

              <Button type="submit" size="lg" loading={loading}>
                Send Reset Link
              </Button>

              <p className="text-center">
                <Link
                  to="/login"
                  className="text-warm-500 hover:text-warm-600 text-lg"
                >
                  Back to Sign In
                </Link>
              </p>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
