
'use client';

import { useRef, useState } from 'react';

import { Send, Loader } from 'lucide-react';
import { ChatModeSelector } from '@/components/Ai_feature/chat-mode-selector';
import { PersonalizedRecommendationFlow, PERSONALIZATION_QUESTIONS } from '@/components/Ai_feature/presonalized-recommendation-flow';
import { FreeChatFlow } from '@/components/Ai_feature/free-chat-flow';
import { Content, GoogleGenAI } from '@google/genai';
import { env } from '@/env.mjs';
import { error } from 'console';
import { useLoadingStore } from '@/stores/loading';
import React from 'react';
import MovieService from '@/services/MovieService';
import { Show } from '@/types';
import CustomImage from '@/components/custom-image';
import { ShowCard } from '@/components/shows-carousel';
import { useModalStore } from '@/stores/modal';
import ShowModal from '@/components/shows-modal';
interface SearchResult {
  results: Show[];
}

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

interface Movie {
  id: string;
  title: string;
  cover: string;
  description: string;
  rating: string;
}

export default function RecommendationsPage() {
  // Chat mode state: 'selector' | 'personalized' | 'free'
  const [chatMode, setChatMode] = useState<'selector' | 'personalized' | 'free'>('selector');
    const ai = new GoogleGenAI({apiKey : env.NEXT_PUBLIC_GEMINI_API_KEY});
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Show[]>([]);
  const [personalizationAnswers, setPersonalizationAnswers] = useState<Record<number, string>>({});
  const [activeTab, setActiveTab] = useState<'chat' | 'recommendations'>('chat'); // Mobile tab switching
  const content = useRef<Content[]>([]);
  let geminiLimitReached = useRef(false);
  let geminiLiteLimitReached = useRef(false);
   const modalStore = useModalStore();
const currentDate = new Date().toISOString().split("T")[0];
    React.useEffect(() => {
      useLoadingStore.getState().hide();
      
    }, []);
  

  // LOGIC BREAKDOWN:
  // 1. User first sees ChatModeSelector with 2 buttons
  // 2. Based on selection, chatMode changes to 'personalized' or 'free'
  // 3. For 'personalized': PersonalizedRecommendationFlow shows 7 questions
  // 4. After all questions answered, recommendations are generated
  // 5. User can then continue chatting in the same context

  const handleModeSelection = (mode: 'personalized' | 'free') => {
    setChatMode(mode);
    
    if (mode === 'personalized') {
      // Add AI message for personalized mode
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'model',
        content: "Great! Let's find the perfect movie for you. I'll ask you 7 quick questions to understand your preferences.",
      };
      setMessages((prev) => [...prev, aiMessage]);
      content.current.push({role : "user" ,parts : [{text : "movie/tvshow recommendation"}]})
    } else {
      content.current.push({role : "user" ,parts : [{text : "free chat mode"}]})
    }
  };

  const handlePersonalizationComplete = async (answers: Record<number, string>) => {
    // Save the answers
    setPersonalizationAnswers(answers);
    
    // Create a summary message of the answers
    const answerSummary = Object.entries(answers)
      .map(([questionId, answer]) => {
        const question = PERSONALIZATION_QUESTIONS[parseInt(questionId) - 1];
        return `${question.question}\nAnswer: ${answer}`;
      })
      .join('\n\n');

    // Add user message with their answers
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: answerSummary,
    };
    setMessages((prev) => [...prev, userMessage]);
    
        setIsLoading(true);
    content.current.push({role : userMessage.role ,parts : [{text : userMessage.content}]})
      const recommendations = await handleSendMessageGemini();
      if (recommendations) {
        await fetchRecommendedMovies(recommendations)
      }
  };
  const handleOpenRouterApi = async (): Promise<[string] | null> => {
  
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${env.NEXT_PUBLIC_OPEN_ROUTER_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "openai/gpt-oss-120b:free",
    messages: [
      {
        role: "system",
       content : `You are Filmoozo, a movie and TV show expert assistant. You can only discuss movies, TV shows, actors, directors, streaming platforms, industry news, recommendations, reviews, and related topics; if asked about anything outside this domain, politely decline. You operate in two modes: (1) Free Chat Mode: answer questions about movies and TV shows using conversation history when relevant and keep answers concise. (2) Recommendation Mode: the user may answer up to 7 recommendation questions, some answers may be empty because they were skipped, and based on the provided answers you must recommend the 3 most suitable movies or TV shows; if the user asks for more recommendations later, provide different recommendations. You receive the entire conversation history; answer only the latest user message while using previous messages as context. Today's date is ${currentDate}. For any time-sensitive question involving release dates, upcoming seasons, movie announcements, casting news, renewals, cancellations, streaming availability, production status, or industry news, always reason using today's date which is ${currentDate}, prioritize web search results when available, verify whether the event has already happened or is still in the future relative to today's date, never describe something as upcoming if its release date is before today's date, and never describe something as already released if its release date is after today's date. You must ALWAYS respond with a valid JSON object and nothing else using this exact format: {"message": "Your response to display in the chat", "recommendations" : []}. In Free Chat Mode, you put response in the message property of the json object and leave recommendations property  an empty array. In Recommendation Mode, recommendations property must contain only the recommended movie or TV show titles as strings and The message property  contain your response which is explanations, descriptions, reasoning, release dates, cast information, reviews, or other movie/TV related information. The recommendations property array must contain only titles and no extra text. Never output anything outside the JSON object.`
       // content: "based on the date of today , you are a movies/tvshows expert named assistant filmoozo, you know all movies and tvshows and you follow  all the latest news of them , you can only answer questions related to movies or tv series industry anything you decline politly ,there will be 2 possible context in the chat , one is free chat mode and the second is movie/tvshow recommendation where user will answer 7 questions static in front and based on answers you will recommend top 3 accurate recommendations based on their answers ,some questions might have an empty response because user skipped them , after you send recommendations if user request other recomendations you recommend something else . you answer in maximum 2 lines. if a question or a message i ask you and you answer after it , dont re answer it again in future questions , im prioviding you with content with role user or model so answer only last content that dont have a model answer after them but use the previous content to enrich your answers in case i go back to ask you something about an old answer of yours "
      },
     ...content.current.map(message => ({
        role: message.role,
        content: message.parts?.[0].text
     }))
    ],
 
   tools: [
      { type: 'openrouter:web_search', parameters: { max_results: 3 } }
    ]
  }),
});

