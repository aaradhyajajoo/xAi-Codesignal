// API utility functions
const getApiBaseUrl = () => {
  // Use environment variable if available, otherwise fallback to localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:8000';
};

export const apiCall = async (endpoint, options = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export default apiCall;
