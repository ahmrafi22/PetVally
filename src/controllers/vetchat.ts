import { GoogleGenerativeAI, GenerativeModel, Part, Content } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY as string;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set.');
}

const genAI = new GoogleGenerativeAI(apiKey);
// use 'gemini-1.5-flash-latest' or 'gemini-1.5-pro-latest' or 'gemini-2.0-flash' models 
const model: GenerativeModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }); 

// Interface for conversation message
interface ConversationMessage {
  role: 'user' | 'model';
  parts: (string | Part)[]; // Keep internal history flexible
}

// Store chat history by session ID
const chatHistory: Record<string, ConversationMessage[]> = {};

/**
 * Creates a Part object from base64 image data for the Gemini API.
 */
function createImagePart(imageData: { base64: string; mimeType: string }): Part {
  return {
    inlineData: {
      data: imageData.base64,
      mimeType: imageData.mimeType,
    },
  };
}

/**
 * Gets or creates a chat for a given session ID
 */
function getOrCreateChat(sessionId: string): ConversationMessage[] { // Return type annotation
  if (!chatHistory[sessionId]) {
    console.log(`Creating new chat history for session: ${sessionId}`);
    chatHistory[sessionId] = [];

    // Add system prompt first using the 'system' role if the model/SDK supports it,
    // otherwise, structure it carefully within user/model turns.
    // For simplicity with startChat history, we'll keep the initial user/model structure
    // but ensure the history passed to startChat is valid.

    // 1. Initial Dummy User Message (to ensure history starts with 'user')
    chatHistory[sessionId].push({
      role: 'user',
      parts: ['Hello, I need help with my pet.'], // This is a placeholder to start the conversation
    });

    // 2. System Prompt as the first 'model' response
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
      role: 'model',
      parts: [systemPrompt],
    });
  } else {
     console.log(`Using existing chat history for session: ${sessionId}`);
  }
  return chatHistory[sessionId];
}

/**
 * Converts internal ConversationMessage format to the API's Content format.
 */
function formatHistoryForApi(history: ConversationMessage[]): Content[] {
    // Filter out the initial placeholder user message if it's still the default one
    // and only the system prompt follows it. This prevents the "Hello..." message
    // from potentially confusing the AI on subsequent turns if the user's *actual* first message
    // hasn't been added yet.
    const startIndex = 0;
    if (
        history.length >= 2 &&
        history[0].role === 'user' &&
        history[0].parts.length === 1 &&
        typeof history[0].parts[0] === 'string' &&
        history[0].parts[0] === 'Hello, I need help with my pet.' &&
        history[1].role === 'model' // Check if the next is the system prompt
       ) {
           // If the history only contains the placeholder and the system prompt,
           // start the API history from the system prompt (index 1).
           // The user's *actual* first message will be sent via sendMessage.
           // If more messages exist, include the placeholder.
           // Update: The API still requires the history *array* to start with user.
           // So, we cannot skip index 0 here. We will send the full history
           // including the placeholder. The model should be robust enough.
           // startIndex = 1; // Reverted this logic - API needs user first in array.
       }


  return history.slice(startIndex).map(message => ({ // Use slice if needed, but startChat needs user first
    role: message.role,
    // Map parts correctly: string -> { text: string }, image -> Part object
    parts: message.parts.map(part => {
      if (typeof part === 'string') {
        return { text: part }; // Correct format for text parts
      } else {
        // Assuming 'part' is already a valid Part object (like from createImagePart)
        return part;
      }
    }),
  }));
}


/**
 * Sends a message (text and optional image) to the Gemini API
 * and gets a warm, empathetic vet response with appropriate pet care advice.
 * @param text The user's text message. Can be empty if image is provided.
 * @param imageData Optional object containing base64 and mimeType of an image.
 * @param sessionId Unique identifier for the user's chat session.
 * @returns A Promise that resolves to the AI's response text.
 */
