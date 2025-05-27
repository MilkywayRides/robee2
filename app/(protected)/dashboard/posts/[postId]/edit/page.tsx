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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Post</h1>
      <EditPostForm post={post} />
    </div>
  );
}