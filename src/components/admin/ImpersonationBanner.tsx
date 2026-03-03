import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export function ImpersonationBanner() {
  const { isImpersonating, profile, clearImpersonation } = useAuth();

  if (!isImpersonating) return null;

  return (
    <div className="sticky top-0 z-[60] bg-amber-100 border-b-2 border-amber-300 px-4 py-2 flex items-center justify-between gap-4">
      <p className="text-amber-900 text-sm font-medium">
        Viewing as: <strong>{profile?.displayName}</strong> ({profile?.email}) —
        Role: {profile?.role}
      </p>
      <Button
        variant="secondary"
        size="sm"
        onClick={clearImpersonation}
      >
        Stop Impersonating
      </Button>
    </div>
  );
}