export async function getVetResponse(
  text: string,
  imageData?: { base64: string; mimeType: string },
  sessionId: string = 'default'
): Promise<string> {
  try {
    const history = getOrCreateChat(sessionId); // Get the full history array for the session

    // --- Prepare current user message parts ---
    const userParts: (string | Part)[] = [];
    if (text && text.trim()) { // Only add text part if text is not empty
        userParts.push(text);
    }
    if (imageData) {
      const imagePart = createImagePart(imageData);
      // If text is empty, maybe add a placeholder text prompt for the image?
      if (userParts.length === 0) {
          userParts.push("Please examine this image."); // Add placeholder text if only image exists
      }
      userParts.push(imagePart);
    }

    // Ensure there's something to send
    if (userParts.length === 0) {
        // This case should ideally be caught by the API route, but double-check
        console.error("Attempted to send an empty message.");
        return "Sorry, I need either text or an image to respond. 🐾";
    }

    // --- Prepare history for the API ---
    // The history for startChat should contain all messages *before* the current user message.
    const apiHistory = formatHistoryForApi(history);
    console.log(`[${sessionId}] History length for API: ${apiHistory.length}`);
    // console.log(`[${sessionId}] API History:`, JSON.stringify(apiHistory, null, 2)); // Careful logging potentially large data


    // --- Start chat & Send message ---
    // console.log(`[${sessionId}] Starting chat with history...`);
    const chat = model.startChat({
      history: apiHistory, // Pass the formatted history *before* the current message
      generationConfig: {
        maxOutputTokens: 2048,
        // Consider adding temperature, topP, topK for creativity/focus control
        // temperature: 0.7,
        // topP: 0.9,
        // topK: 40,
      },
    });

    console.log(`[${sessionId}] Sending user message parts...`);
    const result = await chat.sendMessage(userParts.map(part => (typeof part === 'string' ? { text: part } : part))); // Send current message (ensure parts are correctly formatted)
    const responseText = result.response.text();

    if (!responseText) {
      const errorMessage = "Oh no! 😿 I'm having a little trouble responding right now. Could you please try again? Your furry friend's health is important to me! 🐾";
      console.error(`[${sessionId}] Gemini API returned empty response.`);
      return errorMessage;
    }

     console.log(`[${sessionId}] Received AI response.`);

    // --- Update internal history ---
    // Add the user message that was just sent
    history.push({
      role: 'user',
      parts: userParts // Store the original flexible format
    });
    // Add the AI response received
    history.push({
      role: 'model',
      parts: [responseText] // Store the original flexible format
    });

    // --- Trim history ---
    if (history.length > 20) { // Keep total history size manageable
        // Keep the first two messages (initial user + system prompt) and the latest N messages
        console.log(`[${sessionId}] Trimming history from ${history.length} entries.`);
        const systemMessages = history.slice(0, 2); // Keep initial user + system prompt
        const recentMessages = history.slice(-18); // Keep the last 18 turns (9 user + 9 model)
        chatHistory[sessionId] = [...systemMessages, ...recentMessages];
        console.log(`[${sessionId}] History trimmed to ${chatHistory[sessionId].length} entries.`);
    }

    return responseText;

  } catch (error: any) { // Add type annotation for error
    // Log the specific Gemini error if possible
    console.error(`[${sessionId}] Error calling Gemini API:`, error);
     let displayError = "Woofs! 🐶 I'm having a little technical hiccup right now. Could you please try again in a moment? I'm eager to help you and your precious pet! 💕";
     if (error.message && error.message.includes('quota')) {
        displayError = "Oh dear! 😥 It seems I'm quite popular right now and have reached my usage limit. Please try again later. Your pet's health matters! 🏥";
     } else if (error.message && error.message.includes('SAFETY')) {
        displayError = "Hmm, I couldn't process that request due to safety filters. 🛡️ Could you try rephrasing your question or providing a different image? Let's keep our chat safe and helpful! ❤️";
     } else if (error.message) {
         // Optionally include parts of the error message if safe/useful
         // console.error("Underlying error message:", error.message);
     }
    return displayError;
  }
}

// Optional: Clean up old sessions periodically (consider adding lastUsed timestamp)
const HOUR_IN_MS = 60 * 60 * 1000;
interface SessionEntry {
    history: ConversationMessage[];
    lastUsed: number;
}
const sessionStore: Record<string, SessionEntry> = {}; // Example using a store with timestamps

// Modify getOrCreateChat to use sessionStore and update lastUsed
// Modify history trimming/management logic to use sessionStore

// Simple interval cleanup (placeholder)
setInterval(() => {
  const now = Date.now();
  const cleanedCount = 0;
  Object.keys(chatHistory).forEach(sessionId => {
    // You'd need to track the last interaction time for each session
    // For now, this is just a placeholder structure
    const expirationTime = 24 * HOUR_IN_MS; // e.g., 24 hours
    // if (now - (sessionStore[sessionId]?.lastUsed ?? 0) > expirationTime) {
    //   delete chatHistory[sessionId];
    //   delete sessionStore[sessionId]; // Also remove from timestamp store
    //   cleanedCount++;
    // }
  });
  if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} inactive chat sessions.`);
  }
}, 6 * HOUR_IN_MS); // Run cleanup every 6 hours