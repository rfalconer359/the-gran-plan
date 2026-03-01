import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../contexts/AuthContext';
import { useFamily } from '../contexts/FamilyContext';
import { joinFamily } from '../services/family';

export function JoinFamilyPage() {
  const { user, refreshProfile } = useAuth();
  const { setActiveFamily } = useFamily();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError('');
    setLoading(true);

    try {
      const family = await joinFamily(code.toUpperCase(), user.uid);
      setActiveFamily(family);
      await refreshProfile();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to join family.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card variant="elevated" padding="lg" className="max-w-md w-full">
        <div className="text-center mb-6">
          <span className="text-5xl block mb-3">👵</span>
          <h1 className="text-2xl font-bold text-warm-700">Join Your Family</h1>
          <p className="text-lg text-warm-500 mt-1">
            Enter the 6-character code from the parents.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert variant="error">{error}</Alert>}

          <Input
            label="Invite Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. ABC123"
            required
            maxLength={6}
            className="text-center text-2xl font-mono tracking-widest"
          />

          <Button type="submit" size="lg" variant="secondary" loading={loading}>
            Join Family
          </Button>
        </form>
      </Card>
    </div>
  );
}
