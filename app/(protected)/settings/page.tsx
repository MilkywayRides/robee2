import { UserCog, Shield, User, ChevronRight, Mail, Key } from 'lucide-react';
import { getCurrentUser } from '@/lib/authentication';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { SidebarInset } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UpdateProfileForm from '@/components/auth/update-profile-form';
import UpdatePasswordForm from '@/components/auth/update-password-form';

type User = {
  isOAuth: boolean | undefined; // Make isOAuth optional since it might be undefined
  name?: string;
  email?: string;
  id: string;
};

export default async function SettingsPage() {
  let user: User | null = null;
  
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error('Error fetching user:', error);
    // You might want to redirect to an error page or handle the error differently
    throw new Error('Failed to load user settings');
  }

  if (!user) {
    // You might want to redirect to login page or show an error message
    throw new Error('Unauthorized');
  }

  const currentDate = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background/95">
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <div className="flex flex-col min-h-screen">
            <SiteHeader />
            
            <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
              {/* Page Header */}
              <div className="mb-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="flex items-center text-2xl md:text-3xl font-bold tracking-tight text-foreground/90">
                      <UserCog className="mr-3 w-8 h-8 text-primary" />
                      Account Settings
                    </h2>
                    <p className="text-muted-foreground text-sm md:text-base">
                      Manage your account preferences and security settings
                    </p>
                  </div>
                  <Badge variant="outline" className="hidden md:flex items-center px-4 py-1">
                    {currentDate}
                  </Badge>
                </div>
                <Separator className="my-6" />
              </div>

              {/* Settings Navigation */}
              <Tabs defaultValue="profile" className="space-y-8">
                <TabsList className="bg-background/50 backdrop-blur-sm border">
                  <TabsTrigger value="profile" className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Security
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                  {/* Account Information Section */}
                  <Card className="w-full shadow-lg border border-border/50">
                    <CardHeader className="border-b bg-muted/20 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold text-foreground/90">Account Information</h3>
                          <CardDescription>
                            Your account details and identification
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid gap-6">
                        {/* User ID Field */}
                        <div className="space-y-2">
                          <Label htmlFor="userid" className="flex items-center text-sm font-medium">
                            <Key className="w-4 h-4 mr-2 text-muted-foreground" />
                            User ID
                          </Label>
                          <Input
                            id="userid"
                            value={user?.id || 'Not available'}
                            readOnly
                            className="bg-muted/50 cursor-not-allowed font-mono text-sm"
                          />
                        </div>
                        
                        {/* Email Field */}
                        <div className="space-y-2">
                          <Label htmlFor="email" className="flex items-center text-sm font-medium">
                            <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={user?.email || 'Not available'}
                            readOnly
                            className="bg-muted/50 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Profile Information */}
                  <Card className="w-full shadow-lg border border-border/50 hover:border-border/80 transition-all duration-300">
                    <CardHeader className="border-b bg-muted/20 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold text-foreground/90">Profile Information</h3>
                          <CardDescription>
                            Update your personal details and public profile
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid gap-1 mb-4">
                        <div className="flex items-center space-x-4 p-4 rounded-lg bg-muted/30">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{user?.name || 'User'}</p>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <UpdateProfileForm />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                  {/* Security Section */}
                  {!user?.isOAuth && ( // Change to check if isOAuth is false or undefined
                    <Card className="w-full shadow-lg border border-border/50 hover:border-border/80 transition-all duration-300">
                      <CardHeader className="border-b bg-muted/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-foreground/90">Security Settings</h3>
                            <CardDescription>
                              Manage your password and security preferences
                            </CardDescription>
                          </div>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 space-y-6">
                        <div className="grid gap-1 mb-4">
                          <div className="flex items-center space-x-4 p-4 rounded-lg bg-muted/30">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Password Protection</p>
                              <p className="text-sm text-muted-foreground">Secure your account with a strong password</p>
                            </div>
                          </div>
                        </div>
                        <UpdatePasswordForm />
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </main>

            <div className="mt-auto border-t border-border/40 bg-background/50 backdrop-blur-sm">
              <Footer className="container mx-auto px-4 py-6" />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}