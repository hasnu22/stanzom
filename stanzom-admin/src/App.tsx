import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Loader2 } from 'lucide-react';

// Lazy-loaded pages
const Login = lazy(() => import('@/pages/login/Login'));
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const SportList = lazy(() => import('@/pages/sports/SportList'));
const SportCreate = lazy(() => import('@/pages/sports/SportCreate'));
const EventList = lazy(() => import('@/pages/events/EventList'));
const EventCreate = lazy(() => import('@/pages/events/EventCreate'));
const LiveControl = lazy(() => import('@/pages/events/LiveControl'));
const QuestionManager = lazy(() => import('@/pages/predictions/QuestionManager'));
const PlayerList = lazy(() => import('@/pages/players/PlayerList'));
const PlayerCreate = lazy(() => import('@/pages/players/PlayerCreate'));
const TeamList = lazy(() => import('@/pages/teams/TeamList'));
const TeamCreate = lazy(() => import('@/pages/teams/TeamCreate'));
const PunditModerate = lazy(() => import('@/pages/pundit/PunditModerate'));
const InfluencerList = lazy(() => import('@/pages/influencers/InfluencerList'));
const ApplicationReview = lazy(() => import('@/pages/influencers/ApplicationReview'));
const FeaturedOrder = lazy(() => import('@/pages/influencers/FeaturedOrder'));
const DailyWinner = lazy(() => import('@/pages/prizes/DailyWinner'));
const AddressView = lazy(() => import('@/pages/prizes/AddressView'));
const PointsLedger = lazy(() => import('@/pages/rewards/PointsLedger'));
const ReferralStats = lazy(() => import('@/pages/rewards/ReferralStats'));
const PushSender = lazy(() => import('@/pages/notifications/PushSender'));
const UserList = lazy(() => import('@/pages/users/UserList'));
const UserDetail = lazy(() => import('@/pages/users/UserDetail'));
const AdminManagement = lazy(() => import('@/pages/admins/AdminManagement'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function LoadingFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 size={32} className="animate-spin text-gold" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function SuperAdminRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const isSuperAdmin = useAuth((s) => s.isSuperAdmin);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isSuperAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="sports" element={<SportList />} />
              <Route path="sports/create" element={<SportCreate />} />
              <Route path="sports/:id/edit" element={<SportCreate />} />
              <Route path="events" element={<EventList />} />
              <Route path="events/create" element={<EventCreate />} />
              <Route path="events/live" element={<LiveControl />} />
              <Route path="predictions" element={<QuestionManager />} />
              <Route path="players" element={<PlayerList />} />
              <Route path="players/create" element={<PlayerCreate />} />
              <Route path="players/:id/edit" element={<PlayerCreate />} />
              <Route path="teams" element={<TeamList />} />
              <Route path="teams/create" element={<TeamCreate />} />
              <Route path="teams/:id/edit" element={<TeamCreate />} />
              <Route path="pundit" element={<PunditModerate />} />
              <Route path="influencers" element={<InfluencerList />} />
              <Route path="influencers/applications" element={<ApplicationReview />} />
              <Route path="influencers/featured" element={<FeaturedOrder />} />
              <Route path="prizes" element={<DailyWinner />} />
              <Route path="prizes/addresses" element={<AddressView />} />
              <Route path="rewards" element={<PointsLedger />} />
              <Route path="rewards/referrals" element={<ReferralStats />} />
              <Route path="notifications" element={<PushSender />} />
              <Route path="users" element={<UserList />} />
              <Route path="users/:id" element={<UserDetail />} />
              <Route path="admins" element={<SuperAdminRoute><AdminManagement /></SuperAdminRoute>} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
