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

async function generateAdaptiveRevision(weakConcepts) {

  if (!weakConcepts || weakConcepts.length === 0) {
    return;
  }

  try {

    aiStatusLabel.text = `AI Revision: ${weakConcepts.join(", ")}`;

    const result = await generateRevision(
      currentTopic,
      weakConcepts
    );

    console.log("Adaptive revision:", result);

    if (
      !result ||
      !result.revision ||
      result.revision.length === 0
    ) {
      feedbackLabel.text = "No revision generated.";
      return;
    }

    const revision = result.revision[0];

    console.log("Revision concept:", revision.concept);
    console.log("Explanation:", revision.explanation);
    console.log("Memory hint:", revision.memory_hint);
    console.log("Challenge:", revision.challenge);

    // Find the weak 3D memory object
    const weakObject = recallObjects.find(
      (item) =>
        item.label.toLowerCase() ===
        revision.concept.toLowerCase()
    );

    if (weakObject) {

      // Highlight the weak concept
      weakObject.object.scale.set(
        1.25,
        1.25,
        1.25
      );

      // Store the latest AI revision information
      weakObject.object.userData.revisionExplanation =
        revision.explanation;

      weakObject.object.userData.memoryHint =
        revision.memory_hint;

      weakObject.object.userData.challenge =
        revision.challenge;

      console.log(
        "Weak 3D object highlighted:",
        revision.concept
      );
    }

    // Show AI revision information
    aiStatusLabel.text =
      `Revise: ${revision.concept}`;

    feedbackLabel.text =
      `${revision.memory_hint} | ${revision.challenge}`;

  } catch (error) {

    console.error(
      "Adaptive revision error:",
      error
    );

    aiStatusLabel.text =
      "AI revision failed.";

    feedbackLabel.text =
      "Please try the recall again.";
  }
}
  
      



export { API_BASE_URL };
