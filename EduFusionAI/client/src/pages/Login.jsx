import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, UserPlus } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("student@example.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login({ email, password });
      
      if (result.success) {
        toast({
          title: "Login successful",
          description: "Welcome to EduFusion!"
        });
        setLocation("/");
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: result.message || "Invalid email or password"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login error",
        description: "Please try again"
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">EduFusion</h1>
            <p className="text-gray-600">AI-Powered Exam Proctoring Platform</p>
          </div>
          
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Sign In</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex-col space-y-4 pb-6">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-md transition-all" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Logging in...
                    </>
                  ) : (
                    <span className="flex items-center justify-center">
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </span>
                  )}
                </Button>
                
                <Link href="/register" className="w-full">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-indigo-600 transition-colors"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create New Account
                  </Button>
                </Link>
                
                <div className="text-sm text-center p-3 bg-blue-50 rounded-lg border border-blue-100 mt-2">
                  <p className="text-gray-700 font-medium mb-1">
                    Demo credentials (pre-filled):
                  </p>
                  <p className="text-gray-600">
                    Student: student@example.com / password123
                  </p>
                  <p className="text-gray-600">
                    Proctor: proctor@example.com / password123
                  </p>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
      
      {/* Right Side - Hero */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-r from-blue-600 to-indigo-700 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-md text-center">
          <h2 className="text-3xl font-bold mb-6">Welcome Back!</h2>
          <p className="text-xl mb-8">Sign in to access your exams and proctoring tools</p>
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Role-Based Access</h3>
                <p className="text-sm text-blue-100">Customized experience for students and proctors</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Exam Scheduling</h3>
                <p className="text-sm text-blue-100">Easy access to upcoming and active exams</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Comprehensive Reports</h3>
                <p className="text-sm text-blue-100">Get detailed insights on exam performance and alerts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
