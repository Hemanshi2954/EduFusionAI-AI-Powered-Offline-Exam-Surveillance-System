import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogIn, UserPlus } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRoleChange = (value) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "All fields are required."
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Passwords do not match."
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Register user
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      if (result.success) {
        toast({
          title: "Registration successful",
          description: "Welcome to EduFusion!"
        });
        setLocation("/");
      } else {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: result.message || "An error occurred during registration."
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration error",
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
              <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Create Account</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-medium">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-medium">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className="rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="font-medium">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role" className="font-medium">Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={handleRoleChange}
                    required
                  >
                    <SelectTrigger className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="proctor">Proctor / Teacher</SelectItem>
                    </SelectContent>
                  </Select>
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
                      Creating account...
                    </>
                  ) : (
                    <span className="flex items-center justify-center">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Register
                    </span>
                  )}
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-blue-600 hover:text-indigo-600 hover:underline transition-colors">
                      Sign in
                    </Link>
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
          <h2 className="text-3xl font-bold mb-6">Welcome to EduFusion</h2>
          <p className="text-xl mb-8">The next generation of exam proctoring with advanced AI technology</p>
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Secure Exam Environment</h3>
                <p className="text-sm text-blue-100">Ensure academic integrity with AI-based monitoring</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Real-time Monitoring</h3>
                <p className="text-sm text-blue-100">Track student activities and detect suspicious behavior</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold">User-friendly Interface</h3>
                <p className="text-sm text-blue-100">Seamless experience for both students and proctors</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
