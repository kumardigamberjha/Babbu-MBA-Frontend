import React, { useState, useEffect } from 'react';
import { api, Course, Chapter, Topic } from '../lib/api';
import { LayoutDashboard, FolderTree, FileText, Plus, Trash2, Edit2, Loader2, X } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'courses' | 'chapters' | 'topics'>('courses');
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
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
    resetForms();
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
        const cData = await api.getCourses();
        setCourses(cData);
      } else if (activeTab === 'topics') {
        const data = await api.getTopics();
        setTopics(data);
        const chData = await api.getChapters();
        setChapters(chData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setEditingId(null);
    setShowForm(false);
    // Reset course
    setCourseTitle(''); setCourseSlug(''); setCourseDesc('');
    // Reset chapter
    setChapterTitle(''); setChapterSlug(''); setChapterOrder(1); setChapterCourseId(0);
    // Reset topic
    setTopicTitle(''); setTopicSlug(''); setTopicContent(''); setTopicOrder(1); setTopicPublished(false); setTopicChapterId(0);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { title: courseTitle, description: courseDesc, slug: courseSlug, icon: 'book' };
      if (editingId) {
        await api.updateCourse(editingId, data);
      } else {
        await api.createCourse(data);
      }
      resetForms();
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { title: chapterTitle, slug: chapterSlug, course: chapterCourseId, order: chapterOrder };
      if (editingId) {
        await api.updateChapter(editingId, data);
      } else {
        await api.createChapter(data);
      }
      resetForms();
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { 
        title: topicTitle, 
        slug: topicSlug, 
        chapter: topicChapterId, 
        order: topicOrder,
        content: topicContent,
        is_published: topicPublished
      };
      if (editingId) {
        await api.updateTopic(editingId, data);
      } else {
        await api.createTopic(data);
      }
      resetForms();
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditCourse = (c: Course) => {
    setEditingId(c.id);
    setCourseTitle(c.title);
    setCourseSlug(c.slug);
    setCourseDesc(c.description);
    setShowForm(true);
  };

  const handleEditChapter = (c: Chapter) => {
    setEditingId(c.id);
    setChapterTitle(c.title);
    setChapterSlug(c.slug);
    setChapterCourseId(c.course);
    setChapterOrder(c.order);
    setShowForm(true);
  };

  const handleEditTopic = (t: Topic) => {
    setEditingId(t.id);
    setTopicTitle(t.title);
    setTopicSlug(t.slug);
    setTopicChapterId(t.chapter);
    setTopicOrder(t.order);
    setTopicContent(t.content || '');
    setTopicPublished(t.is_published || false);
    setShowForm(true);
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
      <div className="w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
        <h2 className="font-heading font-bold text-lg mb-4 text-slate-800 dark:text-slate-100 px-2">Admin Panel</h2>
        
        <button
          onClick={() => { setActiveTab('courses'); resetForms(); }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'courses' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Courses
        </button>
        <button
          onClick={() => { setActiveTab('chapters'); resetForms(); }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'chapters' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
        >
          <FolderTree className="w-5 h-5" />
          Chapters
        </button>
        <button
          onClick={() => { setActiveTab('topics'); resetForms(); }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'topics' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
        >
          <FileText className="w-5 h-5" />
          Topics
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <h3 className="font-heading font-bold text-xl text-slate-800 dark:text-slate-100 capitalize">Manage {activeTab}</h3>
          {!showForm && (
            <button 
              onClick={() => { resetForms(); setShowForm(true); }}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add New
            </button>
          )}
        </div>

        {error && (
          <div className="m-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-slate-900/50">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <>
              {/* Add/Edit Forms */}
              {showForm && activeTab === 'courses' && (
                <form onSubmit={handleSaveCourse} className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-lg">{editingId ? 'Edit Course' : 'Create New Course'}</h4>
                    <button type="button" onClick={resetForms} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="grid gap-4">
                    <input type="text" placeholder="Title" required value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                    <input type="text" placeholder="Slug (e.g. business-101)" required value={courseSlug} onChange={e => setCourseSlug(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                    <textarea placeholder="Description" required value={courseDesc} onChange={e => setCourseDesc(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" rows={4} />
                    <div className="flex gap-3 justify-end mt-2">
                      <button type="button" onClick={resetForms} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                      <button type="submit" className="bg-primary-600 text-white hover:bg-primary-700 font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm">{editingId ? 'Update' : 'Save'} Course</button>
                    </div>
                  </div>
                </form>
              )}

              {showForm && activeTab === 'chapters' && (
                <form onSubmit={handleSaveChapter} className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-lg">{editingId ? 'Edit Chapter' : 'Create New Chapter'}</h4>
                    <button type="button" onClick={resetForms} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="grid gap-4">
                    <select required value={chapterCourseId} onChange={e => setChapterCourseId(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all">
                      <option value={0}>Select a Course...</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    <input type="text" placeholder="Title" required value={chapterTitle} onChange={e => setChapterTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                    <input type="text" placeholder="Slug" required value={chapterSlug} onChange={e => setChapterSlug(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                    <input type="number" placeholder="Order" required value={chapterOrder} onChange={e => setChapterOrder(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                    <div className="flex gap-3 justify-end mt-2">
                      <button type="button" onClick={resetForms} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                      <button type="submit" className="bg-primary-600 text-white hover:bg-primary-700 font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm">{editingId ? 'Update' : 'Save'} Chapter</button>
                    </div>
                  </div>
                </form>
              )}

              {showForm && activeTab === 'topics' && (
                <form onSubmit={handleSaveTopic} className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-lg">{editingId ? 'Edit Topic' : 'Create New Topic'}</h4>
                    <button type="button" onClick={resetForms} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="grid gap-4">
                    <select required value={topicChapterId} onChange={e => setTopicChapterId(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all">
                      <option value={0}>Select a Chapter...</option>
                      {chapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    <input type="text" placeholder="Title" required value={topicTitle} onChange={e => setTopicTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                    <input type="text" placeholder="Slug" required value={topicSlug} onChange={e => setTopicSlug(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                    <textarea placeholder="HTML Content" required value={topicContent} onChange={e => setTopicContent(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all" rows={12} />
                    <div className="flex gap-4">
                      <input type="number" placeholder="Order" required value={topicOrder} onChange={e => setTopicOrder(Number(e.target.value))} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                      <label className="flex items-center gap-3 flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-600 cursor-pointer">
                        <input type="checkbox" checked={topicPublished} onChange={e => setTopicPublished(e.target.checked)} className="w-5 h-5 accent-primary-600" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">Published Status</span>
                      </label>
                    </div>
                    <div className="flex gap-3 justify-end mt-2">
                      <button type="button" onClick={resetForms} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                      <button type="submit" className="bg-primary-600 text-white hover:bg-primary-700 font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm">{editingId ? 'Update' : 'Save'} Topic</button>
                    </div>
                  </div>
                </form>
              )}

              {/* Data Lists */}
              {!showForm && (
                <div className="grid gap-4">
                  {activeTab === 'courses' && courses.map(c => (
                    <div key={c.id} className="flex items-start justify-between p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">{c.title}</h4>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-mono text-slate-500 dark:text-slate-400">/{c.slug}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{c.description}</p>
                        <div className="mt-3 flex gap-2">
                          <span className="text-xs font-semibold bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2.5 py-1 rounded-lg">
                            {c.chapters_count || 0} Chapters
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditCourse(c)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-colors" title="Edit Course">
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(c.id, 'course')} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors" title="Delete Course">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {activeTab === 'chapters' && chapters.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">{c.title}</h4>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-mono text-slate-500 dark:text-slate-400">/{c.slug}</span>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1.5 font-medium"><FolderTree className="w-4 h-4"/> Order: {c.order}</span>
                          <span className="text-slate-300 dark:text-slate-600">|</span>
                          <span>Course ID: <span className="font-mono">{c.course}</span></span>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditChapter(c)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-colors" title="Edit Chapter">
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(c.id, 'chapter')} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors" title="Delete Chapter">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {activeTab === 'topics' && topics.map(t => (
                    <div key={t.id} className="flex items-start justify-between p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">{t.title}</h4>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-mono text-slate-500 dark:text-slate-400">/{t.slug}</span>
                          {t.is_published ? (
                            <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">Published</span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">Draft</span>
                          )}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-4 mt-2 mb-3">
                          <span className="flex items-center gap-1.5 font-medium"><FileText className="w-4 h-4"/> Order: {t.order}</span>
                          <span className="text-slate-300 dark:text-slate-600">|</span>
                          <span>Chapter ID: <span className="font-mono">{t.chapter}</span></span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500 font-mono line-clamp-2">
                          {t.content ? t.content : 'No content provided.'}
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditTopic(t)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-colors" title="Edit Topic">
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(t.id, 'topic')} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors" title="Delete Topic">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {(activeTab === 'courses' && courses.length === 0) || 
                   (activeTab === 'chapters' && chapters.length === 0) || 
                   (activeTab === 'topics' && topics.length === 0) ? (
                     <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                       <p>No {activeTab} found. Click "Add New" to create one.</p>
                     </div>
                  ) : null}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
