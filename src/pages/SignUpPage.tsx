import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { signUp } from '../services/auth';
import type { UserRole } from '../types';
import { cn } from '../utils/cn';

export function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!role) {
      setError('Please select your role.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, name, role);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-warm-700 mb-2">The Gran Plan</h1>
          <p className="text-xl text-warm-500">Create your account</p>
        </div>

        <Card variant="elevated" padding="lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <Alert variant="error">{error}</Alert>}

            <div>
              <label className="block text-lg font-medium text-warm-800 mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('parent')}
                  className={cn(
                    'p-4 rounded-xl border-2 text-center transition-all',
                    role === 'parent'
                      ? 'border-warm-500 bg-warm-50 text-warm-700'
                      : 'border-warm-200 text-warm-500 hover:border-warm-300',
                  )}
                >
                  <span className="text-3xl block mb-1">👨‍👩‍👧</span>
                  <span className="text-lg font-semibold">Parent</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('grandparent')}
                  className={cn(
                    'p-4 rounded-xl border-2 text-center transition-all',
                    role === 'grandparent'
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-warm-200 text-warm-500 hover:border-warm-300',
                  )}
                >
                  <span className="text-3xl block mb-1">👵</span>
                  <span className="text-lg font-semibold">Grandparent</span>
                </button>
              </div>
            </div>

            <Input
              label="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Margaret"
              required
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
            />

            <Button type="submit" size="lg" loading={loading}>
              Create Account
            </Button>

            <p className="text-center text-warm-500 text-lg pt-2">
              Already have an account?{' '}
              <Link to="/login" className="text-warm-600 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
