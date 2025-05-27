import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/posts/post-card";
import { HomeClient } from "@/components/home/home-client";

export default async function Home() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    let posts = [];

    if (userId) {
      // Get followed authors' posts
      const followedAuthors = await prisma.follow.findMany({
        where: {
          followerId: userId,
        },
        select: {
          followingId: true,
        },
      });

      const followedAuthorIds = followedAuthors.map((f) => f.followingId);

      // If user has followed authors, get their posts
      if (followedAuthorIds.length > 0) {
        posts = await prisma.post.findMany({
          where: {
            authorId: {
              in: followedAuthorIds,
            },
            status: "PUBLISHED",
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
            feedback: true,
          },
          orderBy: {
            publishedAt: "desc",
          },
        });
      }
    }

    // If no followed posts or not logged in, get all recent posts
    if (posts.length === 0) {
      posts = await prisma.post.findMany({
        where: {
          status: "PUBLISHED",
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
          feedback: true,
        },
        orderBy: {
          publishedAt: "desc",
        },
      });
    }

    return <HomeClient posts={posts} />;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return <HomeClient posts={[]} />;
  }
}