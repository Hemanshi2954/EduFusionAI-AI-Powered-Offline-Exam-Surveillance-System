import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Menu, Save } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import MobileSidebar from "@/components/layout/MobileSidebar";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [settings, setSettings] = useState({
    name: user?.name || "",
    email: user?.email || "",
    notifications: {
      email: true,
      browser: true
    },
    darkMode: false,
    language: "english"
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNotificationChange = (type, checked) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: checked
      }
    }));
  };
  
  const handleThemeChange = (checked) => {
    setSettings(prev => ({
      ...prev,
      darkMode: checked
    }));
  };
  
  const handleLanguageChange = (e) => {
    const { value } = e.target;
    setSettings(prev => ({
      ...prev,
      language: value
    }));
  };
  
  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    // Simulate saving settings
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully."
    });
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold ml-2">Settings</h1>
            </div>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Saving
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Profile Settings</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    name="name"
                    value={settings.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email"
                    value={settings.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Notification Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications about exams and alerts via email</p>
                  </div>
                  <Switch 
                    id="email-notifications"
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="browser-notifications">Browser Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications in your browser while using the application</p>
                  </div>
                  <Switch 
                    id="browser-notifications"
                    checked={settings.notifications.browser}
                    onCheckedChange={(checked) => handleNotificationChange("browser", checked)}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Appearance Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-gray-500">Use dark theme for the application</p>
                  </div>
                  <Switch 
                    id="dark-mode"
                    checked={settings.darkMode}
                    onCheckedChange={handleThemeChange}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <select 
                    id="language"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={settings.language}
                    onChange={handleLanguageChange}
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Privacy Settings</h2>
              <p className="text-sm text-gray-500 mb-4">
                By using this platform, you agree to our data collection policies for proctoring purposes. 
                Data is only used for exam proctoring and is not shared with third parties.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Some exam settings might override your personal preferences
                  for privacy and proctoring purposes. Contact your exam administrator for details.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
