import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFamily } from '../contexts/FamilyContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { getChild, deleteChild } from '../services/children';
import { getSchedules } from '../services/schedules';
import type { Child, Schedule } from '../types';
import { calculateAge } from '../utils/date';

export function ChildDetailPage() {
  const { childId } = useParams<{ childId: string }>();
  const { profile } = useAuth();
  const { family } = useFamily();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!family || !childId) return;
    Promise.all([
      getChild(family.id, childId),
      getSchedules(family.id, childId),
    ]).then(([c, s]) => {
      setChild(c);
      setSchedules(s);
      setLoading(false);
    });
  }, [family, childId]);

  async function handleDelete() {
    if (!family || !childId) return;
    if (!window.confirm(`Remove ${child?.name}? This cannot be undone.`)) return;
    await deleteChild(family.id, childId);
    navigate('/children');
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!child) {
    return <Alert variant="error">Child not found.</Alert>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-warm-100 flex items-center justify-center text-4xl flex-shrink-0">
          {child.photoUrl ? (
            <img
              src={child.photoUrl}
              alt={child.name}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            '👶'
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-warm-700">{child.name}</h1>
          <p className="text-lg text-warm-500">{calculateAge(child.dateOfBirth)}</p>
        </div>
      </div>

      {/* Allergies */}
      {child.allergies.length > 0 && (
        <Card className="border-red-200 border-2 bg-red-50">
          <h2 className="text-xl font-bold text-red-700 mb-2">⚠️ Allergies</h2>
          <div className="flex flex-wrap gap-2">
            {child.allergies.map((a) => (
              <span
                key={a}
                className="px-4 py-2 bg-red-100 text-red-800 rounded-xl text-lg font-semibold"
              >
                {a}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Emergency Contacts */}
      {child.emergencyContacts.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-warm-700 mb-3">📞 Emergency Contacts</h2>
          <div className="space-y-3">
            {child.emergencyContacts.map((contact, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-cream-50 rounded-xl"
              >
                <div>
                  <p className="font-semibold text-warm-800">{contact.name}</p>
                  <p className="text-warm-500">{contact.relationship}</p>
                </div>
                <a
                  href={`tel:${contact.phone}`}
                  className="px-4 py-2 bg-teal-500 text-white rounded-xl font-semibold text-lg hover:bg-teal-600 transition-colors"
                >
                  📞 Call
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Doctor Info */}
      {(child.doctorName || child.doctorPhone) && (
        <Card>
          <h2 className="text-xl font-bold text-warm-700 mb-3">🏥 Doctor</h2>
          <div className="flex items-center justify-between p-3 bg-cream-50 rounded-xl">
            <div>
              <p className="font-semibold text-warm-800">{child.doctorName}</p>
            </div>
            {child.doctorPhone && (
              <a
                href={`tel:${child.doctorPhone}`}
                className="px-4 py-2 bg-teal-500 text-white rounded-xl font-semibold text-lg hover:bg-teal-600 transition-colors"
              >
                📞 Call
              </a>
            )}
          </div>
        </Card>
      )}

      {/* Notes */}
      {child.notes && (
        <Card>
          <h2 className="text-xl font-bold text-warm-700 mb-2">📝 Notes</h2>
          <p className="text-warm-600 text-lg">{child.notes}</p>
        </Card>
      )}

      {/* Schedules */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-warm-700">📋 Schedules</h2>
          {profile?.role === 'parent' && (
            <Link to={`/children/${child.id}/schedules/new`}>
              <Button size="sm">+ Add Schedule</Button>
            </Link>
          )}
        </div>
        {schedules.length === 0 ? (
          <p className="text-warm-500 text-lg py-4 text-center">
            No schedules created yet.
          </p>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <Link
                key={schedule.id}
                to={`/children/${child.id}/schedules/${schedule.id}`}
              >
                <div className="p-4 bg-cream-50 rounded-xl hover:bg-cream-100 transition-colors mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-warm-800 text-lg">
                        {schedule.name}
                      </p>
                      <p className="text-warm-500 capitalize">{schedule.dayType}</p>
                    </div>
                    <span className="text-warm-400 text-lg">
                      {schedule.entries.length} items ›
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Actions */}
      {profile?.role === 'parent' && (
        <div className="pt-4">
          <Button variant="danger" onClick={handleDelete}>
            Remove {child.name}
          </Button>
        </div>
      )}
    </div>
  );
}
