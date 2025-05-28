import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AuthorInfoProps {
  author: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  isFollowing?: boolean;
  currentUserId?: string;
}

export function AuthorInfo({ author }: AuthorInfoProps) {
  if (!author) return null;
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={author.image || undefined} alt={author.name || "Author"} />
        <AvatarFallback>{author.name?.[0] || "A"}</AvatarFallback>
      </Avatar>
      <div>
        <div className="font-semibold">{author.name || "Anonymous"}</div>
        {/* Add more author info here if needed */}
      </div>
    </div>
  );
}
