// background.js
const API_URL = 'https://api.anthropic.com/v1/messages';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    translateText(request.text)
      .then(translation => sendResponse({translation}))
      .catch(error => sendResponse({error: error.message}));
    return true; // Indicates that the response is asynchronous
  }
});

async function translateText(text) {
  // Get the API key from storage
  const data = await chrome.storage.sync.get('apiKey');
  const API_KEY = data.apiKey;

  if (!API_KEY) {
    throw new Error('API key not set. Please set your API key in the extension settings.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `You are a helpful Classical Arabic translator and language expert. 
          Translate the following Classical Arabic word or phrase to English: "${text}". 
          Then, provide a brief explanation (1-2 sentences) of its meaning, usage, or cultural context. 
          Format your response as follows:
          Translation: [English translation]
          Explanation: [Brief explanation]
          Keep your entire response under 50 words.`
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const responseData = await response.json();
  return responseData.content[0].text.trim();
}