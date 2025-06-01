"use client";

import { useState, useRef, useEffect } from "react";
import {
  User,
  Stethoscope,
  Image as ImageIcon,
  Heart,
  MoveUpRight,
  PawPrint as Paw,
} from "lucide-react";
import gsap from "gsap";
import { useUserStore } from "@/stores/user-store"; 

import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: number;
  sender: "user" | "ai";
  text: string;
  imageUrl?: string;
  imageData?: { base64: string; mimeType: string };
}

export default function VetChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { userData } = useUserStore(); 
  const isMobile = useIsMobile();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestAiMessageRef = useRef<HTMLDivElement>(null);
  const greetingRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const loadingDotsRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    //  get session ID from local storage on component mount
    const storedSessionId = localStorage.getItem("vetchat_session_id");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Check if the click is outside the form
      const formElement = document.querySelector(".input-container");
      if (formElement && !formElement.contains(e.target as Node)) {
        setIsInputFocused(false);
      }
    };

    // Add event listener
    document.addEventListener("click", handleDocumentClick);

    // Clean up
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    const latestAiMessageElement =
      messagesEndRef.current?.previousElementSibling;

    if (
      latestAiMessageElement &&
      latestAiMessageElement.classList.contains("ai-message")
    ) {
      const textElement = latestAiMessageElement.querySelector(
        ".ai-text-content"
      ) as HTMLDivElement;

      if (textElement) {
        const textContent = textElement.textContent || "";
        textElement.textContent = "";

        const characters = textContent.split("");
        characters.forEach((char) => {
          const span = document.createElement("span");
          span.textContent = char;
          span.style.opacity = "0";
          textElement.appendChild(span);
        });

        gsap.to(textElement.querySelectorAll("span"), {
          opacity: 1,
          stagger: 0.015, 
          duration: 0.3,
          ease: "power2.out", 
        });
      }
    }
  }, [messages]);

  useEffect(() => {
    if (greetingRef.current && showGreeting) {
      gsap.fromTo(
        greetingRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "back.out(1.7)" }
      );

      const pawElements = document.querySelectorAll(".paw-icon");
      gsap.fromTo(
        pawElements,
        { scale: 0, rotation: -30 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "elastic.out(1.2, 0.5)",
          delay: 0.5,
        }
      );
    }
  }, [showGreeting]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = inputRef.current.scrollHeight + "px";
    }
  }, [inputMessage]);

  // Focus animation effect - only for desktop
  useEffect(() => {
    if (!isMobile) {
      if (isInputFocused) {
        gsap.to(".input-container", {
          width: "45%",
          duration: 0.15,
          ease: "power3.out",
        });
      } else {
        gsap.to(".input-container", {
          width: "30%",
          duration: 0.15,
          ease: "power3.in",
        });
      }
    }
  }, [isInputFocused, isMobile]);

  // Animation for loading dots
  useEffect(() => {
    if (isLoading && loadingDotsRef.current) {
      const dots = loadingDotsRef.current.querySelectorAll(".loading-dot");

      gsap.to(dots, {
        y: -8,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.15,
        repeat: -1,
        yoyo: true,
      });
    }
  }, [isLoading]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const base64Data = reader.result.split(",")[1];
          resolve(base64Data);
        } else {
          reject(new Error("Failed to read file as base64"));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if ((!inputMessage.trim() && !selectedImage) || isLoading) {
      return;
    }

    if (showGreeting) {
      setShowGreeting(false);

      if (greetingRef.current) {
        gsap.to(greetingRef.current, {
          y: -50,
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
          onComplete: () => {
            setShowGreeting(false);
          },
        });
      }
    }

    setIsLoading(true);

    let imageDataToSend: { base64: string; mimeType: string } | undefined =
      undefined;
    let imageUrlForDisplay: string | undefined = undefined;

    if (selectedImage) {
      try {
        const base64 = await fileToBase64(selectedImage);
        imageDataToSend = { base64, mimeType: selectedImage.type };
        imageUrlForDisplay = URL.createObjectURL(selectedImage);
      } catch (error) {
        console.error("Error reading image file:", error);
        setIsLoading(false);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now() + 1,
            sender: "ai",
            text: "Sorry, I had trouble processing that image. Please try a different image or format.",
          },
        ]);
        return;
      }
    }

    const newUserMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: inputMessage,
      imageUrl: imageUrlForDisplay,
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    const loadingMessageId = Date.now() + 1;
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: loadingMessageId,
        sender: "ai",
        text: "loading", 
      },
    ]);

    const requestBody: {
      text: string;
      imageData?: { base64: string; mimeType: string };
    } = {
      text: inputMessage,
    };
    if (imageDataToSend) {
      requestBody.imageData = imageDataToSend;
    }

    setInputMessage("");
    setSelectedImage(null);

    const fileInput = document.getElementById(
      "imageUpload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }

    try {
      const formData = new FormData();
      formData.append("text", inputMessage);

      if (imageDataToSend) {
        formData.append("imageData", JSON.stringify(imageDataToSend));
      }

      const response = await fetch("/api/users/vetchat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponseText = data.response;

      // session ID if returned from the API
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem("vetchat_session_id", data.sessionId);
      }

      // Replace  loading message with ai response
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === loadingMessageId ? { ...msg, text: aiResponseText } : msg
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);

      // Replace loading message with error message
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === loadingMessageId
            ? { ...msg, text: "Sorry, something went wrong. Please try again." }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      if (imageUrlForDisplay) {
        URL.revokeObjectURL(imageUrlForDisplay);
      }
    }
    setIsInputFocused(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    const fileInput = document.getElementById(
      "imageUpload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // loading dots component
  const LoadingDots = () => (
    <div
      ref={loadingDotsRef}
      className="flex items-center justify-center space-x-2 h-6 mt-1"
    >
      <div className="loading-dot w-2 h-2 rounded-full bg-white"></div>
      <div className="loading-dot w-2 h-2 rounded-full bg-white"></div>
      <div className="loading-dot w-2 h-2 rounded-full bg-white"></div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-red-50 text-gray-800 overflow-y-hidden">
      <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full mt-10 relative">
        {showGreeting && (
          <div
            ref={greetingRef}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-25 rounded-xl shadow-xl text-center backdrop-blur-md border border-white border-opacity-20 ${
              isMobile 
                ? 'p-4 max-w-xs w-[85%]' 
                : 'p-8 max-w-lg w-full'
            }`}
            style={{
              background: "rgba(255, 255, 255, 0.25)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.18)",
            }}
          >
            <div className="flex justify-center mb-4">
              <Paw size={isMobile ? 20 : 28} className="text-pink-500 paw-icon" />
              <Paw size={isMobile ? 20 : 28} className="text-blue-500 paw-icon ml-3" />
              <Paw size={isMobile ? 20 : 28} className="text-pink-500 paw-icon ml-3" />
            </div>
            <h1 className={`font-bold mb-2 text-pink-600 ${isMobile ? 'text-xl' : 'text-3xl'}`}>
              Dr. Whisker&apos;s Pet Clinic
            </h1>
            <p className={`mb-4 text-blue-600 ${isMobile ? 'text-sm' : 'text-lg'}`}>
              Hello! I&apos;m Dr. Whisker, your friendly virtual vet.
            </p>
            <p className={`text-gray-700 ${isMobile ? 'text-xs' : 'text-base'}`}>
              Share your concerns about your furry friend, and I&apos;ll help
              with advice and suggestions. Feel free to upload a photo if
              needed!
            </p>
            <div className="mt-4 flex justify-center">
              <Heart size={isMobile ? 16 : 24} className="text-pink-500" />
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 mb-4 ${
              message.sender === "user" ? "justify-end" : ""
            } ${message.sender === "ai" ? "ai-message" : ""}`}
          >
            {message.sender === "ai" && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center shadow-md">
                  <Stethoscope size={20} color="#fff" />
                </div>
              </div>
            )}
            <div
              className={`p-4 rounded-2xl shadow-md ${
                message.sender === "user"
                  ? "bg-blue-400 text-white"
                  : "bg-pink-400 text-white"
              } max-w-sm`}
              style={{
                boxShadow:
                  message.sender === "user"
                    ? "0 4px 16px rgba(59, 130, 246, 0.3)"
                    : "0 4px 16px rgba(236, 72, 153, 0.3)",
              }}
            >
              {message.imageUrl && (
                <img
                  src={message.imageUrl}
                  alt="User's pet image"
                  className="rounded-lg mb-2 max-w-full h-auto border-2 border-white"
                />
              )}
              {message.text === "loading" ? (
                <LoadingDots />
              ) : (
                <div
                  className="ai-text-content"
                  ref={message.sender === "ai" ? latestAiMessageRef : null}
                >
                  {message.text}
                </div>
              )}
            </div>
            {message.sender === "user" && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-md overflow-hidden">
                  {userData.image ? (
                    <img 
                      src={userData.image} 
                      alt="User profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={20} color="#fff" />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 flex justify-center items-center py-6 bg-gradient-to-t from-blu5 to-transparent">
        <form
          onSubmit={(e) => {
            handleSendMessage(e);
            setIsInputFocused(false); 
          }}
          className={`input-container flex items-center space-x-2 rounded-full transition-all duration-300 mb-4 ${
            isMobile 
              ? 'w-[90%] p-2 min-h-[48px]' 
              : 'w-[30%] p-3'
          }`}
          style={{
            background: "rgba(255, 255, 255, 0.25)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
          }}
        >
          <label
            htmlFor="imageUpload"
            className="cursor-pointer p-2 rounded-full bg-blue-400 bg-opacity-70 text-white hover:bg-blue-500 transition flex-shrink-0"
          >
            <ImageIcon size={20} />
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
          </label>

          {selectedImage && (
            <div className="flex items-center space-x-1 bg-blue-50 bg-opacity-50 p-1 rounded-full border border-blue-200 border-opacity-50 flex-shrink-0">
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected pet image preview"
                className="w-6 h-6 object-cover rounded-full border border-blue-300"
              />
              <button
                type="button"
                onClick={handleClearImage}
                className="text-pink-500 hover:text-pink-700 bg-pink-100 bg-opacity-50 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                aria-label="Clear selected image"
              >
                &times;
              </button>
            </div>
          )}

          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
                setIsInputFocused(false); 
              }
            }}
            placeholder={
              selectedImage
                ? "Add a message about your pet's photo..."
                : "Ask Dr. Whisker about your pet..."
            }
            className="flex-1 p-2 rounded-full outline-none resize-none bg-transparent min-h-10 max-h-24 text-gray-700"
            rows={1}
            disabled={isLoading}
          />

          <button
            type="submit"
            className="p-2 bg-pink-400 bg-opacity-70 text-white rounded-full hover:bg-pink-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
            onClick={() => {
            }}
          >
            {isLoading ? (
              <div className="w-5 h-5 flex items-center justify-center">
                <MoveUpRight size={20} className="animate-pulse" />
              </div>
            ) : (
              <MoveUpRight size={20} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}