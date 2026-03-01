import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFamily } from '../contexts/FamilyContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { getChildren } from '../services/children';
import { getNotes } from '../services/notes';
import type { Child, Note } from '../types';
import { calculateAge } from '../utils/date';

export function HomePage() {
  const { profile } = useAuth();
  const { family, loading: familyLoading } = useFamily();
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!family) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const [kids, notes] = await Promise.all([
          getChildren(family!.id),
          getNotes(family!.id, 5),
        ]);
        setChildren(kids);
        setRecentNotes(notes);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [family]);

  if (familyLoading || loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  // No family yet — show onboarding
  if (!family) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-warm-700 mb-3">
            Welcome, {profile?.displayName}!
          </h1>
          <p className="text-xl text-warm-500 mb-8">
            Let's get you set up with your family.
          </p>
        </div>

        {profile?.role === 'parent' ? (
          <Card variant="elevated" padding="lg" className="text-center space-y-4">
            <span className="text-5xl block">👨‍👩‍👧</span>
            <h2 className="text-2xl font-bold text-warm-700">Create Your Family</h2>
            <p className="text-lg text-warm-500">
              Set up your family group and invite your child's grandparents.
            </p>
            <Button size="lg" onClick={() => navigate('/create-family')}>
              Create Family
            </Button>
          </Card>
        ) : (
          <Card variant="elevated" padding="lg" className="text-center space-y-4">
            <span className="text-5xl block">👵</span>
            <h2 className="text-2xl font-bold text-warm-700">Join Your Family</h2>
            <p className="text-lg text-warm-500">
              Enter the invite code from your grandchild's parents.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/join-family')}
            >
              Enter Invite Code
            </Button>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-warm-700">
          Hello, {profile?.displayName}!
        </h1>
        <p className="text-lg text-warm-500 mt-1">
          {family.name}
        </p>
      </div>

      {/* Children cards */}
      {children.length > 0 ? (
        <section>
          <h2 className="text-xl font-bold text-warm-700 mb-3">Children</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {children.map((child) => (
              <Link key={child.id} to={`/children/${child.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-warm-100 flex items-center justify-center text-2xl flex-shrink-0">
                      {child.photoUrl ? (
                        <img
                          src={child.photoUrl}
                          alt={child.name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        '👶'
                      )}
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-warm-800">
                        {child.name}
                      </p>
                      <p className="text-warm-500">
                        {calculateAge(child.dateOfBirth)}
                      </p>
                    </div>
                  </div>
                  {child.allergies.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {child.allergies.map((a) => (
                        <span
                          key={a}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium"
                        >
                          ⚠️ {a}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : profile?.role === 'parent' ? (
        <Card className="text-center py-8">
          <p className="text-xl text-warm-500 mb-4">No children added yet</p>
          <Button onClick={() => navigate('/children/new')}>
            Add a Child
          </Button>
        </Card>
      ) : null}

      {/* Quick actions */}
      <section className="grid gap-3 grid-cols-2">
        {profile?.role === 'grandparent' && children.length > 0 && (
          <Link to="/granview" className="col-span-2">
            <Card className="bg-teal-50 border-teal-200 border-2 text-center py-6 hover:shadow-md transition-shadow">
              <span className="text-4xl block mb-2">✅</span>
              <p className="text-xl font-bold text-teal-700">Today's Schedule</p>
              <p className="text-teal-600">View & track today's activities</p>
            </Card>
          </Link>
        )}
        <Link to="/notes">
          <Card className="text-center py-4 hover:shadow-md transition-shadow">
            <span className="text-3xl block mb-1">💬</span>
            <p className="font-semibold text-warm-700">Notes</p>
          </Card>
        </Link>
        <Link to="/settings">
          <Card className="text-center py-4 hover:shadow-md transition-shadow">
            <span className="text-3xl block mb-1">⚙️</span>
            <p className="font-semibold text-warm-700">Settings</p>
          </Card>
        </Link>
      </section>

      {/* Recent notes */}
      {recentNotes.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-warm-700 mb-3">Recent Notes</h2>
          <div className="space-y-3">
            {recentNotes.slice(0, 3).map((note) => (
              <Card key={note.id} padding="sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-warm-700">{note.authorName}</p>
                    <p className="text-warm-600">{note.content}</p>
                  </div>
                  <span className="text-sm text-warm-400 capitalize flex-shrink-0">
                    {note.authorRole}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
