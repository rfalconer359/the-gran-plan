import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAllUsers,
  getAllFamilies,
  getChildrenForFamily,
  getSchedulesForChild,
  getDayLogsForChild,
} from '../../services/admin';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import type { UserProfile, Family, Child, Schedule, DayLog } from '../../types';

export function AdminDashboardPage() {
  const { impersonate } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);

  // Expanded family state
  const [expandedFamily, setExpandedFamily] = useState<string | null>(null);
  const [familyChildren, setFamilyChildren] = useState<Record<string, Child[]>>({});
  const [loadingFamily, setLoadingFamily] = useState<string | null>(null);

  // Expanded child state
  const [expandedChild, setExpandedChild] = useState<string | null>(null);
  const [childSchedules, setChildSchedules] = useState<Record<string, Schedule[]>>({});
  const [childDayLogs, setChildDayLogs] = useState<Record<string, DayLog[]>>({});
  const [loadingChild, setLoadingChild] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [u, f] = await Promise.all([getAllUsers(), getAllFamilies()]);
      setUsers(u);
      setFamilies(f);
      setLoading(false);
    }
    load();
  }, []);

  async function toggleFamily(familyId: string) {
    if (expandedFamily === familyId) {
      setExpandedFamily(null);
      return;
    }
    setExpandedFamily(familyId);
    setExpandedChild(null);
    if (!familyChildren[familyId]) {
      setLoadingFamily(familyId);
      const children = await getChildrenForFamily(familyId);
      setFamilyChildren((prev) => ({ ...prev, [familyId]: children }));
      setLoadingFamily(null);
    }
  }

  async function toggleChild(familyId: string, childId: string) {
    const key = `${familyId}/${childId}`;
    if (expandedChild === key) {
      setExpandedChild(null);
      return;
    }
    setExpandedChild(key);
    if (!childSchedules[key]) {
      setLoadingChild(key);
      const [schedules, dayLogs] = await Promise.all([
        getSchedulesForChild(familyId, childId),
        getDayLogsForChild(familyId, childId),
      ]);
      setChildSchedules((prev) => ({ ...prev, [key]: schedules }));
      setChildDayLogs((prev) => ({ ...prev, [key]: dayLogs }));
      setLoadingChild(null);
    }
  }

  function handleImpersonate(user: UserProfile) {
    impersonate(user);
    navigate('/');
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-warm-700">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-warm-100 text-center">
          <p className="text-3xl font-bold text-warm-700">{users.length}</p>
          <p className="text-warm-500">Total Users</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-warm-100 text-center">
          <p className="text-3xl font-bold text-warm-700">{families.length}</p>
          <p className="text-warm-500">Total Families</p>
        </div>
      </div>

      {/* Users */}
      <section>
        <h2 className="text-2xl font-bold text-warm-700 mb-4">Users</h2>
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.uid}
              className="bg-white rounded-xl p-4 border border-warm-100 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-warm-700 truncate">{u.displayName}</p>
                <p className="text-sm text-warm-500 truncate">{u.email}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-warm-100 text-warm-600 capitalize">
                    {u.role}
                  </span>
                  {u.familyIds?.map((fid) => (
                    <span
                      key={fid}
                      className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-mono"
                    >
                      {fid.slice(0, 8)}...
                    </span>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleImpersonate(u)}
              >
                Impersonate
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Families */}
      <section>
        <h2 className="text-2xl font-bold text-warm-700 mb-4">Families</h2>
        <div className="space-y-2">
          {families.map((f) => (
            <div key={f.id} className="bg-white rounded-xl border border-warm-100 overflow-hidden">
              <button
                onClick={() => toggleFamily(f.id)}
                className="w-full text-left p-4 flex items-center justify-between hover:bg-warm-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-warm-700">{f.name}</p>
                  <p className="text-sm text-warm-500">
                    Invite: <span className="font-mono">{f.inviteCode}</span> ·{' '}
                    {f.memberIds.length} member{f.memberIds.length !== 1 && 's'}
                  </p>
                </div>
                <span className="text-warm-400 text-xl">
                  {expandedFamily === f.id ? '−' : '+'}
                </span>
              </button>

              {expandedFamily === f.id && (
                <div className="border-t border-warm-100 p-4 space-y-4">
                  {loadingFamily === f.id ? (
                    <Spinner />
                  ) : (
                    <>
                      {/* Members */}
                      <div>
                        <h4 className="text-sm font-semibold text-warm-500 mb-2">Members</h4>
                        <div className="flex flex-wrap gap-2">
                          {f.memberIds.map((mid) => {
                            const member = users.find((u) => u.uid === mid);
                            return (
                              <span
                                key={mid}
                                className="text-sm px-3 py-1 rounded-full bg-warm-50 text-warm-600"
                              >
                                {member?.displayName ?? mid.slice(0, 8)}
                                {member && (
                                  <span className="text-warm-400 ml-1">({member.role})</span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Children */}
                      <div>
                        <h4 className="text-sm font-semibold text-warm-500 mb-2">Children</h4>
                        {(familyChildren[f.id] ?? []).length === 0 ? (
                          <p className="text-sm text-warm-400 italic">No children added</p>
                        ) : (
                          <div className="space-y-2">
                            {(familyChildren[f.id] ?? []).map((child) => {
                              const childKey = `${f.id}/${child.id}`;
                              return (
                                <div key={child.id} className="border border-warm-100 rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => toggleChild(f.id, child.id)}
                                    className="w-full text-left p-3 flex items-center justify-between hover:bg-warm-50 transition-colors"
                                  >
                                    <div>
                                      <p className="font-medium text-warm-700">{child.name}</p>
                                      <p className="text-xs text-warm-400">DOB: {child.dateOfBirth}</p>
                                    </div>
                                    <span className="text-warm-400">
                                      {expandedChild === childKey ? '−' : '+'}
                                    </span>
                                  </button>

                                  {expandedChild === childKey && (
                                    <div className="border-t border-warm-100 p-3 space-y-3">
                                      {loadingChild === childKey ? (
                                        <Spinner />
                                      ) : (
                                        <>
                                          <div>
                                            <h5 className="text-xs font-semibold text-warm-500 mb-1">
                                              Schedules ({(childSchedules[childKey] ?? []).length})
                                            </h5>
                                            {(childSchedules[childKey] ?? []).length === 0 ? (
                                              <p className="text-xs text-warm-400 italic">None</p>
                                            ) : (
                                              <ul className="text-sm text-warm-600 space-y-1">
                                                {(childSchedules[childKey] ?? []).map((s) => (
                                                  <li key={s.id}>
                                                    {s.name} ({s.dayType}) — {s.entries.length} entries
                                                  </li>
                                                ))}
                                              </ul>
                                            )}
                                          </div>

                                          <div>
                                            <h5 className="text-xs font-semibold text-warm-500 mb-1">
                                              Recent Day Logs ({(childDayLogs[childKey] ?? []).length})
                                            </h5>
                                            {(childDayLogs[childKey] ?? []).length === 0 ? (
                                              <p className="text-xs text-warm-400 italic">None</p>
                                            ) : (
                                              <ul className="text-sm text-warm-600 space-y-1">
                                                {(childDayLogs[childKey] ?? []).map((log) => (
                                                  <li key={log.id}>
                                                    {log.id} — {log.completedEntries.length} completed,{' '}
                                                    {log.dayNotes?.length ?? 0} notes
                                                  </li>
                                                ))}
                                              </ul>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
