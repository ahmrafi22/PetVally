import {
  GoogleGenerativeAI,
  GenerativeModel,
  Part,
  Content,
} from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY as string;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(apiKey);
// 'gemini-1.5-flash-latest' or 'gemini-1.5-pro-latest' or 'gemini-2.0-flash' models works for my api
const model: GenerativeModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

interface ConversationMessage {
  role: "user" | "model";
  parts: (string | Part)[];
}

// chat history by session ID
const chatHistory: Record<string, ConversationMessage[]> = {};

function createImagePart(imageData: {
  base64: string;
  mimeType: string;
}): Part {
  return {
    inlineData: {
      data: imageData.base64,
      mimeType: imageData.mimeType,
    },
  };
}

function getOrCreateChat(sessionId: string): ConversationMessage[] {
  if (!chatHistory[sessionId]) {
    console.log(`Creating new chat history for session: ${sessionId}`);
    chatHistory[sessionId] = [];

    // Initial  User Message to ensure history starts with 'user'
    chatHistory[sessionId].push({
      role: "user",
      parts: ["Hello, I need help with my pet."], //  placeholder to start the conversation
    });

    // System Prompt as the first 'model' response
    const systemPrompt = `You are Dr. Whisker, a compassionate and soft-spoken veterinarian with 15+ years of experience caring for all kinds of pets.
     Your communication style:
     - Always begin with a warm greeting, often using the pet's name if mentioned 🐾
     - Use gentle, reassuring language that calms worried pet parents ❤️
     - Include relevant emojis throughout your responses to convey warmth and care
     - Balance professional medical knowledge with approachable explanations
     - Share practical, actionable advice pet owners can implement at home when appropriate
     - Ask thoughtful follow-up questions when more information would help (about symptoms, duration, pet's behavior)
     - For serious concerns, gently recommend an in-person vet visit without causing panic 🏥
     - Sometimes share brief, relatable anecdotes about similar cases you've seen to reassure owners
     - Express empathy for both the pet's discomfort and the owner's concerns
     - End messages with a positive, supportive note and a cute animal emoji that matches their pet type
 
     Important notes:
     - If presented with an emergency situation, emphasize the importance of immediate professional care
     - If shown an image, analyze it carefully for visual symptoms or concerns
     - Use pet-specific emojis when possible (🐶 🐱 🐰 🐦 🦎 etc.)
     - Keep responses concise (2-4 paragraphs) but thorough enough to be helpful
     - Use simple language but don't talk down to pet owners`;

    chatHistory[sessionId].push({
      role: "model",
      parts: [systemPrompt],
    });
  } else {
    console.log(`Using existing chat history for session: ${sessionId}`);
  }
  return chatHistory[sessionId];
}

// Converting internal ConversationMessage format to the API's Content format.

function formatHistoryForApi(history: ConversationMessage[]): Content[] {
  const startIndex = 0;

  return history.slice(startIndex).map((message) => ({
    role: message.role,
    parts: message.parts.map((part) => {
      if (typeof part === "string") {
        return { text: part };
      } else {
        return part;
      }
    }),
  }));
}

export async function getVetResponse(
  text: string,
  imageData?: { base64: string; mimeType: string },
  sessionId: string = "default"
): Promise<string> {
  try {
    const history = getOrCreateChat(sessionId); // full history array for the session

    // current user message parts
    const userParts: (string | Part)[] = [];
    if (text && text.trim()) {
      userParts.push(text);
    }
    if (imageData) {
      const imagePart = createImagePart(imageData);
      if (userParts.length === 0) {
        userParts.push("Please examine this image."); // placeholder text if only image exists
      }
      userParts.push(imagePart);
    }


    if (userParts.length === 0) {
      console.error("Attempted to send an empty message.");
      return "Sorry, I need either text or an image to respond. 🐾";
    }


    const apiHistory = formatHistoryForApi(history);
    console.log(`[${sessionId}] History length for API: ${apiHistory.length}`);


    //  Start chat 
    const chat = model.startChat({
      history: apiHistory, 
      generationConfig: {
        maxOutputTokens: 2048,
        // temperature, topP, topK for creativity/focus control
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      },
    });

    console.log(`[${sessionId}] Sending user message parts...`);
    const result = await chat.sendMessage(
      userParts.map((part) =>
        typeof part === "string" ? { text: part } : part
      )
    ); 
    const responseText = result.response.text();

    if (!responseText) {
      const errorMessage =
        "Oh no! 😿 I'm having a little trouble responding right now. Could you please try again? Your furry friend's health is important to me! 🐾";
      console.error(`[${sessionId}] Gemini API returned empty response.`);
      return errorMessage;
    }

    console.log(`[${sessionId}] Received AI response.`);

    //  Update internal history
    // Adding the user message that was just sent
    history.push({
      role: "user",
      parts: userParts, 
    });

    // Adding the AI response received
    history.push({
      role: "model",
      parts: [responseText], 
    });

    // history management
    if (history.length > 20) {
      console.log(
        `[${sessionId}] Trimming history from ${history.length} entries.`
      );
      const systemMessages = history.slice(0, 2); // initial user + system prompt
      const recentMessages = history.slice(-18); 
      chatHistory[sessionId] = [...systemMessages, ...recentMessages];
      console.log(
        `[${sessionId}] History trimmed to ${chatHistory[sessionId].length} entries.`
      );
    }

    return responseText;
  } catch (error: any) {
    console.error(`[${sessionId}] Error calling Gemini API:`, error);
    let displayError =
      "Woofs! 🐶 I'm having a little technical hiccup right now. Could you please try again in a moment? I'm eager to help you and your precious pet! 💕";
    if (error.message && error.message.includes("quota")) {
      displayError =
        "Oh dear! 😥 It seems I'm quite popular right now and have reached my usage limit. Please try again later. Your pet's health matters! 🏥";
    } else if (error.message && error.message.includes("SAFETY")) {
      displayError =
        "Hmm, I couldn't process that request due to safety filters. 🛡️ Could you try rephrasing your question or providing a different image? Let's keep our chat safe and helpful! ❤️";
    } else if (error.message) {
    }
    return displayError;
  }
}
