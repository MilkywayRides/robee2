// File: app/(protected)/dashboard/projects/page.tsx
import { Metadata } from "next"
import { getCurrentRole } from "@/lib/authentication"
import { redirect } from "next/navigation"
import { UserRole } from "@prisma/client"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { RoleGate } from '@/components/auth/role-gate'
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    DollarSign,
    ShoppingCart,
    TrendingUp,
    Users,
    Package,
    Activity,
    Plus,
    Truck,
    Search,
    Grid,
    BarChart3,
    Calendar,
    Bell,
    Settings,
    ArrowUpRight,
    Clock,
    Tag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

export const metadata: Metadata = {
    title: "R00Bee. | Ecommerce Dashboard",
    description: "Manage your ecommerce projects and inventory in one centralized hub",
}

export default async function ProjectsPage() {
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
                    <main className="container mx-auto px-4 py-8 max-w-7xl">
                        <div className="flex flex-col gap-8">
                            {/* Dashboard Header */}
                            <div className="relative rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 overflow-hidden shadow-lg">
                                <div className="absolute inset-0 bg-grid-primary/5 [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div>
                                            <div className="flex items-center gap-4">
                                                <div className="rounded-full bg-primary p-3 text-primary-foreground shadow-md">
                                                    <ShoppingCart className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h1 className="text-3xl font-bold tracking-tight">Ecommerce Hub</h1>
                                                    <p className="text-muted-foreground mt-1 max-w-2xl">
                                                        Welcome back! Your store performance is up 12.5% this week.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input className="pl-9 rounded-full bg-background/80 backdrop-blur-sm border-none shadow-md" placeholder="Search products, orders..." />
                                            </div>
                                            <Button className="rounded-full shadow-md font-medium">
                                                <Plus className="h-4 w-4 mr-2" />
                                                New Product
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Top Stats Row */}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <Card className="overflow-hidden border-none shadow-lg rounded-xl bg-white dark:bg-gray-800">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Revenue
                                        </CardTitle>
                                        <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2">
                                            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">$24,456.78</div>
                                        <div className="flex items-center mt-2">
                                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 border-none flex items-center h-6 px-2 font-medium">
                                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                                15.3%
                                            </Badge>
                                            <span className="text-xs text-muted-foreground ml-2">vs. last month</span>
                                        </div>
                                        <div className="mt-4">
                                            <Progress value={84} className="h-1.5 bg-green-100 dark:bg-green-900/30" indicatorClassName="bg-green-600 dark:bg-green-500" />
                                            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                                                <span>Target: $29,000</span>
                                                <span>84% achieved</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="overflow-hidden border-none shadow-lg rounded-xl bg-white dark:bg-gray-800">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            New Orders
                                        </CardTitle>
                                        <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2">
                                            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">573</div>
                                        <div className="flex items-center mt-2">
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 border-none flex items-center h-6 px-2 font-medium">
                                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                                6.2%
                                            </Badge>
                                            <span className="text-xs text-muted-foreground ml-2">vs. last month</span>
                                        </div>
                                        <div className="mt-4">
                                            <Progress value={65} className="h-1.5 bg-blue-100 dark:bg-blue-900/30" indicatorClassName="bg-blue-600 dark:bg-blue-500" />
                                            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                                                <span>Processing: 32</span>
                                                <span>Completed: 541</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="overflow-hidden border-none shadow-lg rounded-xl bg-white dark:bg-gray-800">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Active Customers
                                        </CardTitle>
                                        <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2">
                                            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">3,842</div>
                                        <div className="flex items-center mt-2">
                                            <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400 border-none flex items-center h-6 px-2 font-medium">
                                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                                12.7%
                                            </Badge>
                                            <span className="text-xs text-muted-foreground ml-2">new subscribers</span>
                                        </div>
                                        <div className="mt-4">
                                            <div className="flex -space-x-2 overflow-hidden">
                                                <Avatar className="border-2 border-background w-8 h-8">
                                                    <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">JD</AvatarFallback>
                                                </Avatar>
                                                <Avatar className="border-2 border-background w-8 h-8">
                                                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">AM</AvatarFallback>
                                                </Avatar>
                                                <Avatar className="border-2 border-background w-8 h-8">
                                                    <AvatarFallback className="bg-green-100 text-green-600 text-xs">SL</AvatarFallback>
                                                </Avatar>
                                                <Avatar className="border-2 border-background w-8 h-8">
                                                    <AvatarFallback className="bg-amber-100 text-amber-600 text-xs">+3.8k</AvatarFallback>
                                                </Avatar>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="overflow-hidden border-none shadow-lg rounded-xl bg-white dark:bg-gray-800">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Conversion Rate
                                        </CardTitle>
                                        <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-2">
                                            <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">3.6%</div>
                                        <div className="flex items-center mt-2">
                                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 border-none flex items-center h-6 px-2 font-medium">
                                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                                0.8%
                                            </Badge>
                                            <span className="text-xs text-muted-foreground ml-2">vs. last month</span>
                                        </div>
                                        <div className="mt-4">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="flex items-center text-muted-foreground">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    Avg. time: 3m 12s
                                                </span>
                                                <span className="flex items-center text-muted-foreground">
                                                    <Tag className="h-3 w-3 mr-1" />
                                                    Bounce: 21.5%
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Quick Actions Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Button variant="outline" className="h-24 rounded-xl border-dashed flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200">
                                    <div className="rounded-full bg-primary/10 p-2">
                                        <Plus className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium">Add Product</span>
                                </Button>
                                <Button variant="outline" className="h-24 rounded-xl border-dashed flex flex-col items-center justify-center gap-2 hover:bg-blue-500/5 hover:border-blue-500/30 transition-all duration-200">
                                    <div className="rounded-full bg-blue-500/10 p-2">
                                        <Truck className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-medium">Process Orders</span>
                                </Button>
                                <Button variant="outline" className="h-24 rounded-xl border-dashed flex flex-col items-center justify-center gap-2 hover:bg-purple-500/5 hover:border-purple-500/30 transition-all duration-200">
                                    <div className="rounded-full bg-purple-500/10 p-2">
                                        <BarChart3 className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <span className="text-sm font-medium">Analytics</span>
                                </Button>
                                <Button variant="outline" className="h-24 rounded-xl border-dashed flex flex-col items-center justify-center gap-2 hover:bg-amber-500/5 hover:border-amber-500/30 transition-all duration-200">
                                    <div className="rounded-full bg-amber-500/10 p-2">
                                        <Settings className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <span className="text-sm font-medium">Settings</span>
                                </Button>
                            </div>

                            {/* Tabs Section - Revamped */}
                            <Tabs defaultValue="products" className="w-full">
                                <div className="flex items-center justify-between mb-4">
                                    <TabsList className="relative bg-transparent space-x-2 p-0 h-auto">
                                        <TabsTrigger value="products" className="rounded-lg px-5 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
                                            Products
                                        </TabsTrigger>
                                        <TabsTrigger value="orders" className="rounded-lg px-5 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
                                            Orders
                                        </TabsTrigger>
                                        <TabsTrigger value="customers" className="rounded-lg px-5 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
                                            Customers
                                        </TabsTrigger>
                                    </TabsList>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="rounded-lg">
                                            <Grid className="h-4 w-4 mr-2" />
                                            View
                                        </Button>
                                        <Button size="sm" variant="outline" className="rounded-lg">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Date
                                        </Button>
                                    </div>
                                </div>

                                <TabsContent value="products" className="mt-2 space-y-6">
                                    <Card className="border-none rounded-xl shadow-lg overflow-hidden">
                                        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <CardTitle className="flex items-center text-xl">
                                                        <Package className="h-5 w-5 mr-2 text-primary" />
                                                        Product Management
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Manage your product catalog, inventory, and pricing.
                                                    </CardDescription>
                                                </div>
                                                <Button className="rounded-lg">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    New Product
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="grid gap-6 md:grid-cols-3">
                                                {/* Featured Products */}
                                                <Card className="col-span-2 bg-white dark:bg-gray-800 border-none shadow-md rounded-xl overflow-hidden">
                                                    <CardHeader className="pb-2 border-b">
                                                        <CardTitle className="text-lg">Featured Products</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-0">
                                                        <div className="divide-y">
                                                            {/* Product Item */}
                                                            <div className="flex items-center p-4 hover:bg-secondary/20 transition-colors">
                                                                <div className="h-12 w-12 rounded-lg bg-secondary/30 flex items-center justify-center mr-4 flex-shrink-0">
                                                                    <Package className="h-6 w-6 text-primary" />
                                                                </div>
                                                                <div className="flex-grow">
                                                                    <div className="flex items-center justify-between">
                                                                        <h3 className="font-medium">Premium Headphones</h3>
                                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                            In Stock
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground mt-1">
                                                                        SKU: HD-3500-BK • 56 units
                                                                    </div>
                                                                </div>
                                                                <div className="text-right ml-4">
                                                                    <div className="font-medium">$149.99</div>
                                                                    <div className="text-sm text-muted-foreground">Sold: 385</div>
                                                                </div>
                                                            </div>

                                                            {/* Product Item */}
                                                            <div className="flex items-center p-4 hover:bg-secondary/20 transition-colors">
                                                                <div className="h-12 w-12 rounded-lg bg-secondary/30 flex items-center justify-center mr-4 flex-shrink-0">
                                                                    <Package className="h-6 w-6 text-primary" />
                                                                </div>
                                                                <div className="flex-grow">
                                                                    <div className="flex items-center justify-between">
                                                                        <h3 className="font-medium">Wireless Earbuds</h3>
                                                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                                                            Low Stock
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground mt-1">
                                                                        SKU: WE-200-WT • 8 units
                                                                    </div>
                                                                </div>
                                                                <div className="text-right ml-4">
                                                                    <div className="font-medium">$89.99</div>
                                                                    <div className="text-sm text-muted-foreground">Sold: 642</div>
                                                                </div>
                                                            </div>

                                                            {/* Product Item */}
                                                            <div className="flex items-center p-4 hover:bg-secondary/20 transition-colors">
                                                                <div className="h-12 w-12 rounded-lg bg-secondary/30 flex items-center justify-center mr-4 flex-shrink-0">
                                                                    <Package className="h-6 w-6 text-primary" />
                                                                </div>
                                                                <div className="flex-grow">
                                                                    <div className="flex items-center justify-between">
                                                                        <h3 className="font-medium">Smart Watch</h3>
                                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                            In Stock
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground mt-1">
                                                                        SKU: SW-100-BK • 124 units
                                                                    </div>
                                                                </div>
                                                                <div className="text-right ml-4">
                                                                    <div className="font-medium">$199.99</div>
                                                                    <div className="text-sm text-muted-foreground">Sold: 278</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                    <div className="p-4 bg-secondary/10 text-center">
                                                        <Button variant="link" size="sm" className="text-primary">
                                                            View All Products
                                                        </Button>
                                                    </div>
                                                </Card>

                                                {/* Quick Actions */}
                                                <Card className="bg-white dark:bg-gray-800 border-none shadow-md rounded-xl overflow-hidden">
                                                    <CardHeader className="pb-2 border-b">
                                                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-0">
                                                        <div className="divide-y">
                                                            <Button variant="ghost" className="w-full justify-start rounded-none h-auto p-4 hover:bg-secondary/20">
                                                                <div className="flex items-center">
                                                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                                                                        <Plus className="h-4 w-4 text-primary" />
                                                                    </div>
                                                                    <span>Add New Product</span>
                                                                </div>
                                                            </Button>
                                                            <Button variant="ghost" className="w-full justify-start rounded-none h-auto p-4 hover:bg-secondary/20">
                                                                <div className="flex items-center">
                                                                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center mr-3">
                                                                        <Activity className="h-4 w-4 text-blue-600" />
                                                                    </div>
                                                                    <span>Manage Inventory</span>
                                                                </div>
                                                            </Button>
                                                            <Button variant="ghost" className="w-full justify-start rounded-none h-auto p-4 hover:bg-secondary/20">
                                                                <div className="flex items-center">
                                                                    <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center mr-3">
                                                                        <BarChart3 className="h-4 w-4 text-purple-600" />
                                                                    </div>
                                                                    <span>Product Analytics</span>
                                                                </div>
                                                            </Button>
                                                            <Button variant="ghost" className="w-full justify-start rounded-none h-auto p-4 hover:bg-secondary/20">
                                                                <div className="flex items-center">
                                                                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center mr-3">
                                                                        <Tag className="h-4 w-4 text-amber-600" />
                                                                    </div>
                                                                    <span>Manage Categories</span>
                                                                </div>
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="orders" className="mt-2 space-y-6">
                                    <Card className="border-none rounded-xl shadow-lg overflow-hidden">
                                        <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <CardTitle className="flex items-center text-xl">
                                                        <Truck className="h-5 w-5 mr-2 text-blue-600" />
                                                        Order Management
                                                    </CardTitle>
                                                    <CardDescription>
                                                        View and manage customer orders, shipping, and returns.
                                                    </CardDescription>
                                                </div>
                                                <Button className="rounded-lg" variant="outline">
                                                    <Truck className="h-4 w-4 mr-2" />
                                                    Manage Shipments
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="rounded-xl border bg-white dark:bg-gray-800 overflow-hidden">
                                                <div className="p-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="font-semibold text-lg">Recent Orders</h3>
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                                                            View All
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {/* Order Item */}
                                                        <div className="p-4 rounded-lg border bg-secondary/10 hover:bg-secondary/20 transition-colors">
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="bg-blue-100 text-blue-700 rounded-full h-8 w-8 flex items-center justify-center">
                                                                        <Package className="h-4 w-4" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium">#ORD-5392</div>
                                                                        <div className="text-sm text-muted-foreground">April 8, 2025</div>
                                                                    </div>
                                                                </div>
                                                                <Badge className="bg-amber-100 text-amber-700 border-none">Processing</Badge>
                                                                <div className="text-right">
                                                                    <div className="font-medium">$243.88</div>
                                                                    <div className="text-sm text-muted-foreground">4 items</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Order Item */}
                                                        <div className="p-4 rounded-lg border bg-secondary/10 hover:bg-secondary/20 transition-colors">
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="bg-blue-100 text-blue-700 rounded-full h-8 w-8 flex items-center justify-center">
                                                                        <Package className="h-4 w-4" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium">#ORD-5391</div>
                                                                        <div className="text-sm text-muted-foreground">April 8, 2025</div>
                                                                    </div>
                                                                </div>
                                                                <Badge className="bg-green-100 text-green-700 border-none">Shipped</Badge>
                                                                <div className="text-right">
                                                                    <div className="font-medium">$129.99</div>
                                                                    <div className="text-sm text-muted-foreground">1 item</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Order Item */}
                                                        <div className="p-4 rounded-lg border bg-secondary/10 hover:bg-secondary/20 transition-colors">
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="bg-blue-100 text-blue-700 rounded-full h-8 w-8 flex items-center justify-center">
                                                                        <Package className="h-4 w-4" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium">#ORD-5390</div>
                                                                        <div className="text-sm text-muted-foreground">April 7, 2025</div>
                                                                    </div>
                                                                </div>
                                                                <Badge className="bg-purple-100 text-purple-700 border-none">Delivered</Badge>
                                                                <div className="text-right">
                                                                    <div className="font-medium">$349.95</div>
                                                                    <div className="text-sm text-muted-foreground">2 items</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="customers" className="mt-2 space-y-6">
                                    <Card className="border-none rounded-xl shadow-lg overflow-hidden">
                                        <CardHeader className="bg-gradient-to-r from-purple-500/5 to-transparent">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <CardTitle className="flex items-center text-xl">
                                                        <Users className="h-5 w-5 mr-2 text-purple-600" />
                                                        Customer Management
                                                    </CardTitle>
                                                    <CardDescription>
                                                        View customer profiles, activity, and engagement metrics.
                                                    </CardDescription>
                                                </div>
                                                <Button className="rounded-lg" variant="outline">
                                                    <Users className="h-4 w-4 mr-2" />
                                                    Filter Customers
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="grid gap-6 md:grid-cols-3">
                                                <Card className="col-span-2 bg-white dark:bg-gray-800 border-none shadow-md rounded-xl overflow-hidden">
                                                    <CardHeader className="pb-2 border-b">
                                                        <CardTitle className="text-lg">Top Customers</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-0">
                                                        <div className="divide-y">
                                                            {/* Customer Item */}
                                                            <div className="flex items-center p-4 hover:bg-secondary/20 transition-colors">
                                                                <Avatar className="h-10 w-10 mr-4">
                                                                    <AvatarFallback className="bg-purple-100 text-purple-700">JD</AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-grow">
                                                                    <div className="flex items-center justify-between">
                                                                        <h3 className="font-medium">Jessica Dawson</h3>
                                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                            VIP
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground mt-1">
                                                                        Joined: Jan 2024 • Orders: 34
                                                                    </div>
                                                                </div>
                                                                <div className="text-right ml-4">
                                                                    <div className="font-medium">$3,456.99</div>
                                                                    <div className="text-sm text-muted-foreground">Lifetime Value</div>
                                                                </div>
                                                            </div>

                                                            {/* Customer Item */}
                                                            <div className="flex items-center p-4 hover:bg-secondary/20 transition-colors">
                                                                <Avatar className="h-10 w-10 mr-4">
                                                                    <AvatarFallback className="bg-blue-100 text-blue-700">MR</AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-grow">
                                                                    <div className="flex items-center justify-between">
                                                                        <h3 className="font-medium">Michael Rodriguez</h3>
                                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                                            Regular
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground mt-1">
                                                                        Joined: Mar 2024 • Orders: 12
                                                                    </div>
                                                                </div>
                                                                <div className="text-right ml-4">
                                                                    <div className="font-medium">$842.50</div>
                                                                    <div className="text-sm text-muted-foreground">Lifetime Value</div>
                                                                </div>
                                                            </div>

                                                            {/* Customer Item */}
                                                            <div className="flex items-center p-4 hover:bg-secondary/20 transition-colors">
                                                                <Avatar className="h-10 w-10 mr-4">
                                                                    <AvatarFallback className="bg-amber-100 text-amber-700">SP</AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-grow">
                                                                    <div className="flex items-center justify-between">
                                                                        <h3 className="font-medium">Sara Peterson</h3>
                                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                            VIP
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground mt-1">
                                                                        Joined: Nov 2023 • Orders: 28
                                                                    </div>
                                                                </div>
                                                                <div className="text-right ml-4">
                                                                    <div className="font-medium">$2,937.45</div>
                                                                    <div className="text-sm text-muted-foreground">Lifetime Value</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                    <div className="p-4 bg-secondary/10 text-center">
                                                        <Button variant="link" size="sm" className="text-primary">
                                                            View All Customers
                                                        </Button>
                                                    </div>
                                                </Card>

                                                {/* Customer Analytics Card */}
                                                <Card className="bg-white dark:bg-gray-800 border-none shadow-md rounded-xl overflow-hidden">
                                                    <CardHeader className="pb-2 border-b">
                                                        <CardTitle className="text-lg">Customer Analytics</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-6 space-y-6">
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm font-medium">Retention Rate</span>
                                                                <span className="text-sm font-medium">76%</span>
                                                            </div>
                                                            <Progress value={76} className="h-2" />
                                                        </div>

                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm font-medium">Engagement Score</span>
                                                                <span className="text-sm font-medium">82%</span>
                                                            </div>
                                                            <Progress value={82} className="h-2" />
                                                        </div>

                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm font-medium">Satisfaction Rate</span>
                                                                <span className="text-sm font-medium">93%</span>
                                                            </div>
                                                            <Progress value={93} className="h-2" />
                                                        </div>

                                                        <div className="pt-4 border-t">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="text-center p-3 rounded-lg bg-secondary/20">
                                                                    <div className="text-2xl font-bold">78%</div>
                                                                    <div className="text-xs text-muted-foreground">Return Rate</div>
                                                                </div>
                                                                <div className="text-center p-3 rounded-lg bg-secondary/20">
                                                                    <div className="text-2xl font-bold">24%</div>
                                                                    <div className="text-xs text-muted-foreground">New Users</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>

                            {/* Activity Feed */}
                            <div className="grid gap-6 md:grid-cols-3">
                                <Card className="md:col-span-2 border-none rounded-xl shadow-lg overflow-hidden">
                                    <CardHeader className="flex-row justify-between items-center border-b pb-4">
                                        <CardTitle className="flex items-center text-lg">
                                            <Activity className="h-5 w-5 mr-2 text-primary" />
                                            Recent Activity
                                        </CardTitle>
                                        <Button variant="outline" size="sm" className="h-8 rounded-lg">
                                            View All
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y">
                                            <div className="p-4 flex">
                                                <div className="mr-4 relative">
                                                    <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                                                        <DollarSign className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                                                </div>
                                                <div>
                                                    <p className="font-medium">New sale completed</p>
                                                    <p className="text-sm text-muted-foreground">Order #5392 for $243.88 was completed</p>
                                                    <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
                                                </div>
                                            </div>

                                            <div className="p-4 flex">
                                                <div className="mr-4 relative">
                                                    <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center">
                                                        <Package className="h-5 w-5 text-amber-600" />
                                                    </div>
                                                    <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-amber-500 border-2 border-background"></span>
                                                </div>
                                                <div>
                                                    <p className="font-medium">Inventory update</p>
                                                    <p className="text-sm text-muted-foreground">Wireless Earbuds stock is now low (8 units left)</p>
                                                    <p className="text-xs text-muted-foreground mt-1">45 minutes ago</p>
                                                </div>
                                            </div>

                                            <div className="p-4 flex">
                                                <div className="mr-4 relative">
                                                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <Truck className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-blue-500 border-2 border-background"></span>
                                                </div>
                                                <div>
                                                    <p className="font-medium">Order shipped</p>
                                                    <p className="text-sm text-muted-foreground">Order #5391 has been shipped to Sara Peterson</p>
                                                    <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                                                </div>
                                            </div>

                                            <div className="p-4 flex">
                                                <div className="mr-4 relative">
                                                    <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center">
                                                        <Users className="h-5 w-5 text-purple-600" />
                                                    </div>
                                                    <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-purple-500 border-2 border-background"></span>
                                                </div>
                                                <div>
                                                    <p className="font-medium">New customer registered</p>
                                                    <p className="text-sm text-muted-foreground">Michael Rodriguez created an account</p>
                                                    <p className="text-xs text-muted-foreground mt-1">3 hours ago</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Notifications Card */}
                                <Card className="border-none rounded-xl shadow-lg overflow-hidden">
                                    <CardHeader className="flex-row justify-between items-center border-b pb-4">
                                        <CardTitle className="flex items-center text-lg">
                                            <Bell className="h-5 w-5 mr-2 text-primary" />
                                            Notifications
                                        </CardTitle>
                                        <Button variant="ghost" size="sm" className="h-8 text-xs rounded-lg">
                                            Mark all as read
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y">
                                            <div className="p-4 hover:bg-secondary/10 transition-colors">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-medium text-sm">Inventory Alert</h4>
                                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                        Urgent
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">Wireless Earbuds stock is running low.</p>
                                                <p className="text-xs text-muted-foreground mt-2">45 minutes ago</p>
                                            </div>

                                            <div className="p-4 hover:bg-secondary/10 transition-colors">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-medium text-sm">New Order</h4>
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                        New
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">Order #5392 needs processing.</p>
                                                <p className="text-xs text-muted-foreground mt-2">2 minutes ago</p>
                                            </div>

                                            <div className="p-4 hover:bg-secondary/10 transition-colors">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-medium text-sm">System Update</h4>
                                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                                        Info
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">System maintenance scheduled for tonight.</p>
                                                <p className="text-xs text-muted-foreground mt-2">2 hours ago</p>
                                            </div>

                                            <div className="p-4 hover:bg-secondary/10 transition-colors">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-medium text-sm">Customer Review</h4>
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                        5 Stars
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">Jessica Dawson left a new 5-star review.</p>
                                                <p className="text-xs text-muted-foreground mt-2">Yesterday</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <div className="p-4 bg-secondary/10 text-center">
                                        <Button variant="link" size="sm" className="text-primary">
                                            View All Notifications
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </main>
                    <Footer />
                </SidebarInset>
            </SidebarProvider>
        </RoleGate>
    )
}