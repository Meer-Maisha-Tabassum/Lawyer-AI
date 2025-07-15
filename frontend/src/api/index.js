import { auth } from '../firebase/config';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeader = async () => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User not authenticated.");
    }
    const token = await user.getIdToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }
    return response.json();
};

export const api = {
    analyzeDocument: async (text) => {
        const headers = await getAuthHeader();
        const response = await fetch(`${API_BASE_URL}/api/analyze`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ text })
        });
        return handleResponse(response);
    },

    askQuestionOnDocument: async (text, question) => {
        const headers = await getAuthHeader();
        const response = await fetch(`${API_BASE_URL}/api/analyze`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ text, question })
        });
        return handleResponse(response);
    },

    sendChatMessage: async (prompt) => {
        const headers = await getAuthHeader();
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ prompt })
        });
        return handleResponse(response);
    },

    // MODIFIED: Added userId parameter to generateTimeline
    generateTimeline: async (text, userId) => {
        const headers = await getAuthHeader();
        const response = await fetch(`${API_BASE_URL}/api/timeline`, {
            method: 'POST',
            headers: headers,
            // MODIFIED: Include user_id in the request body for backend logging/tracking
            body: JSON.stringify({ text, user_id: userId })
        });
        return handleResponse(response);
    }
};