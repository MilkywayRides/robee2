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

export default async function EditPostPage({
  params
}: {
  params: { postId: string }
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  try {
    // Fetch the post with its tags
    const post = await db.post.findUnique({
      where: {
        id: params.postId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        tags: true,
      },
    });

    if (!post) {
      redirect("/dashboard/posts");
    }

    const formattedPost = {
      ...post,
      status: post.status as PostStatus,
      scheduledAt: post.scheduledAt?.toISOString() || null,
      publishedAt: post.publishedAt?.toISOString() || null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };

    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <main className="flex-1 container mx-auto px-4 py-6">
            <EditPostForm 
              post={formattedPost}
              currentUser="MilkywayRides"
              currentTime="2025-04-08 09:07:35"
            />
          </main>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    );
  } catch (error) {
    console.error("[EDIT_POST_PAGE_ERROR]", error);
    redirect("/dashboard/posts");
  }
}