const data = await res.json();
const response = data.choices[0].message.content ?? "";


  const dataToParse = JSON.parse(response);

  const message = dataToParse.message;
  const recommendations = dataToParse.recommendations;
  
         const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: message?? " errorrr",
      };
        content.current.push({role : "assistant" ,parts : [{text : aiMessage.content}]})
      setMessages((prev) => [...prev, aiMessage]);

      setIsLoading(false);
      if (data.choices[0].message.content) {
        return recommendations
      }else{
        return null
      }
     // "openrouter/free"
// nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free
// "tencent/hy3-preview-20260421:free"
// "poolside/laguna-xs.2-20260421:free"
//"openai/gpt-oss-120b:free" 
  };



  const handleSendMessageGemini = async (text? :string): Promise<[string] | null> => {
    let activeModel = "gemini-2.5-flash"; 

try {

  if (text && text.trim() !== "" && isLoading == false) {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };
 
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
   
    content.current.push({role : userMessage.role ,parts : [{text : userMessage.content}]})
  }
  if (geminiLimitReached.current) {
    
    activeModel = "gemini-2.5-flash-lite";
  }
  
  if (geminiLiteLimitReached.current) {
    return handleOpenRouterApi();
  }


 const result = await ai.models.generateContent({
      model: activeModel,
      contents: content.current,
    
      config: {
        systemInstruction : { role : "system",
           parts : [{ 
       text : `You are Filmoozo, a movie and TV show expert assistant. You can only discuss movies, TV shows, actors, directors, streaming platforms, industry news, recommendations, reviews, and related topics; if asked about anything outside this domain, politely decline. You operate in two modes: (1) Free Chat Mode: answer questions about movies and TV shows using conversation history when relevant and keep answers concise. (2) Recommendation Mode: the user may answer up to 7 recommendation questions, some answers may be empty because they were skipped, and based on the provided answers you must recommend the 3 most suitable movies or TV shows; if the user asks for more recommendations later, provide different recommendations. You receive the entire conversation history; answer only the latest user message while using previous messages as context. Today's date is ${currentDate}. For any time-sensitive question involving release dates, upcoming seasons, movie announcements, casting news, renewals, cancellations, streaming availability, production status, or industry news, always reason using today's date which is ${currentDate}, prioritize web search results when available, verify whether the event has already happened or is still in the future relative to today's date, never describe something as upcoming if its release date is before today's date, and never describe something as already released if its release date is after today's date. You must ALWAYS respond with a valid JSON object and nothing else using this exact format: {"message": "Your response to display in the chat", "recommendations" : []}. In Free Chat Mode, you put response in the message property of the json object and leave recommendations property  an empty array. In Recommendation Mode, recommendations property must contain only the recommended movie or TV show titles as strings and The message property  contain your response which is explanations, descriptions, reasoning, release dates, cast information, reviews, or other movie/TV related information. The recommendations property array must contain only titles and no extra text. Your response must begin with the character '{' and end with the character '}'. You must NEVER include conversational greetings, introductions, or pleasantries outside of the JSON structure. Do not repeat your response outside the JSON blocks. Example of a perfectly formatted response:{"message": "Your text here", "recommendations": ["Title 1"]}`
                  }]},
        tools : [{ googleSearch: {} }], 
        temperature: 1.0,
        
      }
    });
      const response = result.text ?? "";


  const data = JSON.parse(response);

  const message = data.message;
  const recommendations = data.recommendations;
   
         const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: message ?? " errorrr",
      };
        content.current.push({role : aiMessage.role ,parts : [{text : aiMessage.content}]})
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
      return recommendations
    }
      catch (error : any) {
       
    if (activeModel ==  "gemini-2.5-flash"){
      geminiLimitReached.current = true
      
    }
    else {
      geminiLiteLimitReached.current = true
    }
          return handleSendMessageGemini()

}
    // Simulate AI response delay
    // setTimeout(() => {
    //   let responseContent = "Great! I've found some amazing recommendations for you based on what you said. Check them out below!";
      
    //   // If in personalized mode and already have recommendations, offer follow-up
    //   if (chatMode === 'personalized' && recommendations.length > 0) {
    //     responseContent = "Got it! I can help with that. Would you like different recommendations based on this new preference, or do you have questions about the current picks?";
    //   }
      
    //   const aiMessage: Message = {
    //     id: (Date.now() + 1).toString(),
    //     role: 'model',
    //     content: responseContent,
    //   };
    //   setMessages((prev) => [...prev, aiMessage]);
      
    //   // Only set new recommendations if we don't have any yet
    //   if (recommendations.length === 0) {
    //     setRecommendations(mockMovies);
    //   }
      
    //   setIsLoading(false);
    // }, 1000);
  };

