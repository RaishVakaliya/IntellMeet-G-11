import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, Mail, Bell, Shield, CreditCard, Globe, Save, Download, 
  Loader2, Smartphone, Volume2, Moon, Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    meetingReminders: true,
  });

  const handleNotificationToggle = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof notifications]
    }));
    toast.success(`Notifications ${key} updated`);
  };

  const handleDownloadData = () => {
    toast.info('Data export started (stub)');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-lg mt-1">Manage your preferences and account</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-slate-50 to-slate-100 border-0 rounded-2xl p-1 shadow-lg">
          <TabsTrigger value="account" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl">
            <User className="mr-2 h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl">
            <Shield className="mr-2 h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6 space-y-6">
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-lg font-semibold">Language</Label>
                    <p className="text-sm text-muted-foreground">Interface language</p>
                  </div>
                  <Select value="en" onValueChange={() => {}}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-lg font-semibold">Time Zone</Label>
                    <p className="text-sm text-muted-foreground">Automatic detection</p>
                  </div>
                  <div className="text-sm font-mono bg-muted px-2 py-1 rounded-lg">
                    UTC+0
                  </div>
                </div>
              </div>
              <Button className="w-full h-12 rounded-xl font-semibold">
                <Save className="mr-2 h-4 w-4" />
                Save Account Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-lg font-semibold">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Meeting invites, updates, reports</p>
                  </div>
                  <Switch 
                    checked={notifications.email} 
                    onCheckedChange={() => handleNotificationToggle('email')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-lg font-semibold">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Browser notifications</p>
                  </div>
                  <Switch 
                    checked={notifications.push} 
                    onCheckedChange={() => handleNotificationToggle('push')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-lg font-semibold">Meeting Reminders</Label>
                    <p className="text-sm text-muted-foreground">5 min before start</p>
                  </div>
                  <Switch 
                    checked={notifications.meetingReminders} 
                    onCheckedChange={() => handleNotificationToggle('meetingReminders')}
                  />
                </div>
              </div>
              <Separator />
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 h-12 rounded-xl">
                  <Save className="mr-2 h-4 w-4" />
                  Save Notifications
                </Button>
                <Button variant="outline" className="h-12 px-8 rounded-xl">
                  Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-6 space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="font-semibold flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Data Sharing
                  </Label>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                      <span>AI Meeting Summaries</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                      <span>Analytics</span>
                      <Switch />
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="font-semibold flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Data
                  </Label>
                  <Button onClick={handleDownloadData} className="mt-3 w-full h-12 rounded-xl">
                    <Download className="mr-2 h-4 w-4" />
                    Download Your Data
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    JSON export (24h delivery)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6 space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing & Plan
              </CardTitle>
              <CardDescription>Pro Plan - $29/month (annual)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-24 h-24 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-12 w-12 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Pro Plan Active</h3>
                <p className="text-lg mb-6">Unlimited everything ✓</p>
                <div className="space-y-1 text-sm">
                  <div>Billed annually • Next: Mar 15, 2025</div>
                  <div className="font-mono">**** **** **** 1234</div>
                </div>
              </div>
              <Separator />
              <div className="grid md:grid-cols-2 gap-4 pt-6">
                <Button variant="outline" className="h-14 rounded-xl">
                  Update Payment Method
                </Button>
                <Button className="h-14 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
