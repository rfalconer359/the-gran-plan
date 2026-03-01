import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../contexts/AuthContext';
import { useFamily } from '../contexts/FamilyContext';
import { createFamily } from '../services/family';

export function CreateFamilyPage() {
  const { user, refreshProfile } = useAuth();
  const { setActiveFamily } = useFamily();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError('');
    setLoading(true);

    try {
      const family = await createFamily(name, user.uid);
      setInviteCode(family.inviteCode);
      setActiveFamily(family);
      await refreshProfile();
    } catch (err: any) {
      setError(err.message || 'Failed to create family.');
    } finally {
      setLoading(false);
    }
  }

  if (inviteCode) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card variant="elevated" padding="lg" className="max-w-md w-full text-center space-y-6">
          <span className="text-5xl block">🎉</span>
          <h1 className="text-2xl font-bold text-warm-700">Family Created!</h1>
          <p className="text-lg text-warm-600">
            Share this invite code with the grandparents:
          </p>
          <div className="bg-cream-100 rounded-xl p-6">
            <p className="text-4xl font-mono font-bold text-warm-700 tracking-widest">
              {inviteCode}
            </p>
          </div>
          <p className="text-warm-500">
            They'll enter this code when they sign up or join.
          </p>
          <Button size="lg" onClick={() => navigate('/')}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card variant="elevated" padding="lg" className="max-w-md w-full">
        <div className="text-center mb-6">
          <span className="text-5xl block mb-3">👨‍👩‍👧</span>
          <h1 className="text-2xl font-bold text-warm-700">Create Your Family</h1>
          <p className="text-lg text-warm-500 mt-1">
            Give your family a name to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert variant="error">{error}</Alert>}

          <Input
            label="Family Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. The Smiths"
            required
          />

          <Button type="submit" size="lg" loading={loading}>
            Create Family
          </Button>
        </form>
      </Card>
    </div>
  );
}
