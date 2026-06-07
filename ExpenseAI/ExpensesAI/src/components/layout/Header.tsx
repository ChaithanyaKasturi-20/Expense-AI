import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Sparkles, LogOut, Settings, Moon, Sun, MessageCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CommandPalette } from '@/components/layout/CommandPalette';

interface HeaderProps {
  alertCount?: number;
}

export function Header({ alertCount = 0 }: HeaderProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (e) {
      console.error('Failed to logout', e);
    }
  };

  const { theme, resolvedTheme, setTheme } = useTheme();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (!mounted) return;
    const current = resolvedTheme || theme;
    const newTheme = current === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl"
    >
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 shadow-2xl shadow-cyan-500/25">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold uppercase tracking-[0.24em] text-foreground">ExpenseAI</h1>
            <p className="text-xs text-muted-foreground">AI finance cockpit</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search reports, categories, bills..."
              className="w-full rounded-full border border-border bg-card/80 py-3 pl-12 pr-4 text-sm text-foreground outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-card/10">
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-card/10"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {(resolvedTheme || theme) === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-card/10 relative">
            <Bell className="h-5 w-5" />
            {alertCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {alertCount}
              </span>
            )}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-card/10 flex items-center justify-center">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-900 to-slate-800 text-sm font-semibold text-white shadow-inner shadow-black/20 flex items-center justify-center">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-48">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate('/profile')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Log in</Button>
              <Button size="sm" onClick={() => navigate('/signup')}>Sign up</Button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
