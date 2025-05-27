import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, Eye, MoreVertical } from "lucide-react";
import { Post } from "@/types/post";

interface PostCardProps {
  post: Post;
  getStatusBadge: (status: string) => JSX.Element;
}

export function PostCard({ post, getStatusBadge }: PostCardProps) {
  return (
    <Card className="group overflow-hidden border-border/60 transition-all hover:border-border hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {getStatusBadge(post.status)}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>View analytics</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h3 className="text-lg font-semibold mt-2 transition-colors group-hover:text-primary">
          {post.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-1">
          {post.tags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-0">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={post.author.image || ""} alt={post.author.name} />
            <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          {post.author.name}
        </div>
        <div className="flex items-center gap-2">
          {post.status === "published" && (
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {post.views?.toLocaleString() || 0}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(post.scheduledDate || post.createdAt).toLocaleDateString("en-US", { 
              month: "short", 
              day: "numeric" 
            })}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}