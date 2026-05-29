import { useState, useEffect } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2, ChevronLeft } from "lucide-react"

// Ensure DetailedSubject is exported from your types.ts
import { type Course, type DetailedSubject, type User } from "./types"
import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import Layout from "./components/Layout"
import TopicView from "./components/TopicView"
import DynamicIcon from "./components/DynamicIcon"
import AuthModal from "./components/AuthModal"

const API_BASE = "http://127.0.0.1:8000"

export default function App() {
  const [mbaData, setMbaData] = useState<Course[]>([])
  const [search, setSearch] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isIndexLoading, setIsIndexLoading] = useState(true)

  // Auth States
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"))
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user")
    try {
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Navigation & Data States for the Heavy Payload
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null)
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)
  const [detailData, setDetailData] = useState<DetailedSubject | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)

  const handleLogout = async () => {
    const savedToken = localStorage.getItem("token")
    if (savedToken) {
      try {
        await fetch("http://127.0.0.1:8000/api/auth/logout/", {
          method: "POST",
          headers: {
            "Authorization": `Token ${savedToken}`,
            "Content-Type": "application/json",
          }
        })
      } catch (err) {
        console.error("Backend logout error:", err)
      }
    }
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
  }

  // 1. Fetch the lightweight Index on initial load
  useEffect(() => {
    fetch(`${API_BASE}/api/courses/`)
      .then((res) => {
        if (!res.ok) throw new Error("Backend API down")
        return res.json()
      })
      .then((data) => {
        const mappedData = data.map((course: any) => ({
          id: String(course.id),
          title: course.title,
          icon: course.icon || "building-2",
          modules: (course.modules || []).map((m: any) => ({
            id: String(m.id),
            title: m.title
          }))
        }))
        setMbaData(mappedData)
        setIsIndexLoading(false)
      })
      .catch((err) => {
        console.warn("Could not fetch syllabus index from backend API, falling back to static files. Error:", err)
        fetch("/db/syllabus_index.json")
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch static index")
            return res.json()
          })
          .then((data) => {
            setMbaData(data)
            setIsIndexLoading(false)
          })
          .catch((error) => {
            console.error("Error loading index:", error)
            setIsIndexLoading(false)
          })
      })
  }, [])

  // 2. Fetch the Heavy Payload ONLY when a course is selected
  useEffect(() => {
    if (!activeCourseId) return

    const isNumeric = /^\d+$/.test(activeCourseId)

    if (isNumeric) {
      fetch(`${API_BASE}/api/courses/${activeCourseId}/`)
        .then((res) => {
          if (!res.ok) throw new Error("Backend API course detail failed")
          return res.json()
        })
        .then((data) => {
          const mappedDetail: DetailedSubject = {
            subject_id: String(data.id),
            title: data.title,
            modules: (data.chapters || []).map((ch: any) => ({
              module_id: String(ch.id),
              title: ch.title,
              topics: (ch.topics || []).map((top: any) => ({
                topic_id: String(top.id),
                title: top.title,
                content: top.content,
                difficulty: "easy",
                estimated_time: "15 mins",
                learning_outcomes: [],
                examples: [],
                common_mistakes: [],
                qna: []
              }))
            }))
          }
          setDetailData(mappedDetail)
          setIsDetailLoading(false)
        })
        .catch((err) => {
          console.warn("Could not fetch course detail from backend API, falling back. Error:", err)
          fallbackToStatic()
        })
    } else {
      fallbackToStatic()
    }

    function fallbackToStatic() {
      fetch(`/db/subjects/${activeCourseId}.json`)
        .then((res) => {
          if (!res.ok) throw new Error("Detailed subject file not found")
          return res.json()
        })
        .then((data) => {
          setDetailData(data)
          setIsDetailLoading(false)
        })
        .catch((error) => {
          console.error("Error loading detailed subject:", error)
          setIsDetailLoading(false)
        })
    }
  }, [activeCourseId])

  // Handlers
  const handleSelectModule = (courseId: string, moduleId: string) => {
    if (activeCourseId !== courseId) {
      setIsDetailLoading(true)
      setActiveCourseId(courseId) // Triggers the fetch effect
    }
    setActiveModuleId(moduleId)
    setSearch("") // Clear search when entering study mode
  }

  const handleBackToGrid = () => {
    setActiveCourseId(null)
    setActiveModuleId(null)
    setDetailData(null)
  }

  const filteredData = mbaData.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  )

  // Find the currently active module data from the heavy payload
  const activeModuleData = detailData?.modules.find(
    (m) => m.module_id === activeModuleId
  )

  return (
    <Layout
      sidebar={
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          courses={mbaData}
          activeModule={activeModuleId}
          setActiveSelection={handleSelectModule} // Wired up!
        />
      }
      header={
        <Header
          search={search}
          setSearch={setSearch}
          setSidebarOpen={setIsSidebarOpen}
          activeTag={activeCourseId ? "Study Mode" : "Dashboard"}
          user={user}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />
      }
    >
      {/* SCENARIO 1: Showing the Home Grid */}
      {!activeCourseId && (
        <>
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold tracking-tight">
              MBA Curriculum
            </h1>
            <p className="text-muted-foreground">
              Showing {filteredData.length} subjects in the database.
            </p>
          </div>

          {isIndexLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
              <p>Loading syllabus index...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredData.map((course) => (
                <Card
                  key={course.id}
                  className="group flex cursor-pointer flex-col justify-between overflow-hidden border border-border/70 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-xl hover:border-primary/45 hover:-translate-y-1 transition-all duration-300 ease-out"
                  onClick={() =>
                    course.modules[0]?.id && handleSelectModule(course.id, course.modules[0].id)
                  }
                >
                  <CardHeader className="pb-4">
                    <div className="mb-3 flex items-start justify-between">
                      <span className="rounded-xl bg-primary/10 p-2.5 transition-colors group-hover:bg-primary/20">
                        <DynamicIcon
                          name={course.icon}
                          className="size-6 shrink-0 text-primary transition-transform duration-300 group-hover:scale-110"
                        />
                      </span>
                      <span className="rounded-md bg-muted border border-border/30 px-2 py-0.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        ID: {course.id}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight leading-snug group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-xs font-semibold mt-1">
                      {course.modules.length} {course.modules.length === 1 ? 'Module' : 'Modules'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {course.modules.slice(0, 3).map((m) => (
                        <li key={m.id} className="truncate flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
                          <span className="truncate">{m.title}</span>
                        </li>
                      ))}
                      {course.modules.length > 3 && (
                        <li className="pl-3 text-xs italic text-muted-foreground/80">
                          + {course.modules.length - 3} more modules
                        </li>
                      )}
                    </ul>
                  </CardContent>
                  <CardFooter className="border-t border-border/40 bg-muted/10 pt-4 pb-4 group-hover:bg-muted/30 transition-colors">
                    <Button
                      className="w-full font-semibold transition-all group-hover:translate-x-0.5 cursor-pointer text-muted-foreground group-hover:text-primary"
                      variant="ghost"
                    >
                      Enter Subject <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* SCENARIO 2: Loading the Heavy JSON */}
      {activeCourseId && isDetailLoading && (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
          <p>Loading study materials...</p>
        </div>
      )}

      {/* SCENARIO 3: Showing the Topic View */}
      {activeCourseId && !isDetailLoading && activeModuleData && (
        <div className="animate-in duration-500 fade-in slide-in-from-bottom-4">
          <div className="mb-8 flex items-center justify-between border-b border-border pb-6">
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="mb-4 -ml-3 text-muted-foreground hover:text-foreground"
                onClick={handleBackToGrid}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Back to Subjects
              </Button>
              <h2 className="text-sm font-semibold tracking-wider text-primary uppercase">
                {detailData?.title}
              </h2>
              <h1 className="mt-1 text-3xl font-bold">
                {activeModuleData.title}
              </h1>
            </div>
          </div>

          <div className="space-y-16">
            {activeModuleData.topics.map((topic) => (
              <TopicView key={topic.topic_id} topic={topic} />
            ))}
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(newToken, newUser) => {
          setToken(newToken)
          setUser(newUser)
        }}
      />
    </Layout>
  )
}
