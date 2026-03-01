import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFamily } from '../contexts/FamilyContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { logOut } from '../services/auth';
import { getFamilyMembers, regenerateInviteCode } from '../services/family';
import type { UserProfile } from '../types';

export function SettingsPage() {
  const { profile } = useAuth();
  const { family, refreshFamily } = useFamily();
  const navigate = useNavigate();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    if (!family) {
      setLoading(false);
      return;
    }
    setInviteCode(family.inviteCode);
    getFamilyMembers(family.memberIds)
      .then((m) => setMembers(m as UserProfile[]))
      .finally(() => setLoading(false));
  }, [family]);

  async function handleRegenerateCode() {
    if (!family) return;
    setRegenerating(true);
    try {
      const newCode = await regenerateInviteCode(family.id, inviteCode);
      setInviteCode(newCode);
      await refreshFamily();
    } finally {
      setRegenerating(false);
    }
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(inviteCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  async function handleLogout() {
    await logOut();
    navigate('/login');
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-warm-700">Settings</h1>

      {/* Profile */}
      <Card>
        <h2 className="text-xl font-bold text-warm-700 mb-3">Your Profile</h2>
        <div className="space-y-2">
          <p className="text-lg">
            <span className="text-warm-500">Name:</span>{' '}
            <span className="font-medium text-warm-800">{profile?.displayName}</span>
          </p>
          <p className="text-lg">
            <span className="text-warm-500">Email:</span>{' '}
            <span className="font-medium text-warm-800">{profile?.email}</span>
          </p>
          <p className="text-lg">
            <span className="text-warm-500">Role:</span>{' '}
            <span className="font-medium text-warm-800 capitalize">{profile?.role}</span>
          </p>
        </div>
      </Card>

      {/* Family */}
      {family && (
        <Card>
          <h2 className="text-xl font-bold text-warm-700 mb-3">Family: {family.name}</h2>

          {/* Invite Code */}
          <div className="mb-4 p-4 bg-cream-100 rounded-xl">
            <p className="text-warm-600 font-medium mb-2">Invite Code</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-mono font-bold text-warm-700 tracking-widest">
                {inviteCode}
              </span>
              <Button size="sm" variant="outline" onClick={handleCopyCode}>
                {codeCopied ? 'Copied!' : 'Copy'}
              </Button>
              {profile?.role === 'parent' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRegenerateCode}
                  loading={regenerating}
                >
                  Regenerate
                </Button>
              )}
            </div>
          </div>

          {/* Members */}
          <div>
            <p className="text-warm-600 font-medium mb-2">Members</p>
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.uid}
                  className="flex items-center justify-between p-3 bg-cream-50 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-warm-800">{member.displayName}</p>
                    <p className="text-warm-500 text-sm">{member.email}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      member.role === 'parent'
                        ? 'bg-warm-100 text-warm-600'
                        : 'bg-teal-100 text-teal-600'
                    }`}
                  >
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* No family */}
      {!family && (
        <Card className="text-center py-6">
          <p className="text-warm-500 text-lg mb-4">You're not in a family yet.</p>
          {profile?.role === 'parent' ? (
            <Button onClick={() => navigate('/create-family')}>Create Family</Button>
          ) : (
            <Button variant="secondary" onClick={() => navigate('/join-family')}>
              Join Family
            </Button>
          )}
        </Card>
      )}

      {/* Logout */}
      <Card>
        <Button variant="outline" size="lg" onClick={handleLogout}>
          Sign Out
        </Button>
      </Card>
    </div>
  );
}
