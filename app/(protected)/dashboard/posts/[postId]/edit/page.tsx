import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { EditPostForm } from "@/components/posts/edit/edit-post-form";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { db } from "@/lib/db";
import { PostStatus } from "@prisma/client";
import { notFound } from "next/navigation";

interface EditPostPageProps {
  params: { postId: string };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const post = await db.post.findUnique({
    where: {
      id: params.postId,
      authorId: session.user.id,
    },
    include: {
      tags: true,
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold">Edit Post</h1>
                </div>
                <EditPostForm post={post} />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}