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


export async function generateConcepts(topic) {
  const response = await fetch(
    `${API_BASE_URL}/generate-concepts`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        topic
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Concept generation failed: ${response.status} ${errorText}`
    );
  }

  return response.json();
}


export { API_BASE_URL };
