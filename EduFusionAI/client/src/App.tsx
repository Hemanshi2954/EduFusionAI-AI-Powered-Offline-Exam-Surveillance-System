import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import StudentDashboard from "@/pages/StudentDashboard";
import ProctorDashboard from "@/pages/ProctorDashboard";
import StudentExam from "@/pages/StudentExam";
import ProctorMonitoring from "@/pages/ProctorMonitoring";
import Settings from "@/pages/Settings";
import { useAuth } from "@/hooks/useAuth";
import { AuthProvider } from "@/context/AuthContext";

function Router() {
  const { user, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  // Routes for unauthenticated users
  if (!user) {
    return (
      <Switch>
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route>
          <Redirect to="/register" />
        </Route>
      </Switch>
    );
  }

  // Routes for authenticated users based on role
  return (
    <Switch>
      <Route path="/">
        {user?.role === "student" ? <StudentDashboard /> : <ProctorDashboard />}
      </Route>
      <Route path="/exam/:id">
        {user?.role === "student" ? <StudentExam /> : <NotFound />}
      </Route>
      <Route path="/monitor/:id">
        {user?.role === "proctor" ? <ProctorMonitoring /> : <NotFound />}
      </Route>
      <Route path="/settings" component={Settings} />
      <Route path="/login">
        <Redirect to="/" />
      </Route>
      <Route path="/register">
        <Redirect to="/" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
