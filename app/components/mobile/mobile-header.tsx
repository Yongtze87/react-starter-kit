import { Menu, User } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

interface MobileHeaderProps {
  title: string;
  user: {
    fullName: string;
    email: string;
    initials: string;
    imageUrl: string | null;
  };
}

export function MobileHeader({ title, user }: MobileHeaderProps) {
  const handleSignOut = () => {
    // TODO: Implement Supabase sign out
    console.log("Sign out clicked");
  };

  return (
    <header className="sticky top-0 z-40 bg-background">
      <div className="flex items-center justify-between h-14 px-4 max-w-screen-sm mx-auto border-b border-border">
        <h1 className="text-lg font-semibold">{title}</h1>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                {user.imageUrl && <AvatarImage src={user.imageUrl} alt={user.fullName} />}
                <AvatarFallback>{user.initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.fullName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
