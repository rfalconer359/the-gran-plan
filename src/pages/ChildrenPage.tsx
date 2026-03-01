import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFamily } from '../contexts/FamilyContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { getChildren } from '../services/children';
import type { Child } from '../types';
import { calculateAge } from '../utils/date';

export function ChildrenPage() {
  const { profile } = useAuth();
  const { family } = useFamily();
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!family) return;
    getChildren(family.id).then(setChildren).finally(() => setLoading(false));
  }, [family]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-warm-700">Children</h1>
        {profile?.role === 'parent' && (
          <Button onClick={() => navigate('/children/new')}>
            + Add Child
          </Button>
        )}
      </div>

      {children.length === 0 ? (
        <Card className="text-center py-12">
          <span className="text-5xl block mb-4">👶</span>
          <p className="text-xl text-warm-500 mb-4">No children added yet</p>
          {profile?.role === 'parent' && (
            <Button onClick={() => navigate('/children/new')}>
              Add Your First Child
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {children.map((child) => (
            <Link key={child.id} to={`/children/${child.id}`}>
              <Card className="hover:shadow-md transition-shadow mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-warm-100 flex items-center justify-center text-3xl flex-shrink-0">
                    {child.photoUrl ? (
                      <img
                        src={child.photoUrl}
                        alt={child.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      '👶'
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-semibold text-warm-800">{child.name}</p>
                    <p className="text-warm-500">{calculateAge(child.dateOfBirth)}</p>
                  </div>
                  <span className="text-warm-300 text-2xl">›</span>
                </div>

                {child.allergies.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {child.allergies.map((a) => (
                      <span
                        key={a}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-base font-medium"
                      >
                        ⚠️ {a}
                      </span>
                    ))}
                  </div>
                )}

                {child.emergencyContacts.length > 0 && (
                  <div className="mt-2">
                    <p className="text-warm-500 text-base">
                      📞 {child.emergencyContacts.length} emergency contact{child.emergencyContacts.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