const fetchRecommendedMovies = async (movieNames : [string]) => {
  movieNames.forEach(movie => {
      MovieService.searchMovies(movie)
          .then((response: SearchResult) => {
           var  movie = response.results[0]
           setRecommendations((prev) => [...prev, response.results[0]]);
            
          })
          .catch((e) => {
            console.error(e);
          })
  })
  setActiveTab('recommendations');

}

  return (
    <div className="min-h-screen bg-background">
    
 {modalStore.open && <ShowModal />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        {/* Desktop Layout */}

        
        <div className="hidden lg:flex gap-8">
          {/* Chat Section - Animates to left when recommendations appear */}
          <div className={`flex flex-col h-[700px] bg-card/30 border border-border rounded-lg shadow-lg transition-all duration-500 flex-shrink-0 ${
            recommendations.length > 0 ? 'w-2/5' : 'w-full'
          }`}>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Show messages */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs sm:max-w-sm md:max-w-lg px-4 py-3 rounded-xl text-sm sm:text-base leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none shadow-md'
                        : 'bg-secondary text-secondary-foreground rounded-bl-none'
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                </div>
              ))}

              {/* Show Mode Selector if no mode selected yet */}
              {chatMode === 'selector' && messages.length < 1 && (
                <div className="mt-4">
                  <ChatModeSelector onSelectMode={handleModeSelection} />
                </div>
              )}

              {/* Show Personalized Recommendation Flow if in personalized mode and no recommendations yet */}
              {chatMode === 'personalized' && messages.length <= 1 && (
                <div className="mt-4">
                  <PersonalizedRecommendationFlow onQuestionsComplete={handlePersonalizationComplete} />
                </div>
              )}

              {/* Show Free Chat Flow if in free mode */}
              {chatMode === 'free' && messages.length < 1 &&(
                <div className="mt-4">
                  <FreeChatFlow  isLoading={isLoading} />
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-xl rounded-bl-none flex items-center gap-2">
                    <Loader size={18} className="animate-spin" />
                    <span className="text-sm font-medium">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Section - Only show if mode is selected and not in question flow */}
            {chatMode !== 'selector' && (
              <div className="border-t border-border p-4 sm:p-6 flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleSendMessageGemini(inputValue);
                    }
                  }}
                  placeholder="Tell me what you think..."
                  className="flex-1 bg-input border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background transition-all"
                />
                <button
                  onClick={() => handleSendMessageGemini(inputValue)}
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <Send size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Recommendations Section - Slides in from right when available */}
          <div className={`flex-1 transition-all duration-500 transform ${
            recommendations.length > 0 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 translate-x-12 pointer-events-none'
          }`}>
            <div className="mb-8 lg:mb-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">Your Recommendations</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                {recommendations.length > 0
                  ? 'Based on your preferences, here are our top picks:'
                  : 'Chat with AI to get personalized movie recommendations'}
              </p>
            </div>

            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {recommendations.map((show, idx) => (
                  <div
                    key={show.id}
                    className="group cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                       
    <div key={(show.id ?? "") || idx} className="group relative  overflow-hidden rounded-lg">
      
      {/* 2. THE "WATCH NOW" OVERLAY */}
      {/* It is visible by default, but group-hover:opacity-0 hides it when the card is hovered */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 text-white transition-opacity duration-300 group-hover:pointer-events-none group-hover:opacity-0">
        {/* Play Icon (SVG) */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="currentColor" 
          viewBox="0 0 24 24" 
          className="mb-2 h-12 w-12 text-primary drop-shadow-md"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      <h1 className="text-xl font-bold text-foreground mb-2">
          Watch Now
        </h1>
      </div>

      {/* 3. YOUR EXISTING SHOWCARD */}
      <ShowCard show={show} />

    </div>
        
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-16 border border-dashed border-border rounded-xl">
                <div className="text-center">
                  <div className="text-5xl mb-4">🎬</div>
                  <p className="text-lg font-medium text-foreground mb-2">No recommendations yet</p>
                  <p className="text-muted-foreground">Start the conversation to get personalized suggestions</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout - Tab-based switching */}


        <div className="lg:hidden">
          {/* Tab Buttons */}
          {recommendations.length > 0 && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'chat'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'recommendations'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                Recommendations
              </button>
            </div>
          )}

          {/* Chat Tab Content */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[800px] bg-card border border-border rounded-lg shadow-lg">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-3 rounded-xl text-sm leading-relaxed ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-none shadow-md'
                          : 'bg-secondary text-secondary-foreground rounded-bl-none'
                      }`}
                    >
                      <p>{message.content}</p>
                    </div>
                  </div>
                ))}

                {chatMode === 'selector' && messages.length < 1 && (
                  <div className="mt-12">
                    <ChatModeSelector onSelectMode={handleModeSelection} />
                  </div>
                )}

                {chatMode === 'personalized' && messages.length <= 1 && (
                  <div className="mt-4">
                    <PersonalizedRecommendationFlow onQuestionsComplete={handlePersonalizationComplete} />
                  </div>
                )}

                {chatMode === 'free' && messages.length < 1 && (
                  <div className="mt-4">
                    <FreeChatFlow isLoading={isLoading} />
                  </div>
                )}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-xl rounded-bl-none flex items-center gap-2">
                      <Loader size={18} className="animate-spin" />
                      <span className="text-sm font-medium">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {chatMode !== 'selector' && (
                <div className="border-t border-border p-4 flex gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isLoading) {
                        handleSendMessageGemini(inputValue);
                      }
                    }}
                    placeholder="Tell me what you think..."
                    className="flex-1 bg-input border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => handleSendMessageGemini(inputValue)}
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground px-4 py-3 rounded-lg transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Recommendations Tab Content */}
          {activeTab === 'recommendations' && recommendations.length > 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Your Recommendations</h2>
                <p className="text-sm text-muted-foreground">Based on your preferences, here are our top picks:</p>
              </div>

           <div className="grid grid-cols-1 gap-6">
  {recommendations.map((show, idx) => (
    /* 1. Added 'group' to track hover state, and 'relative' to anchor the absolute badge */
    <div key={show.id || idx} className="group relative  overflow-hidden rounded-lg">
      
      {/* 2. THE "WATCH NOW" OVERLAY */}
      {/* It is visible by default, but group-hover:opacity-0 hides it when the card is hovered */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 text-white transition-opacity duration-300 group-hover:pointer-events-none group-hover:opacity-0">
        {/* Play Icon (SVG) */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="currentColor" 
          viewBox="0 0 24 24" 
          className="mb-2 h-12 w-12 text-primary drop-shadow-md"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      <h1 className="text-xl font-bold text-foreground mb-2">
          Watch Now
        </h1>
      </div>

      {/* 3. YOUR EXISTING SHOWCARD */}
      <ShowCard show={show} />

    </div>
  ))}
</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// "use client"

// import { useState } from "react"
// import EmbedPlayer from "@/components/watch/embed-player"
// import { Button } from "@/components/ui/button"

// import { Badge } from "@/components/ui/badge"
// import MovieService from "@/services/MovieService"
// import { ISeason, KeyWord, MediaType, Show, ShowWithGenreAndVideo } from "@/types"
// import { type } from "os"
// import { getIdFromSlug } from "@/lib/utils"
// import React from "react"
// import { useModalStore } from '@/stores/modal';
// import { AxiosResponse } from "axios"
// import { MovieDetails } from "@/components/ui/movie-details-section"
// import FlowingLightStreaks from "@/components/flowing-light-streaks"
// import { useLoadingStore } from "@/stores/loading"
// import { EpisodeList } from "@/components/episodes-list"
// import { Input } from "@/components/ui/input"
// import { GoogleGenAI } from "@google/genai";
// import { env } from '@/env.mjs';
// import { text } from "stream/consumers"



// export default function Page({ params }: { params: { slug: string } }) {
//   // 1. Initialize the client
//   const ai = new GoogleGenAI({apiKey : env.NEXT_PUBLIC_GEMINI_API_KEY});
  
//   const [question, setQuestion] = useState("");
//   const [responseText, setResponseText] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSend = async () => {
//     if (!question.trim()) return;

//     try {
//       setLoading(true);

//       // 2. Get the model instance and define the Google Search tool
//       const result = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: [{ role: "user", parts: [{ text: question }] }],
    
//       config: {
//         systemInstruction : { role : "system", parts : [{ text : " you are a movies/tvshows expert named assistant filmoviezo, you know all movies and tvshows and you follow  all the latest news of them , there will be 2 possible context in the chat , one for the chat in general about movies or tvshows and the second about movie/tvshow recommendation where user will answer 7 questions static in front and based on answers you will recommend top 3 accurate recommendations based on their answers ,some questions might have an empty response because user skipped them , after you send recommendations if user request other recomendations you recommend something else , you can only answer questions related to movies or tv shows industry anything you decline politly. you answer in maximum 2 phrases."}]},
//         tools : [{ googleSearch: {} }], 
//         temperature: 1.0,
//       }
//     });

//       const response =  result.text;
//       setResponseText(response ?? " something happened please try again later");

//       // Optional: Log search metadata to see the sources in console
//       console.log("Sources:", result);

//     } catch (error) {
//       console.error(error);
//       setResponseText("Something went wrong. Check the console for details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-10 text-white bg-slate-900 min-h-screen">
//       <div className="flex flex-col max-w-2xl gap-4">
//         <input 
//           type="text" 
//           className="text-black p-2 rounded"
//           value={question}
//           placeholder="Ask a real-time question (e.g., What is the weather today?)"
//           onChange={(e) => setQuestion(e.target.value)}
//         />
//         <button
//           className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 p-2 rounded transition"
//           onClick={handleSend}
//           disabled={loading}
//         >
//           {loading ? "Searching & Thinking..." : "Send"}
//         </button>

//         <div className="mt-4 p-4 border border-slate-700 rounded bg-slate-800">
//           <h3 className="text-sm text-slate-400 mb-2">Response:</h3>
//           <p className="whitespace-pre-wrap">
//             {responseText || "Waiting for your question..."}
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }
// "use client"

// import { useState } from "react"
// import EmbedPlayer from "@/components/watch/embed-player"
// import { Button } from "@/components/ui/button"

// import { Badge } from "@/components/ui/badge"
// import MovieService from "@/services/MovieService"
// import { ISeason, KeyWord, MediaType, Show, ShowWithGenreAndVideo } from "@/types"
// import { type } from "os"
// import { getIdFromSlug } from "@/lib/utils"
// import React from "react"
// import { useModalStore } from '@/stores/modal';
// import { AxiosResponse } from "axios"
// import { MovieDetails } from "@/components/ui/movie-details-section"
// import FlowingLightStreaks from "@/components/flowing-light-streaks"
// import { useLoadingStore } from "@/stores/loading"
// import { EpisodeList } from "@/components/episodes-list"
// import { Input } from "@/components/ui/input"
// import { GoogleGenAI } from "@google/genai";
// import { env } from '@/env.mjs';



// export default function Page({ params }: { params: { slug: string } }) {
//   // 1. Initialize the client
//   const ai = new GoogleGenAI({apiKey : env.NEXT_PUBLIC_GEMINI_API_KEY});
  
//   const [question, setQuestion] = useState("");
//   const [responseText, setResponseText] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSend = async () => {
//     if (!question.trim()) return;

//     try {
//       setLoading(true);

//       // 2. Get the model instance and define the Google Search tool

//   const result = await ai.models.generateContent({
//     model: "gemini-2.5-flash-preview-tts", // Specific TTS variant
//     contents: [{ 
//       role: "user", 
//       parts: [{ text: "bro is very smart and she is hard working with high iq." }] 
//     }],
//     config: {
//       responseModalities: ["AUDIO"],

//     }
//   });

//   // Extract the audio data
 


// if (result.candidates && result.candidates.length > 0) {
//     // If an image was generated, it's in the parts array
//    const audioPart = result.candidates[0].content?.parts?.find(p => p.inlineData);
//   if (audioPart) {
//    const rawBase64 = audioPart.inlineData!.data; 
      
//       // Convert PCM to Uint8Array
//       const pcmData = Uint8Array.from(atob(rawBase64!), c => c.charCodeAt(0));
      
//       // Prepend the WAV Header
//       const header = createWavHeader(pcmData.length);
//       const fullWav = new Uint8Array(header.length + pcmData.length);
//       fullWav.set(header);
//       fullWav.set(pcmData, header.length);

//       // Create Blob and Play
//       const blob = new Blob([fullWav], { type: 'audio/wav' });
//       const url = URL.createObjectURL(blob);
//       const audio = new Audio(url);
//       await audio.play();
      
//       setResponseText("Deep thought shared via audio.");
//   if (audioPart && audioPart.inlineData) {
//     playBase64Audio(audioPart.inlineData?.data);
//   }
//   }
   
//     }
  
//    console.log(result)
//   } catch (error) {
//     console.error("Generation failed:", error);
//   } finally {
//     setLoading(false);
//   }


//     //  const response =  "result.text";
//       setResponseText( " something happened please try again later");

//       // Optional: Log search metadata to see the sources in console
//       console.log("Sources:", "result");
     

//     // } catch (error) {
//     //   console.error(error);
//     //   setResponseText("Something went wrong. Check the console for details.");
//     // } finally {
//     //   setLoading(false);
//     // }
//   };
//   function createWavHeader(pcmDataLength: number, sampleRate: number = 24000): Uint8Array {
//   const header = new ArrayBuffer(44);
//   const view = new DataView(header);

//   // RIFF identifier
//   view.setUint32(0, 0x52494646, false); // "RIFF"
//   view.setUint32(4, 36 + pcmDataLength, true);
//   view.setUint32(8, 0x57415645, false); // "WAVE"

//   // fmt chunk
//   view.setUint32(12, 0x666d7420, false); // "fmt "
//   view.setUint32(16, 16, true); // chunk size
//   view.setUint16(20, 1, true); // PCM format
//   view.setUint16(22, 1, true); // Mono
//   view.setUint32(24, sampleRate, true);
//   view.setUint32(28, sampleRate * 2, true); // Byte rate
//   view.setUint16(32, 2, true); // Block align
//   view.setUint16(34, 16, true); // Bits per sample

//   // data chunk
//   view.setUint32(36, 0x64617461, false); // "data"
//   view.setUint32(40, pcmDataLength, true);

//   return new Uint8Array(header);
// }
// const playBase64Audio = (base64String? : String) => {
//   // 1. Create the Data URI (Gemini TTS returns WAV format)
//   const audioSrc = `data:audio/wav;base64,${base64String}`;
  
//   // 2. Create an internal audio object and play it
//   const audio = new Audio(audioSrc);
//   audio.play().catch(e => console.error("Playback failed (likely user gesture required):", e));
// };
//   return (
//     <div className="p-10 text-white bg-slate-900 min-h-screen">
//       <div className="flex flex-col max-w-2xl gap-4">
//         <input 
//           type="text" 
//           className="text-black p-2 rounded"
//           value={question}
//           placeholder="Ask a real-time question (e.g., What is the weather today?)"
//           onChange={(e) => setQuestion(e.target.value)}
//         />
//         <button
//           className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 p-2 rounded transition"
//           onClick={handleSend}
//           disabled={loading}
//         >
//           {loading ? "Searching & Thinking..." : "Send"}
//         </button>

//         <div className="mt-4 p-4 border border-slate-700 rounded bg-slate-800">
//           <h3 className="text-sm text-slate-400 mb-2">Response:</h3>
//           <p className="whitespace-pre-wrap">
//             {responseText || "Waiting for your question..."}
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }