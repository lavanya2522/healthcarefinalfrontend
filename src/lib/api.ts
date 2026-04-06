// API Service - Frontend to Backend Communication

const API_URL = import.meta.env.VITE_API_URL || 'https://health-back-end.onrender.com';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Fetch wrapper with timeout support
 */
async function fetchWithTimeout(url: string, options: FetchOptions = {}) {
  const controller = new AbortController();
  const timeout = options.timeout || API_TIMEOUT;
  
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Get all disease data from MongoDB
 */
export async function getAllData() {
  try {
    const response = await fetchWithTimeout(`${API_URL}/data`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return await response.json();
  } catch (error) {
    console.error('❌ Error fetching all data:', error);
    throw error;
  }
}

/**
 * Search diseases by symptom
 */
export async function searchBySymptom(symptom: string) {
  try {
    if (!symptom || symptom.trim() === '') {
      throw new Error('Symptom cannot be empty');
    }

    const encodedSymptom = encodeURIComponent(symptom);
    const response = await fetchWithTimeout(`${API_URL}/search?symptom=${encodedSymptom}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return await response.json();
  } catch (error) {
    console.error('❌ Error searching for symptom:', error);
    throw error;
  }
}

/**
 * Health check - verify backend is running
 */
export async function healthCheck() {
  try {
    const response = await fetchWithTimeout(`${API_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return await response.json();
  } catch (error) {
    console.error('❌ Backend health check failed:', error);
    return { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export default {
  getAllData,
  searchBySymptom,
  healthCheck,
  API_URL,
};
