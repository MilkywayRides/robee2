// File: app/(protected)/dashboard/advertise/page.tsx
import { Metadata } from "next"
import { getCurrentRole } from "@/lib/authentication"
import { redirect } from "next/navigation"
import { UserRole } from "@prisma/client"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { RoleGate } from '@/components/auth/role-gate'
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Plus, Filter, Download, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "R00Bee. | Ad Management Dashboard",
  description: "Manage your advertising campaigns and view performance metrics",
}

// Mock data for stats
const mockStats = {
  totalAds: 24,
  activeAds: 18,
  impressions: 45892,
  clicks: 1243,
  conversionRate: 2.7
}

// Mock data for ads
const mockAds = [
  {
    id: "ad-001",
    title: "Summer Collection Promotion",
    description: "Promoting the new summer collection with 20% discount",
    status: "active",
    platform: "Facebook",
    impressions: 12543,
    clicks: 342,
    budget: 500,
    spent: 324.56,
    startDate: "2025-03-15",
    endDate: "2025-04-30",
    image: "https://ui.shadcn.com/placeholder.svg"
  },
  {
    id: "ad-002",
    title: "Flash Sale Announcement",
    description: "24-hour flash sale with up to 50% off on selected items",
    status: "active",
    platform: "Instagram",
    impressions: 8765,
    clicks: 421,
    budget: 300,
    spent: 187.23,
    startDate: "2025-03-20",
    endDate: "2025-03-21",
    image: "https://ui.shadcn.com/placeholder.svg"
  },
  {
    id: "ad-003",
    title: "New Product Launch",
    description: "Introducing our revolutionary product to the market",
    status: "draft",
    platform: "Google",
    impressions: 0,
    clicks: 0,
    budget: 800,
    spent: 0,
    startDate: "",
    endDate: "",
    image: "https://ui.shadcn.com/placeholder.svg"
  },
  {
    id: "ad-004",
    title: "Loyalty Program",
    description: "Join our loyalty program and get exclusive benefits",
    status: "paused",
    platform: "Facebook, Instagram",
    impressions: 5421,
    clicks: 176,
    budget: 400,
    spent: 215.78,
    startDate: "2025-02-10",
    endDate: "2025-05-10",
    image: "https://ui.shadcn.com/placeholder.svg"
  }
]

