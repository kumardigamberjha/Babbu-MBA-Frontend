import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { X, BookOpen, Layers } from "lucide-react"
import { type Course } from "../types"
import DynamicIcon from "./DynamicIcon"

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  courses: Course[]
  activeModule: string | null
  // UPDATE: Now we pass both courseId and moduleId back to App.tsx
  setActiveSelection: (courseId: string, moduleId: string) => void
}

export default function Sidebar({
  isOpen,
  setIsOpen,
  courses,
  activeModule,
  setActiveSelection,
}: SidebarProps) {
  return (
    <aside
      className={` ${isOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform duration-300 ease-in-out lg:static lg:translate-x-0`}
    >
      <div className="flex items-center justify-between border-b border-border p-6">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <BookOpen className="h-6 w-6 text-primary" />
          MBA Hub
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="h-[80vh] flex-1 px-4 py-4">
        <div className="mb-4 px-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Course Index
        </div>

        <Accordion type="multiple" className="w-full">
          {courses.map((course) => (
            <AccordionItem
              value={course.id}
              key={course.id}
              className="border-b-0"
            >
              <AccordionTrigger className="rounded-md px-2 text-sm font-medium transition-colors hover:bg-muted/50 hover:no-underline">
                <div className="flex items-center gap-2 text-left">
                  <DynamicIcon
                    name={course.icon}
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                  <span className="max-w-40 truncate">{course.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 pt-1 pb-2">
                <div className="space-y-1 border-l border-border pl-2">
                  {course.modules.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => {
                        // Pass both IDs up to the App
                        setActiveSelection(course.id, module.id)
                        setIsOpen(false)
                      }}
                      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                        activeModule === module.id
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <Layers className="h-3 w-3 shrink-0" />
                      <span className="line-clamp-2">{module.title}</span>
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </aside>
  )
}
