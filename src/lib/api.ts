export const apiFetch = async (path: string, options: any = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`/.netlify/functions${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && path !== '/auth') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return null;
    }

    return response.json();
  } catch (err) {
    console.error('[API] Fetch error:', err);
    return null;
  }
};
