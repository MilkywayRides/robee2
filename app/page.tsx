import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { db } from "@/lib/db";
import { PostStatus, FeedbackType } from "@prisma/client";
import { format } from "date-fns";
import { Clock, User, Tag, ArrowRight, TrendingUp, BookOpen, Users, Flame, Star, ThumbsUp, MessageSquare, Eye, Brain, Cpu, Bot, Zap, Network, Lightbulb, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ViewCounter } from "@/components/posts/view-counter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  content: any;
  publishedAt: Date | null;
  views: number;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  tags: Array<{
    id: string;
    name: string;
  }>;
  feedback: Array<{
    id: string;
    type: FeedbackType;
    createdAt: Date;
    userId: string;
    postId: string;
  }>;
}

async function getFeaturedPosts(): Promise<Post[]> {
  const posts = await db.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
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
      views: 'desc',
    },
    take: 3,
  });

  return posts;
}

async function getLatestPosts(): Promise<Post[]> {
  const posts = await db.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
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
      publishedAt: 'desc',
    },
    take: 6,
  });

  return posts;
}

async function getTrendingTopics() {
  const tags = await db.tag.findMany({
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
    orderBy: {
      posts: {
        _count: 'desc',
      },
    },
    take: 10,
  });

  return tags;
}

async function getMostEngagedPosts(): Promise<Post[]> {
  const posts = await db.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
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
      feedback: {
        _count: 'desc',
      },
    },
    take: 4,
  });

  return posts;
}

async function getRecommendedPosts(userId: string | undefined): Promise<Post[]> {
  if (!userId) {
    return getLatestPosts();
  }

  // Get user's reading history and preferences
  const userInterests = await db.post.findMany({
    where: {
      feedback: {
        some: {
          userId: userId,
          type: FeedbackType.LIKE,
        },
      },
    },
    include: {
      tags: true,
    },
    take: 10,
  });

  // Extract tags from liked posts
  const userTags = userInterests.flatMap(post => post.tags.map(tag => tag.id));

  // Get recommended posts based on user's interests
  const recommendedPosts = await db.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
      tags: {
        some: {
          id: {
            in: userTags,
          },
        },
      },
      NOT: {
        feedback: {
          some: {
            userId: userId,
          },
        },
      },
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
    take: 4,
  });

  return recommendedPosts;
}

async function getCommunityStats() {
  try {
    const [
      totalPosts,
      activeWriters,
      totalViews,
      totalEngagement
    ] = await Promise.all([
      db.post.count({
        where: {
          status: PostStatus.PUBLISHED,
        },
      }),
      db.user.count({
        where: {
          posts: {
            some: {
              status: PostStatus.PUBLISHED,
            },
          },
        },
      }),
      db.post.aggregate({
        where: {
          status: PostStatus.PUBLISHED,
        },
        _sum: {
          views: true,
        },
      }),
      db.postFeedback.count({
        where: {
          post: {
            status: PostStatus.PUBLISHED,
          },
        },
      }),
    ]);

    return {
      totalPosts,
      activeWriters,
      totalViews: totalViews._sum.views || 0,
      totalEngagement,
    };
  } catch (error) {
    console.error("Error fetching community stats:", error);
    return {
      totalPosts: 0,
      activeWriters: 0,
      totalViews: 0,
      totalEngagement: 0,
    };
  }
}

