import { Calculator, History, BarChart3, TrendingUp, User, MoreHorizontal } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navigationItems = [
  { icon: Calculator, label: 'Calculator', href: '/' },
  { icon: History, label: 'History', href: '/history' },
  { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
  { icon: TrendingUp, label: 'Analytics', href: '/analytics' },
  { icon: User, label: 'Profile', href: '/profile' },
];

export const BottomNavigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-4">
        {navigationItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full rounded-lg transition-all duration-200 group",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "relative p-2 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 shadow-lg shadow-primary/20" 
                    : "group-hover:bg-accent/50"
                )}>
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    isActive ? "scale-110" : "group-hover:scale-105"
                  )} />
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
                <span className={cn(
                  "text-xs font-medium mt-1 transition-all duration-200",
                  isActive ? "opacity-100" : "opacity-75"
                )}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};