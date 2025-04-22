import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  XIcon, 
  HomeIcon, 
  SettingsIcon, 
  LogOutIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const MobileSidebar = ({ isOpen, onClose }) => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  // Close sidebar when location changes (e.g., after navigation)
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location, isOpen, onClose]);
  
  // Prevent scrolling on the body when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  
  // Menu items
  const menuItems = [
    { 
      href: "/", 
      icon: <HomeIcon className="h-5 w-5" />, 
      label: "Dashboard" 
    },
    { 
      href: "/settings", 
      icon: <SettingsIcon className="h-5 w-5" />, 
      label: "Settings" 
    }
  ];
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-30 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-40 w-3/4 max-w-sm bg-white shadow-xl transition-transform flex flex-col">
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link href="/">
            <h1 className="text-xl font-bold text-primary cursor-pointer">EduFusion</h1>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <XIcon className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <nav className="flex flex-col space-y-1">
            {menuItems.map((item) => (
              <div key={item.href}>
                <Link href={item.href}>
                  <div
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-md cursor-pointer",
                      location === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </div>
                </Link>
              </div>
            ))}
          </nav>
        </div>
        
        <div className="border-t p-4">
          <div className="mb-4 flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex w-full items-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <LogOutIcon className="mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