export default async function Home() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const [
      featuredPosts,
      latestPosts,
      trendingTopics,
      mostEngagedPosts,
      recommendedPosts,
      communityStats
    ] = await Promise.all([
      getFeaturedPosts(),
      getLatestPosts(),
      getTrendingTopics(),
      getMostEngagedPosts(),
      getRecommendedPosts(userId),
      getCommunityStats(),
    ]);

    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-muted/50 border-b">
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 to-background" />
          <div className="container relative mx-auto px-4 py-16 md:py-24">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Brain className="h-8 w-8 text-primary" />
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Discover AI Knowledge & Innovation
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Join our community of AI enthusiasts, researchers, and developers. Share insights, learn about cutting-edge AI technologies, and grow together in the age of artificial intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/posts">
                    <Bot className="h-4 w-4" />
                    Explore AI Posts
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link href="/following">
                    <Network className="h-4 w-4" />
                    Following Feed
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* AI Features Showcase */}
        <section className="py-12 bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">AI Knowledge Hub</h2>
              <p className="text-muted-foreground">Explore the latest in artificial intelligence and machine learning</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Machine Learning</CardTitle>
                  <CardDescription>
                    Deep dive into neural networks, algorithms, and ML applications
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button variant="ghost" className="gap-2 group-hover:gap-3 transition-all">
                    Explore ML Topics
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-purple-500/10 rounded-full w-fit">
                    <Cpu className="h-8 w-8 text-purple-500" />
                  </div>
                  <CardTitle>AI Development</CardTitle>
                  <CardDescription>
                    Tools, frameworks, and best practices for AI development
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button variant="ghost" className="gap-2 group-hover:gap-3 transition-all">
                    View Dev Resources
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-orange-500/10 rounded-full w-fit">
                    <Lightbulb className="h-8 w-8 text-orange-500" />
                  </div>
                  <CardTitle>AI Innovation</CardTitle>
                  <CardDescription>
                    Latest breakthroughs, research papers, and industry trends
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button variant="ghost" className="gap-2 group-hover:gap-3 transition-all">
                    Discover Innovations
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* AI Learning Path */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Zap className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold">AI Learning Journey</h2>
              </div>
              <p className="text-muted-foreground">Start your AI journey with curated learning paths</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-500">1</span>
                    </div>
                    <CardTitle className="text-lg">Foundations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">AI basics, terminology, and core concepts</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-green-500">2</span>
                    </div>
                    <CardTitle className="text-lg">Algorithms</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Machine learning algorithms and implementations</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-500">3</span>
                    </div>
                    <CardTitle className="text-lg">Deep Learning</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Neural networks and advanced architectures</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-orange-500">4</span>
                    </div>
                    <CardTitle className="text-lg">Applications</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Real-world AI applications and projects</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-8">
              {/* Featured Posts */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    <h2 className="text-2xl font-bold">Featured AI Posts</h2>
                  </div>
                  <Button asChild variant="ghost" className="gap-2">
                    <Link href="/posts">
                      View All
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredPosts.map((post) => {
                    const content = typeof post.content === 'string' ? post.content : JSON.stringify(post.content);
                    const wordCount = content.split(/\s+/).filter(Boolean).length;
                    const readingTime = Math.ceil(wordCount / 200);

                    return (
                      <Card key={post.id} className="group hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <User className="h-4 w-4" />
                            <span>{post.author?.name}</span>
                          </div>
                          <CardTitle className="group-hover:text-primary transition-colors">
                            <Link href={`/posts/${post.id}`}>{post.title}</Link>
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {post.excerpt}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{readingTime} min read</span>
                            </div>
                            <ViewCounter postId={post.id} initialViews={post.views} />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>

              {/* Latest Posts */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    <h2 className="text-2xl font-bold">Latest AI Insights</h2>
                  </div>
                  <Button asChild variant="ghost" className="gap-2">
                    <Link href="/posts">
                      View All
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {latestPosts.map((post) => {
                    const content = typeof post.content === 'string' ? post.content : JSON.stringify(post.content);
                    const wordCount = content.split(/\s+/).filter(Boolean).length;
                    const readingTime = Math.ceil(wordCount / 200);

                    return (
                      <Card key={post.id} className="group hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <User className="h-4 w-4" />
                            <span>{post.author?.name}</span>
                          </div>
                          <CardTitle className="group-hover:text-primary transition-colors">
                            <Link href={`/posts/${post.id}`}>{post.title}</Link>
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {post.excerpt}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{readingTime} min read</span>
                              </div>
                              <ViewCounter postId={post.id} initialViews={post.views} />
                            </div>
                            {post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag) => (
                                  <Badge key={tag.id} variant="secondary">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tag.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>

              {/* Most Engaged Posts */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <h2 className="text-2xl font-bold">Most Discussed AI Topics</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mostEngagedPosts.map((post) => {
                    const content = typeof post.content === 'string' ? post.content : JSON.stringify(post.content);
                    const wordCount = content.split(/\s+/).filter(Boolean).length;
                    const readingTime = Math.ceil(wordCount / 200);
                    const likes = post.feedback.filter(f => f.type === FeedbackType.LIKE).length;

                    return (
                      <Card key={post.id} className="group hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <User className="h-4 w-4" />
                            <span>{post.author?.name}</span>
                          </div>
                          <CardTitle className="group-hover:text-primary transition-colors">
                            <Link href={`/posts/${post.id}`}>{post.title}</Link>
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {post.excerpt}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{likes} likes</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{readingTime} min read</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              {/* AI Quick Stats */}
              <section>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      <CardTitle>AI Community Pulse</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">ML Posts This Week</span>
                        </div>
                        <Badge variant="secondary">42</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-500/5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">AI Researchers</span>
                        </div>
                        <Badge variant="secondary">158</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-500/5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">New Innovations</span>
                        </div>
                        <Badge variant="secondary">23</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Trending AI Topics */}
              <section>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Flame className="h-5 w-5" />
                      <CardTitle>Trending AI Topics</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {trendingTopics.map((tag) => (
                        <Badge key={tag.id} variant="secondary" className="px-3 py-1 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag.name}
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({tag._count.posts})
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Recommended Posts */}
              {userId && (
                <section>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        <CardTitle>AI Picks for You</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recommendedPosts.map((post) => (
                          <div key={post.id} className="flex gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex-1 min-w-0">
                              <Link 
                                href={`/posts/${post.id}`}
                                className="text-sm font-medium hover:text-primary transition-colors line-clamp-2"
                              >
                                {post.title}
                              </Link>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <User className="h-3 w-3" />
                                <span>{post.author?.name}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Community Stats */}
              <section>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <CardTitle>Community Stats</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">AI Posts</p>
                        <p className="text-2xl font-bold">{communityStats.totalPosts.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">AI Enthusiasts</p>
                        <p className="text-2xl font-bold">{communityStats.activeWriters.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Total Views</p>
                        <p className="text-2xl font-bold">{communityStats.totalViews.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Engagement</p>
                        <p className="text-2xl font-bold">{communityStats.totalEngagement.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching posts:", error);
    return null;
  }
}