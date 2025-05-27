import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CreatePostForm } from "@/components/posts/create/create-post-form";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";

export default async function CreatePostPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-6">
          <CreatePostForm />
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}