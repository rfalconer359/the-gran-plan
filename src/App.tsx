import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FamilyProvider } from './contexts/FamilyContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { HomePage } from './pages/HomePage';
import { CreateFamilyPage } from './pages/CreateFamilyPage';
import { JoinFamilyPage } from './pages/JoinFamilyPage';
import { ChildrenPage } from './pages/ChildrenPage';
import { AddChildPage } from './pages/AddChildPage';
import { ChildDetailPage } from './pages/ChildDetailPage';
import { SchedulesPage } from './pages/SchedulesPage';
import { ScheduleEditorPage } from './pages/ScheduleEditorPage';
import { GranViewPage } from './pages/GranViewPage';
import { NotesPage } from './pages/NotesPage';
import { SettingsPage } from './pages/SettingsPage';

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FamilyProvider>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <AuthRedirect>
                  <LoginPage />
                </AuthRedirect>
              }
            />
            <Route
              path="/signup"
              element={
                <AuthRedirect>
                  <SignUpPage />
                </AuthRedirect>
              }
            />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<HomePage />} />
              <Route path="/create-family" element={<CreateFamilyPage />} />
              <Route path="/join-family" element={<JoinFamilyPage />} />
              <Route path="/children" element={<ChildrenPage />} />
              <Route path="/children/new" element={<AddChildPage />} />
              <Route path="/children/:childId" element={<ChildDetailPage />} />
              <Route path="/children/:childId/schedules/new" element={<ScheduleEditorPage />} />
              <Route path="/children/:childId/schedules/:scheduleId" element={<ScheduleEditorPage />} />
              <Route path="/schedules" element={<SchedulesPage />} />
              <Route path="/granview" element={<GranViewPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </FamilyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
