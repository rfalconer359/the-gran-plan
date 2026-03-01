import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFamily } from '../contexts/FamilyContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { getChildren } from '../services/children';
import { getSchedules } from '../services/schedules';
import type { Child, Schedule } from '../types';

export function SchedulesPage() {
  const { family } = useFamily();
  const navigate = useNavigate();
  const [childSchedules, setChildSchedules] = useState<{ child: Child; schedules: Schedule[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!family) {
      setLoading(false);
      return;
    }
    async function load() {
      const children = await getChildren(family!.id);
      const results = await Promise.all(
        children.map(async (child) => ({
          child,
          schedules: await getSchedules(family!.id, child.id),
        })),
      );
      setChildSchedules(results);
      setLoading(false);
    }
    load();
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
      <h1 className="text-3xl font-bold text-warm-700">Schedules</h1>

      {childSchedules.length === 0 ? (
        <Card className="text-center py-12">
          <span className="text-5xl block mb-4">📋</span>
          <p className="text-xl text-warm-500 mb-4">
            Add children first to create schedules.
          </p>
          <Button onClick={() => navigate('/children/new')}>
            Add a Child
          </Button>
        </Card>
      ) : (
        childSchedules.map(({ child, schedules }) => (
          <Card key={child.id}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-warm-700">{child.name}</h2>
              <Link to={`/children/${child.id}/schedules/new`}>
                <Button size="sm">+ Add</Button>
              </Link>
            </div>

            {schedules.length === 0 ? (
              <p className="text-warm-500 py-2">No schedules yet.</p>
            ) : (
              <div className="space-y-2">
                {schedules.map((schedule) => (
                  <Link
                    key={schedule.id}
                    to={`/children/${child.id}/schedules/${schedule.id}`}
                  >
                    <div className="p-4 bg-cream-50 rounded-xl hover:bg-cream-100 transition-colors mb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-warm-800 text-lg">
                            {schedule.name}
                          </p>
                          <p className="text-warm-500 capitalize">{schedule.dayType}</p>
                        </div>
                        <span className="text-warm-400">
                          {schedule.entries.length} items ›
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
