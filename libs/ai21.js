export async function fetchAI21Response(data) {
  console.log("Data:", data);
  const prompt = `Act as a trip planner, scheduler, and a finance manager, and provide a detailed trip itinerary in a human readable form with approximate cost per item based on the following information: ${JSON.stringify(
    data
  )}`;
  console.log("Prompt:", prompt);
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      Authorization: `Bearer ${process.env.AI21_API_KEY}`,
    },
    body: JSON.stringify({
      numResults: 1,
      maxTokens: 1000,
      minTokens: 0,
      temperature: 0.7,
      topP: 1,
      topKReturn: 0,
      frequencyPenalty: {
        scale: 1,
        applyToWhitespaces: true,
        applyToPunctuations: true,
        applyToNumbers: true,
        applyToStopwords: true,
        applyToEmojis: true,
      },
      presencePenalty: {
        scale: 0,
        applyToWhitespaces: true,
        applyToPunctuations: true,
        applyToNumbers: true,
        applyToStopwords: true,
        applyToEmojis: true,
      },
      countPenalty: {
        scale: 0,
        applyToWhitespaces: true,
        applyToPunctuations: true,
        applyToNumbers: true,
        applyToStopwords: true,
        applyToEmojis: true,
      },
      prompt: prompt,
    }),
  };
  const response = await fetch(
    "https://api.ai21.com/studio/v1/j2-ultra/complete",
    options
  );

  if (!response.ok) {
    const errorDetails = await response.text();
    console.error("AI21 API Error:", errorDetails);
    throw new Error("Failed to fetch AI21 response");
  }

  const responseData = await response.json();
  console.log("Response Data:", responseData);
  return responseData.completions[0].data.text;
}
