import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Menu, Search, UserCheck, LogOut, Sun, Moon } from "lucide-react"
import { type User } from "../types"
import { useTheme } from "./theme-provider"

interface HeaderProps {
  search: string
  setSearch: (query: string) => void
  setSidebarOpen: (isOpen: boolean) => void
  activeTag: string
  user: User | null
  onOpenAuth: () => void
  onLogout: () => void
}

export default function Header({
  search,
  setSearch,
  setSidebarOpen,
  activeTag,
  user,
  onOpenAuth,
  onLogout,
}: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="z-10 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 lg:px-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="hidden text-lg font-semibold text-muted-foreground sm:block">
          {activeTag === "All" || !activeTag ? "Master Curriculum" : `${activeTag} Track`}
        </h2>
      </div>

      <div className="flex items-center gap-3 ml-auto w-full max-w-xl justify-end">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search subjects..."
            className="border-none bg-muted/50 pl-9 focus-visible:ring-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full cursor-pointer text-muted-foreground hover:text-foreground shrink-0"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Toggle Theme"
        >
          {theme === "dark" ? (
            <Sun className="h-[1.2rem] w-[1.2rem] text-amber-500 transition-all" />
          ) : (
            <Moon className="h-[1.2rem] w-[1.2rem] text-indigo-500 transition-all" />
          )}
        </Button>

        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground border border-border/45">
              <UserCheck className="size-3.5 text-emerald-500" />
              <span>Hi, {user.first_name || user.username}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-destructive/25 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
              onClick={onLogout}
            >
              <LogOut className="mr-1.5 size-3.5" /> Logout
            </Button>
          </div>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="text-xs font-semibold shadow-sm cursor-pointer"
            onClick={onOpenAuth}
          >
            Login / Register
          </Button>
        )}
      </div>
    </header>
  )
}
