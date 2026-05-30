/// <reference types="vite/client" />
export interface Topic {
  id: number;
  chapter: number;
  title: string;
  slug: string;
  content: string;
  order: number;
  is_published: boolean;
  is_completed?: boolean; // Progress state
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: number;
  course: number;
  title: string;
  slug: string;
  order: number;
  topics?: Topic[]; // Available in detailed views
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  icon: string;
  description: string;
  chapters_count?: number;
  modules?: { id: number; title: string; slug: string; order: number }[];
  chapters?: Chapter[]; // Available in detailed views
  progress_percentage?: number; // Progress state
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://mba.codingindia.co.in/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('mbahub_auth_token');
  if (token) {
    return {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    };
  }
  return {
    'Content-Type': 'application/json',
  };
}

async function handleResponse<T>(response: Response): Promise<T> {

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errData = await response.json();
      errorMsg = errData.error || errData.detail || JSON.stringify(errData);
    } catch {
      errorMsg = response.statusText;
    }
    throw new Error(errorMsg);
  }
  
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

export const api = {
  // Course APIs
  getCourses: async (): Promise<Course[]> => {
    const res = await fetch(`${API_BASE}/courses/`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Course[]>(res);
  },

  getCourseDetail: async (id: number): Promise<Course> => {
    const res = await fetch(`${API_BASE}/courses/${id}/`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Course>(res);
  },

  createCourse: async (courseData: Partial<Course>): Promise<Course> => {
    const res = await fetch(`${API_BASE}/courses/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData),
    });
    return handleResponse<Course>(res);
  },

  updateCourse: async (id: number, courseData: Partial<Course>): Promise<Course> => {
    const res = await fetch(`${API_BASE}/courses/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData),
    });
    return handleResponse<Course>(res);
  },

  deleteCourse: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/courses/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(res);
  },

  // Chapter APIs
  getChapters: async (courseId?: number): Promise<Chapter[]> => {
    const url = courseId ? `${API_BASE}/chapters/?course=${courseId}` : `${API_BASE}/chapters/`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Chapter[]>(res);
  },

  createChapter: async (chapterData: Partial<Chapter>): Promise<Chapter> => {
    const res = await fetch(`${API_BASE}/chapters/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(chapterData),
    });
    return handleResponse<Chapter>(res);
  },

  updateChapter: async (id: number, chapterData: Partial<Chapter>): Promise<Chapter> => {
    const res = await fetch(`${API_BASE}/chapters/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(chapterData),
    });
    return handleResponse<Chapter>(res);
  },

  deleteChapter: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/chapters/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(res);
  },

  // Topic APIs
  getTopics: async (chapterId?: number): Promise<Topic[]> => {
    const url = chapterId ? `${API_BASE}/topics/?chapter=${chapterId}` : `${API_BASE}/topics/`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Topic[]>(res);
  },

  getTopicDetail: async (id: number): Promise<Topic> => {
    const res = await fetch(`${API_BASE}/topics/${id}/`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Topic>(res);
  },

  createTopic: async (topicData: Partial<Topic>): Promise<Topic> => {
    const res = await fetch(`${API_BASE}/topics/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(topicData),
    });
    return handleResponse<Topic>(res);
  },

  updateTopic: async (id: number, topicData: Partial<Topic>): Promise<Topic> => {
    const res = await fetch(`${API_BASE}/topics/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(topicData),
    });
    return handleResponse<Topic>(res);
  },

  deleteTopic: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/topics/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(res);
  },

  // Authentication APIs
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await handleResponse<AuthResponse>(res);
    localStorage.setItem('mbahub_auth_token', data.token);
    localStorage.setItem('mbahub_user', JSON.stringify(data.user));
    return data;
  },

  register: async (username: string, email: string, password: string, firstName = '', lastName = ''): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      }),
    });
    const data = await handleResponse<AuthResponse>(res);
    localStorage.setItem('mbahub_auth_token', data.token);
    localStorage.setItem('mbahub_user', JSON.stringify(data.user));
    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await fetch(`${API_BASE}/auth/logout/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } finally {
      localStorage.removeItem('mbahub_auth_token');
      localStorage.removeItem('mbahub_user');
    }
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('mbahub_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('mbahub_auth_token');
  },

  verifyProfile: async (): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/me/`, {
      headers: getAuthHeaders(),
    });
    try {
      const userData = await handleResponse<User>(res);
      localStorage.setItem('mbahub_user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      localStorage.removeItem('mbahub_auth_token');
      localStorage.removeItem('mbahub_user');
      throw err;
    }
  },

  toggleTopicProgress: async (topicId: number): Promise<{ is_completed: boolean; topic_id: number }> => {
    const res = await fetch(`${API_BASE}/topics/${topicId}/toggle_progress/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ is_completed: boolean; topic_id: number }>(res);
  },

  // Chat API
  sendChatMessage: async (messages: {role: string, content: string}[]): Promise<{ response: string }> => {
    const res = await fetch(`${API_BASE}/chat/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ messages }),
    });
    return handleResponse<{ response: string }>(res);
  }
};

