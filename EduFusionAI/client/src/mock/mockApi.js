import { v4 as uuidv4 } from 'uuid';

// Mock user database
const mockUsers = [
  {
    id: "1",
    name: "John Student",
    email: "student@example.com",
    password: "password123",
    role: "student"
  },
  {
    id: "2",
    name: "Sarah Proctor",
    email: "proctor@example.com",
    password: "password123",
    role: "proctor"
  }
];

// Mock API request handler
export const mockApiRequest = async (endpoint, method = "GET", data = null) => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  
  // Auth endpoints
  if (endpoint === "/auth/login" && method === "POST") {
    const { email, password } = data;
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return { 
        success: true, 
        user: userWithoutPassword
      };
    }
    
    return { 
      success: false, 
      message: "Invalid email or password" 
    };
  }
  
  if (endpoint === "/auth/register" && method === "POST") {
    const { email } = data;
    
    // Check if user already exists
    if (mockUsers.some(u => u.email === email)) {
      return { 
        success: false, 
        message: "Email already in use" 
      };
    }
    
    // Create new user
    const newUser = {
      id: uuidv4(),
      ...data
    };
    
    mockUsers.push(newUser);
    
    const { password, ...userWithoutPassword } = newUser;
    return { 
      success: true, 
      user: userWithoutPassword 
    };
  }
  
  if (endpoint === "/auth/profile" && method === "PATCH") {
    return { 
      success: true, 
      ...data 
    };
  }
  
  // Default response for unmocked endpoints
  return { 
    success: false, 
    message: "API endpoint not implemented in mock" 
  };
};
