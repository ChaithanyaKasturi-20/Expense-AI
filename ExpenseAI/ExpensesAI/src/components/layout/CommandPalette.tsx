import { useMemo, useState } from 'react';
import * as Command from 'cmdk';
import { Search, Command as CommandIcon, ArrowRight, Users, Sparkles, ChartBar, Settings, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const actions = [
  { title: 'Open Overview', description: 'Jump to the main dashboard overview', href: '#overview', icon: Home },
  { title: 'Show Expenses', description: 'Filter your recent transactions', href: '#expenses', icon: ChartBar },
  { title: 'View Insights', description: 'See AI recommendations and spend score', href: '#insights', icon: Sparkles },
  { title: 'Manage subscriptions', description: 'Review recurring payments and reminders', href: '#subscriptions', icon: Users },
  { title: 'Your settings', description: 'Update profile, notifications, and preferences', href: '/profile', icon: Settings },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filteredActions = useMemo(() => {
    const normalized = query.toLowerCase();
    return actions.filter((action) => action.title.toLowerCase().includes(normalized) || action.description.toLowerCase().includes(normalized));
  }, [query]);

  const handleSelect = (href: string) => {
    onOpenChange(false);
    if (href.startsWith('#')) {
      const anchor = document.querySelector(href);
      anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    navigate(href);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onOpenChange(!open)}
        className="text-muted-foreground hover:text-foreground hover:bg-card/10"
        aria-label="Open command palette"
      >
        <CommandIcon className="h-5 w-5" />
      </Button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-3 w-screen max-w-xl rounded-3xl border border-border bg-card p-1 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <Command.Command>
            <div className="flex items-center gap-3 rounded-3xl border border-border bg-card/5 px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Command.CommandInput
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder="Search actions, pages, or insights..."
                className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Command.CommandList className="max-h-72 overflow-auto rounded-3xl bg-card px-2 py-2">
              {filteredActions.length === 0 ? (
                <Command.CommandEmpty className="p-3 text-sm text-muted-foreground">No actions found.</Command.CommandEmpty>
              ) : (
                filteredActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Command.CommandItem
                      key={action.title}
                      onSelect={() => handleSelect(action.href)}
                      className="group flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-sm text-muted-foreground transition hover:bg-card/10"
                    >
                      <Icon className="h-4 w-4 text-cyan-400" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{action.title}</p>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    </Command.CommandItem>
                  );
                })
              )}
            </Command.CommandList>
          </Command.Command>
        </div>
      ) : null}
    </div>
  );
}
