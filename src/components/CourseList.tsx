import React from 'react';
import * as Icons from 'lucide-react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Course } from '../lib/api';

interface CourseListProps {
  courses: Course[];
  onCourseSelect: (courseId: number) => void;
  searchQuery: string;
}

// Helper to resolve icon by string from Lucide
const DynamicIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  // Convert standard kebab-case or PascalCase naming if needed
  // Many Django instances store lowercase names or PascalCase. Let's handle both.
  const formattedName = name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // Fallback map
  const IconComponent = 
    (Icons as any)[name] || 
    (Icons as any)[formattedName] || 
    (Icons as any)[name.replace(/-/g, '')] || 
    BookOpen;

  return <IconComponent className={className} />;
};

export const CourseList: React.FC<CourseListProps> = ({ courses, onCourseSelect, searchQuery }) => {
  const filteredCourses = courses.filter((course) => {
    const query = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query)
    );
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      {/* Intro section */}
      <div className="mb-12 text-center md:text-left">
        <h1 className="font-heading font-extrabold text-4xl md:text-5xl text-slate-900 dark:text-white tracking-tight mb-4">
          Master the Art of <span className="bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">Management</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl font-sans font-light">
          Structured, case-based learning built for MBA students and business leaders. Explore bite-sized modules on finance, leadership, strategy, and more.
        </p>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="glass rounded-3xl p-16 text-center border border-slate-200/50 dark:border-slate-800/50 max-w-lg mx-auto">
          <BookOpen className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="font-heading font-bold text-xl text-slate-800 dark:text-slate-200 mb-2">
            No courses found
          </h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            Try adjusting your search terms or check back later for new curriculum additions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => onCourseSelect(course.id)}
              className="glass glow-hover group flex flex-col justify-between p-7 rounded-3xl border border-slate-200/50 dark:border-slate-800/30 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1.5 hover:border-primary-500/40 dark:hover:border-primary-500/30 transition-all duration-300"
            >
              <div>
                {/* Course Icon */}
                <div className="inline-flex p-3 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-500 dark:text-primary-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <DynamicIcon name={course.icon} className="h-6 w-6" />
                </div>

                {/* Course Heading */}
                <h3 className="font-heading font-extrabold text-xl text-slate-800 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                  {course.title}
                </h3>

                {/* Course Description */}
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 mb-6 font-sans font-light leading-relaxed">
                  {course.description || "No description provided. Explore the course structure to learn more."}
                </p>

                {/* Progress Bar */}
                {course.progress_percentage !== undefined && course.progress_percentage > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5">
                      <span>Course Progress</span>
                      <span className="text-emerald-500 dark:text-emerald-400 font-extrabold">
                        {Math.min(100, course.progress_percentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800/60 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, course.progress_percentage)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Course Footer Info */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-900/50">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {course.chapters_count || course.modules?.length || 0} Chapters
                </span>

                <div className="flex items-center gap-1.5 text-sm font-bold text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform duration-200">
                  <span>
                    {course.progress_percentage && course.progress_percentage > 0
                      ? 'Resume Course'
                      : 'Start Learning'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};
