import { Link, useLocation } from "wouter";

export default function MobileNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: "fas fa-home", label: "Home" },
    { path: "/dogs", icon: "fas fa-paw", label: "Dogs" },
    { path: "/health", icon: "fas fa-heart", label: "Health" },
    { path: "/appointments", icon: "fas fa-calendar", label: "Schedule" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <button 
                className={`flex flex-col items-center py-2 px-3 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
                data-testid={`mobile-nav-${item.label.toLowerCase()}`}
              >
                <i className={`${item.icon} text-lg mb-1`}></i>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
