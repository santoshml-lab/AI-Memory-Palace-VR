const API_BASE_URL =
  "https://ai-memory-palace-vr-backend.onrender.com";

export async function checkBackendHealth() {
  const response = await fetch(
    `${API_BASE_URL}/health`
  );

  if (!response.ok) {
    throw new Error(
      `Backend request failed: ${response.status}`
    );
  }

  return response.json();
}

export { API_BASE_URL };
