import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, BookOpen, ArrowLeft, Layers, CheckCircle2 } from 'lucide-react';
import { Course } from '../lib/api';

interface SidebarProps {
  course: Course;
  activeTopicId: number | null;
  onTopicSelect: (topicId: number) => void;
  onBackToCourses: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  course,
  activeTopicId,
  onTopicSelect,
  onBackToCourses,
}) => {
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});

  // Ensure the chapter containing the active topic is auto-expanded
  useEffect(() => {
    if (activeTopicId && course.chapters) {
      for (const chapter of course.chapters) {
        if (chapter.topics?.some((t) => t.id === activeTopicId)) {
          setExpandedChapters((prev) => ({
            ...prev,
            [chapter.id]: true,
          }));
          break;
        }
      }
    }
  }, [activeTopicId, course.chapters]);

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const chapters = course.chapters || [];

  return (
    <aside className="w-80 border-r border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/20 h-[calc(100vh-73px)] sticky top-[73px] overflow-y-auto flex flex-col transition-colors duration-300">
      {/* Sidebar Header */}
      <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-4">
        <button
          onClick={onBackToCourses}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary-500 transition-colors uppercase tracking-wider self-start group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Courses
        </button>

        <div className="flex gap-3">
          <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-500 h-9 w-9 flex items-center justify-center shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-base text-slate-800 dark:text-white leading-tight line-clamp-2">
              {course.title}
            </h2>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mt-1">
              Curriculum Map
            </p>
            <div className="flex items-center gap-2 mt-2 w-48">
              <div className="flex-1 bg-slate-200 dark:bg-slate-850 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${course.progress_percentage || 0}%` }}
                />
              </div>
              <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {course.progress_percentage || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* Chapters Accordion */}
      <div className="flex-1 p-4 space-y-2">
        {chapters.length === 0 ? (
          <p className="text-slate-400 dark:text-slate-500 text-xs text-center py-8">
            No modules added to this course yet.
          </p>
        ) : (
          chapters.map((chapter) => {
            const isExpanded = !!expandedChapters[chapter.id];
            const topics = chapter.topics || [];
            
            return (
              <div key={chapter.id} className="rounded-xl overflow-hidden transition-all duration-200">
                {/* Chapter Heading Toggle */}
                <button
                  onClick={() => toggleChapter(chapter.id)}
                  className={`w-full flex items-center justify-between p-3.5 text-left text-sm font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors duration-200 ${
                    isExpanded
                      ? 'bg-slate-100/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="truncate pr-2">{chapter.title}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                  )}
                </button>

                {/* Chapter Topics Submenu */}
                {isExpanded && (
                  <div className="mt-1 pl-4 pr-1 border-l-2 border-slate-200/50 dark:border-slate-800/50 ml-5 py-1 space-y-1">
                    {topics.length === 0 ? (
                      <p className="text-slate-400 dark:text-slate-500 text-[11px] py-1">
                        No topics published.
                      </p>
                    ) : (
                      topics.map((topic) => {
                        const isActive = topic.id === activeTopicId;
                        return (
                          <button
                            key={topic.id}
                            onClick={() => onTopicSelect(topic.id)}
                            className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 text-xs text-left font-medium rounded-lg transition-all duration-200 ${
                              isActive
                                ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-semibold'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-900/30'
                            }`}
                          >
                            <span className="flex items-center gap-2.5 truncate">
                              <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{topic.title}</span>
                            </span>
                            {topic.is_completed && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