export default async function AdsManagementPage() {
  const role = await getCurrentRole()

  if (role !== UserRole.ADMIN) {
    redirect("/")
  }

  return (
    <RoleGate allowedRole={UserRole.ADMIN}>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <main className="container px-4 py-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Ad Management Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage and analyze all advertising campaigns</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Ad
                </Button>
              </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground">Total Ads</h3>
                <p className="text-2xl font-bold mt-2">{mockStats.totalAds}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {mockStats.activeAds} currently active
                </p>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground">Impressions</h3>
                <p className="text-2xl font-bold mt-2">{mockStats.impressions.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Last 30 days
                </p>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground">Clicks</h3>
                <p className="text-2xl font-bold mt-2">{mockStats.clicks.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Last 30 days
                </p>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground">Conversion Rate</h3>
                <p className="text-2xl font-bold mt-2">{mockStats.conversionRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  +0.4% from last month
                </p>
              </Card>
            </div>

            {/* Tabs and Filters */}
            <Tabs defaultValue="all" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Ads</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="paused">Paused</TabsTrigger>
                  <TabsTrigger value="draft">Drafts</TabsTrigger>
                  <TabsTrigger value="archived">Archived</TabsTrigger>
                </TabsList>
                
                {/* Inline filters instead of importing a component */}
                <div className="flex items-center gap-2">
                  <div className="relative w-60">
                    <input 
                      type="text" 
                      placeholder="Search ads..." 
                      className="w-full px-3 py-2 pl-8 border rounded-md" 
                    />
                  </div>
                  
                  <select className="px-3 py-2 border rounded-md">
                    <option value="all">All campaigns</option>
                    <option value="brand">Brand awareness</option>
                    <option value="conversion">Conversion</option>
                    <option value="seasonal">Seasonal</option>
                  </select>
                  
                  <select className="px-3 py-2 border rounded-md">
                    <option value="all">All platforms</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="google">Google</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                  
                  <Button variant="outline" className="flex gap-2">
                    Date range
                  </Button>
                </div>
              </div>

              {/* Ad listings */}
              <TabsContent value="all" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockAds.map(ad => (
                    <Card key={ad.id} className="overflow-hidden">
                      <div className="relative h-40 bg-muted">
                        <img src={ad.image} alt={ad.title} className="object-cover w-full h-full" />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Badge variant="secondary">{ad.platform}</Badge>
                          <Badge className={
                            ad.status === "active" ? "bg-green-500" : 
                            ad.status === "paused" ? "bg-amber-500" : 
                            ad.status === "draft" ? "bg-slate-500" : "bg-gray-500"
                          }>{ad.status}</Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg">{ad.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{ad.description}</p>
                        
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Impressions</p>
                            <p className="font-medium">{ad.impressions.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Clicks</p>
                            <p className="font-medium">{ad.clicks.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Budget</p>
                            <p className="font-medium">${ad.budget.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Spent</p>
                            <p className="font-medium">${ad.spent.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        {ad.startDate && (
                          <div className="mt-3">
                            <p className="text-xs text-muted-foreground">
                              {ad.status === "draft" ? "Not scheduled" : `${new Date(ad.startDate).toLocaleDateString()} - ${new Date(ad.endDate).toLocaleDateString()}`}
                            </p>
                          </div>
                        )}
                        
                        <div className="mt-4 flex justify-between">
                          <Button variant="outline" size="sm">View</Button>
                          
                          <div className="flex gap-2">
                            {ad.status === "active" ? (
                              <Button variant="outline" size="sm">Pause</Button>
                            ) : ad.status === "paused" ? (
                              <Button variant="outline" size="sm">Resume</Button>
                            ) : null}
                            
                            <Button variant="ghost" size="sm">•••</Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="active" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockAds.filter(ad => ad.status === "active").map(ad => (
                    // Similar card structure as above
                    <Card key={ad.id} className="overflow-hidden">
                      {/* Card content identical to above */}
                      <div className="relative h-40 bg-muted">
                        <img src={ad.image} alt={ad.title} className="object-cover w-full h-full" />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Badge variant="secondary">{ad.platform}</Badge>
                          <Badge className="bg-green-500">{ad.status}</Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg">{ad.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{ad.description}</p>
                        
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Impressions</p>
                            <p className="font-medium">{ad.impressions.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Clicks</p>
                            <p className="font-medium">{ad.clicks.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Budget</p>
                            <p className="font-medium">${ad.budget.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Spent</p>
                            <p className="font-medium">${ad.spent.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        {ad.startDate && (
                          <div className="mt-3">
                            <p className="text-xs text-muted-foreground">
                              {`${new Date(ad.startDate).toLocaleDateString()} - ${new Date(ad.endDate).toLocaleDateString()}`}
                            </p>
                          </div>
                        )}
                        
                        <div className="mt-4 flex justify-between">
                          <Button variant="outline" size="sm">View</Button>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Pause</Button>
                            <Button variant="ghost" size="sm">•••</Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              {/* Other tab contents would follow the same pattern */}
              <TabsContent value="paused" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockAds.filter(ad => ad.status === "paused").map(ad => (
                    // Similar card structure
                    <Card key={ad.id} className="overflow-hidden">
                      {/* Same card content structure */}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg">{ad.title}</h3>
                        {/* Other card content */}
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="draft" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockAds.filter(ad => ad.status === "draft").map(ad => (
                    // Card structure
                    <Card key={ad.id} className="overflow-hidden">
                      {/* Card content */}
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="archived" className="space-y-4">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Trash2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">No archived ads</h3>
                  <p className="text-muted-foreground max-w-md mt-1">
                    You don't have any archived ads at the moment.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </main>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </RoleGate>
  )
}