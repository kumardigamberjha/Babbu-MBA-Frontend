import React from 'react';
import { Calendar, Clock, ArrowLeft, ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { Course, Topic } from '../lib/api';

interface TopicViewProps {
  course: Course;
  activeTopic: Topic | null;
  onTopicSelect: (topicId: number) => void;
  loading: boolean;
  onToggleProgress?: (topicId: number) => void;
  userLoggedIn: boolean;
}

export const TopicView: React.FC<TopicViewProps> = ({
  course,
  activeTopic,
  onTopicSelect,
  loading,
  onToggleProgress,
  userLoggedIn,
}) => {
  // Flatten topics list for back/next navigation
  const allTopics: Topic[] = [];
  if (course.chapters) {
    course.chapters.forEach((chapter) => {
      if (chapter.topics) {
        // Sort by chapter.order first then topic.order
        const sortedTopics = [...chapter.topics].sort((a, b) => a.order - b.order);
        allTopics.push(...sortedTopics);
      }
    });
  }

  const activeIndex = allTopics.findIndex((t) => t.id === activeTopic?.id);
  const prevTopic = activeIndex > 0 ? allTopics[activeIndex - 1] : null;
  const nextTopic = activeIndex >= 0 && activeIndex < allTopics.length - 1 ? allTopics[activeIndex + 1] : null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Loading topic contents...</p>
      </div>
    );
  }

  if (!activeTopic) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 text-center transition-colors duration-300">
        <BookOpen className="h-16 w-16 text-slate-200 dark:text-slate-800 mb-4 animate-pulse" />
        <h3 className="font-heading font-extrabold text-2xl text-slate-800 dark:text-slate-200 mb-2">
          Select a Topic
        </h3>
        <p className="text-slate-400 dark:text-slate-500 text-sm max-w-sm">
          Pick a chapter and select any topic from the curriculum sidebar map to start studying.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900/50 flex flex-col transition-colors duration-300">
      {/* Article Container */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-6 md:px-12 py-10">
        {/* Topic Header metadata */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-4 mb-6">
          <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(activeTopic.updated_at)}
            </span>
            <span className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Syllabus Unit
            </span>
          </div>

          {userLoggedIn && onToggleProgress && (
            <button
              onClick={() => onToggleProgress(activeTopic.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 border cursor-pointer ${
                activeTopic.is_completed
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <CheckCircle2 className={`h-4 w-4 ${activeTopic.is_completed ? 'fill-emerald-500 text-white dark:text-slate-900' : ''}`} />
              <span>{activeTopic.is_completed ? 'Completed' : 'Mark as Completed'}</span>
            </button>
          )}
        </div>

        {/* Title */}
        <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-slate-950 dark:text-white mb-8 tracking-tight leading-tight">
          {activeTopic.title}
        </h1>

        {/* TinyMCE Compiled Content */}
        <div 
          className="topic-content prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300"
          dangerouslySetInnerHTML={{ __html: activeTopic.content }}
        />

        {/* Bottom Completion Card */}
        {userLoggedIn && onToggleProgress && (
          <div className="mt-12 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="font-heading font-bold text-slate-800 dark:text-white text-sm">
                Finished studying this module?
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Marking it complete updates your syllabus progress bar.
              </p>
            </div>
            <button
              onClick={() => onToggleProgress(activeTopic.id)}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                activeTopic.is_completed
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/15'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{activeTopic.is_completed ? 'Completed' : 'Mark as Completed'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Sequential Navigation Footer */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 px-6 md:px-12 py-6 bg-slate-50/50 dark:bg-slate-950/20 max-w-3xl w-full mx-auto flex items-center justify-between gap-4 mt-auto rounded-t-2xl">
        {prevTopic ? (
          <button
            onClick={() => onTopicSelect(prevTopic.id)}
            className="flex-1 max-w-[240px] flex items-center gap-3 p-3 text-left border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 text-slate-400" />
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Previous</span>
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{prevTopic.title}</span>
            </div>
          </button>
        ) : (
          <div className="flex-1 max-w-[240px]"></div>
        )}

        {nextTopic ? (
          <button
            onClick={() => onTopicSelect(nextTopic.id)}
            className="flex-1 max-w-[240px] flex items-center justify-between gap-3 p-3 text-right border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors duration-200 cursor-pointer"
          >
            <div className="min-w-0 text-left md:text-right">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Next</span>
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{nextTopic.title}</span>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
          </button>
        ) : (
          <div className="flex-1 max-w-[240px]"></div>
        )}
      </div>
    </div>
  );
};
export default TopicView;
