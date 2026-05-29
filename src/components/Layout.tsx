import React from "react"

interface LayoutProps {
  sidebar: React.ReactNode
  header: React.ReactNode
  children: React.ReactNode
}

export default function Layout({ sidebar, header, children }: LayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans text-foreground">
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {header}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
        <footer className="border-t border-border bg-muted/20 px-4 py-6 text-center sm:text-left lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MBA Mastery Hub. Open Source.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="cursor-pointer transition-colors hover:text-foreground">
                Privacy
              </span>
              <span className="cursor-pointer transition-colors hover:text-foreground">
                Terms
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
