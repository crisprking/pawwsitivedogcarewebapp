import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";

export default function Header() {
  const { user } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/dogs", label: "My Dogs" },
    { path: "/health", label: "Health" },
    { path: "/appointments", label: "Appointments" },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-paw text-primary-foreground text-sm"></i>
              </div>
              <span className="text-xl font-bold text-foreground">Pawsitive</span>
            </Link>
            <nav className="hidden md:flex space-x-8 ml-12">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`transition-colors font-medium ${
                    location === item.path
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                  data-testid={`link-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative" data-testid="button-notifications">
              <i className="fas fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-xs text-destructive-foreground flex items-center justify-center">
                3
              </span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3" data-testid="button-profile-menu">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt="Profile" />
                    <AvatarFallback>
                      {user?.firstName?.[0] || user?.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium text-foreground">
                    {user?.firstName || user?.email?.split('@')[0] || "User"}
                  </span>
                  <i className="fas fa-chevron-down text-sm text-muted-foreground"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/subscribe" data-testid="link-upgrade">
                    <i className="fas fa-crown mr-2 text-chart-4"></i>
                    Upgrade to Premium
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
