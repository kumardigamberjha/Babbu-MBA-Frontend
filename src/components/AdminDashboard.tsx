import React, { useState, useEffect } from 'react';
import { api, Course, Chapter, Topic } from '../lib/api';
import { LayoutDashboard, FolderTree, FileText, Plus, Trash2, Loader2 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'courses' | 'chapters' | 'topics'>('courses');
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  
  // Course Form
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSlug, setCourseSlug] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  
  // Chapter Form
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterSlug, setChapterSlug] = useState('');
  const [chapterCourseId, setChapterCourseId] = useState<number>(0);
  const [chapterOrder, setChapterOrder] = useState(1);
  
  // Topic Form
  const [topicTitle, setTopicTitle] = useState('');
  const [topicSlug, setTopicSlug] = useState('');
  const [topicChapterId, setTopicChapterId] = useState<number>(0);
  const [topicContent, setTopicContent] = useState('');
  const [topicOrder, setTopicOrder] = useState(1);
  const [topicPublished, setTopicPublished] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'courses') {
        const data = await api.getCourses();
        setCourses(data);
      } else if (activeTab === 'chapters') {
        const data = await api.getChapters();
        setChapters(data);
        // Also need courses for the chapter form select dropdown
        const cData = await api.getCourses();
        setCourses(cData);
      } else if (activeTab === 'topics') {
        const data = await api.getTopics();
        setTopics(data);
        // Need chapters for the topic form select dropdown
        const chData = await api.getChapters();
        setChapters(chData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCourse({ title: courseTitle, description: courseDesc, slug: courseSlug, icon: 'book' });
      setShowForm(false);
      fetchData();
      setCourseTitle(''); setCourseSlug(''); setCourseDesc('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createChapter({ title: chapterTitle, slug: chapterSlug, course: chapterCourseId, order: chapterOrder });
      setShowForm(false);
      fetchData();
      setChapterTitle(''); setChapterSlug(''); setChapterOrder(1);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTopic({ 
        title: topicTitle, 
        slug: topicSlug, 
        chapter: topicChapterId, 
        order: topicOrder,
        content: topicContent,
        is_published: topicPublished
      });
      setShowForm(false);
      fetchData();
      setTopicTitle(''); setTopicSlug(''); setTopicContent(''); setTopicOrder(1);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number, type: 'course' | 'chapter' | 'topic') => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      if (type === 'course') await api.deleteCourse(id);
      if (type === 'chapter') await api.deleteChapter(id);
      if (type === 'topic') await api.deleteTopic(id);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full p-6 gap-6 h-[calc(100vh-80px)]">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
        <h2 className="font-heading font-bold text-lg mb-4 text-slate-800 dark:text-slate-100 px-2">Admin Panel</h2>
        
        <button
          onClick={() => { setActiveTab('courses'); setShowForm(false); }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'courses' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Courses
        </button>
        <button
          onClick={() => { setActiveTab('chapters'); setShowForm(false); }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'chapters' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
        >
          <FolderTree className="w-5 h-5" />
          Chapters
        </button>
        <button
          onClick={() => { setActiveTab('topics'); setShowForm(false); }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'topics' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
        >
          <FileText className="w-5 h-5" />
          Topics
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-heading font-bold text-xl text-slate-800 dark:text-slate-100 capitalize">Manage {activeTab}</h3>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>

        {error && (
          <div className="m-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <>
              {/* Add Forms */}
              {showForm && activeTab === 'courses' && (
                <form onSubmit={handleCreateCourse} className="mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold mb-4">Create New Course</h4>
                  <div className="grid gap-4">
                    <input type="text" placeholder="Title" required value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                    <input type="text" placeholder="Slug (e.g. business-101)" required value={courseSlug} onChange={e => setCourseSlug(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                    <textarea placeholder="Description" required value={courseDesc} onChange={e => setCourseDesc(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" rows={3} />
                    <button type="submit" className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold py-2 px-4 rounded-xl">Save Course</button>
                  </div>
                </form>
              )}

              {showForm && activeTab === 'chapters' && (
                <form onSubmit={handleCreateChapter} className="mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold mb-4">Create New Chapter</h4>
                  <div className="grid gap-4">
                    <select required value={chapterCourseId} onChange={e => setChapterCourseId(Number(e.target.value))} className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                      <option value={0}>Select a Course...</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    <input type="text" placeholder="Title" required value={chapterTitle} onChange={e => setChapterTitle(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                    <input type="text" placeholder="Slug" required value={chapterSlug} onChange={e => setChapterSlug(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                    <input type="number" placeholder="Order" required value={chapterOrder} onChange={e => setChapterOrder(Number(e.target.value))} className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                    <button type="submit" className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold py-2 px-4 rounded-xl">Save Chapter</button>
                  </div>
                </form>
              )}

              {showForm && activeTab === 'topics' && (
                <form onSubmit={handleCreateTopic} className="mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold mb-4">Create New Topic</h4>
                  <div className="grid gap-4">
                    <select required value={topicChapterId} onChange={e => setTopicChapterId(Number(e.target.value))} className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                      <option value={0}>Select a Chapter...</option>
                      {chapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    <input type="text" placeholder="Title" required value={topicTitle} onChange={e => setTopicTitle(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                    <input type="text" placeholder="Slug" required value={topicSlug} onChange={e => setTopicSlug(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                    <textarea placeholder="HTML Content" required value={topicContent} onChange={e => setTopicContent(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm" rows={8} />
                    <div className="flex gap-4">
                      <input type="number" placeholder="Order" required value={topicOrder} onChange={e => setTopicOrder(Number(e.target.value))} className="flex-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                      <label className="flex items-center gap-2 flex-1 px-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-600">
                        <input type="checkbox" checked={topicPublished} onChange={e => setTopicPublished(e.target.checked)} />
                        Published
                      </label>
                    </div>
                    <button type="submit" className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold py-2 px-4 rounded-xl">Save Topic</button>
                  </div>
                </form>
              )}

              {/* Data Lists */}
              <div className="grid gap-3">
                {activeTab === 'courses' && courses.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl">
                    <div className="font-semibold">{c.title}</div>
                    <button onClick={() => handleDelete(c.id, 'course')} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                
                {activeTab === 'chapters' && chapters.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl">
                    <div>
                      <div className="font-semibold">{c.title}</div>
                      <div className="text-xs text-slate-500">Order: {c.order}</div>
                    </div>
                    <button onClick={() => handleDelete(c.id, 'chapter')} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                
                {activeTab === 'topics' && topics.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl">
                    <div>
                      <div className="font-semibold">{t.title}</div>
                      <div className="text-xs text-slate-500">{t.is_published ? 'Published' : 'Draft'} | Order: {t.order}</div>
                    </div>
                    <button onClick={() => handleDelete(t.id, 'topic')} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
