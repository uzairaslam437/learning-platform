
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const getAuthHeaders = () => {
  const token = window.localStorage?.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const handleResponse = async (response: Response) => {
  const data = await response.json();

  if (!response.ok) {
    // Ensure we always return an object with an error property
    const errorMessage = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`;
    console.log('API Error:', errorMessage);
    
    return { 
      error: errorMessage,
      success: false 
    };
  }

  return { 
    ...data,
    success: true 
  };
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string, role: 'student' | 'instructor') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, role }), // Include role in request
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Login request failed:', error);
      return { 
        error: 'Network error. Please check your connection and try again.',
        success: false 
      };
    }
  },

  register: async (email: string, password: string, firstName: string, lastName: string, role: 'student' | 'instructor') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName, role }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Registration request failed:', error);
      return { 
        error: 'Network error. Please check your connection and try again.',
        success: false 
      };
    }
  },
};
