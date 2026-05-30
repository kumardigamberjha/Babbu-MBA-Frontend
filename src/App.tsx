import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CourseList } from './components/CourseList';
import { Sidebar } from './components/Sidebar';
import { TopicView } from './components/TopicView';
import { AuthModal } from './components/AuthModal';
import { Chatbot } from './components/Chatbot';
import { AdminDashboard } from './components/AdminDashboard';
import { api, Course, Topic, User } from './lib/api';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('mbahub_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // User Auth state
  const [user, setUser] = useState<User | null>(() => api.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  // Content state
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Loading states
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingCourseDetail, setLoadingCourseDetail] = useState(false);
  const [loadingTopic, setLoadingTopic] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Apply dark mode theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mbahub_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mbahub_theme', 'light');
    }
  }, [darkMode]);

  // Load courses on mount
  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const data = await api.getCourses();
      setCourses(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the backend server.');
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Verify session validity on boot
  useEffect(() => {
    if (api.isAuthenticated()) {
      api.verifyProfile()
        .then((verifiedUser) => {
          setUser(verifiedUser);
          // Reload courses with authenticated context
          api.getCourses().then(setCourses).catch(console.error);
        })
        .catch((err) => {
          console.error('Session expired, logging out:', err);
          setUser(null);
        });
    }
  }, []);

  // Course selection handler
  const handleCourseSelect = async (courseId: number) => {
    try {
      setLoadingCourseDetail(true);
      setError(null);
      const detailedCourse = await api.getCourseDetail(courseId);
      setActiveCourse(detailedCourse);

      // Auto-select the first published topic of the first chapter, if available
      let firstTopicId: number | null = null;
      if (detailedCourse.chapters && detailedCourse.chapters.length > 0) {
        const sortedChapters = [...detailedCourse.chapters].sort((a, b) => a.order - b.order);
        for (const chapter of sortedChapters) {
          if (chapter.topics && chapter.topics.length > 0) {
            const sortedTopics = [...chapter.topics].sort((a, b) => a.order - b.order);
            const firstPublished = sortedTopics.find((t) => t.is_published);
            if (firstPublished) {
              firstTopicId = firstPublished.id;
              break;
            }
          }
        }
      }

      if (firstTopicId) {
        handleTopicSelect(firstTopicId);
      } else {
        setActiveTopic(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load course contents.');
    } finally {
      setLoadingCourseDetail(false);
    }
  };

  // Topic selection handler
  const handleTopicSelect = async (topicId: number) => {
    try {
      setLoadingTopic(true);
      const topicData = await api.getTopicDetail(topicId);
      setActiveTopic(topicData);
    } catch (err: any) {
      console.error('Failed to load topic details:', err);
    } finally {
      setLoadingTopic(false);
    }
  };

  // Toggle progress completion state
  const handleToggleTopicProgress = async (topicId: number) => {
    if (!user) return;
    try {
      const res = await api.toggleTopicProgress(topicId);
      
      // 1. Update the active topic's checked state in current view
      if (activeTopic && activeTopic.id === topicId) {
        setActiveTopic({ ...activeTopic, is_completed: res.is_completed });
      }
      
      // 2. Update the sidebar syllabus map
      if (activeCourse && activeCourse.chapters) {
        const updatedChapters = activeCourse.chapters.map((chapter) => {
          if (chapter.topics?.some((t) => t.id === topicId)) {
            const updatedTopics = chapter.topics.map((t) => {
              if (t.id === topicId) {
                return { ...t, is_completed: res.is_completed };
              }
              return t;
            });
            return { ...chapter, topics: updatedTopics };
          }
          return chapter;
        });

        // Recompute progress percentage dynamically on the client
        let total = 0;
        let completed = 0;
        updatedChapters.forEach((ch) => {
          ch.topics?.forEach((t) => {
            if (t.is_published) {
              total++;
              if (t.is_completed) completed++;
            }
          });
        });
        const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        setActiveCourse({
          ...activeCourse,
          chapters: updatedChapters,
          progress_percentage: progressPercentage,
        });
      }

      // 3. Update the global courses catalog (in case user heads back to dashboard)
      setCourses((prevCourses) =>
        prevCourses.map((c) => {
          if (c.id === activeCourse?.id) {
            let total = 0;
            let completed = 0;
            activeCourse.chapters?.forEach((ch) => {
              ch.topics?.forEach((t) => {
                if (t.is_published) {
                  total++;
                  const isThisTopic = t.id === topicId;
                  const isCompletedNow = isThisTopic ? res.is_completed : t.is_completed;
                  if (isCompletedNow) completed++;
                }
              });
            });
            return {
              ...c,
              progress_percentage: total > 0 ? Math.round((completed / total) * 105) : 0, // Cap at 100
            };
          }
          return c;
        })
      );
    } catch (err) {
      console.error('Failed to toggle progress state:', err);
    }
  };

  const handleBackToCourses = () => {
    setActiveCourse(null);
    setActiveTopic(null);
    // Re-fetch courses list on return to dashboard to capture up-to-date values
    api.getCourses().then(setCourses).catch(console.error);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setActiveCourse(null);
      setActiveTopic(null);
      // Fetch public courses list again
      api.getCourses().then(setCourses).catch(console.error);
    }
  };

  const handleLoginSuccess = async (newUser: User) => {
    setUser(newUser);
    setIsAuthModalOpen(false);
    // Fetch courses with authenticated context
    try {
      const data = await api.getCourses();
      setCourses(data);
      if (activeCourse) {
        // Refresh details within active study dashboard
        const detailedCourse = await api.getCourseDetail(activeCourse.id);
        setActiveCourse(detailedCourse);
        if (activeTopic) {
          const topicData = await api.getTopicDetail(activeTopic.id);
          setActiveTopic(topicData);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-slate-800 dark:text-slate-200 flex flex-col font-sans transition-colors duration-300">
      {/* Navigation Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={user}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAdminView={isAdminView}
        onAdminToggle={() => {
          setIsAdminView(!isAdminView);
          setActiveCourse(null);
          setActiveTopic(null);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {error && (
          <div className="max-w-xl mx-auto my-8 p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-3xl text-center">
            <h3 className="font-heading font-bold text-red-600 dark:text-red-400 text-lg mb-2">Connection Error</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 text-sm transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {!error && (
          <>
            {isAdminView ? (
              <AdminDashboard />
            ) : activeCourse ? (
              /* Learning Workspace View */
              <div className="flex-1 flex flex-col md:flex-row relative">
                {/* Course Syllabus Map Sidebar */}
                <Sidebar
                  course={activeCourse}
                  activeTopicId={activeTopic ? activeTopic.id : null}
                  onTopicSelect={handleTopicSelect}
                  onBackToCourses={handleBackToCourses}
                />

                {/* Topic Article Workspace */}
                <TopicView
                  course={activeCourse}
                  activeTopic={activeTopic}
                  onTopicSelect={handleTopicSelect}
                  loading={loadingTopic}
                  onToggleProgress={handleToggleTopicProgress}
                  userLoggedIn={!!user}
                />
              </div>
            ) : (
              /* Course Dashboard Grid View */
              <>
                {loadingCourses || loadingCourseDetail ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-24">
                    <Loader2 className="h-10 w-10 text-primary-500 animate-spin mb-4" />
                    <p className="text-sm font-semibold text-slate-400">
                      {loadingCourseDetail ? 'Preparing your study pathway...' : 'Fetching MBA curriculum...'}
                    </p>
                  </div>
                ) : (
                  <CourseList
                    courses={courses}
                    onCourseSelect={handleCourseSelect}
                    searchQuery={searchQuery}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Auth Modal Overlay */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Global MBA Chatbot Widget */}
      <Chatbot />
    </div>
  );
};
export default App;
