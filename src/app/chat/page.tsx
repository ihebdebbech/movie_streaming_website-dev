"use client"

import { useState } from "react"
import EmbedPlayer from "@/components/watch/embed-player"
import { Button } from "@/components/ui/button"

import { Badge } from "@/components/ui/badge"
import MovieService from "@/services/MovieService"
import { ISeason, KeyWord, MediaType, Show, ShowWithGenreAndVideo } from "@/types"
import { type } from "os"
import { getIdFromSlug } from "@/lib/utils"
import React from "react"
import { useModalStore } from '@/stores/modal';
import { AxiosResponse } from "axios"
import { MovieDetails } from "@/components/ui/movie-details-section"
import FlowingLightStreaks from "@/components/flowing-light-streaks"
import { useLoadingStore } from "@/stores/loading"
import { EpisodeList } from "@/components/episodes-list"
import { Input } from "@/components/ui/input"
import { GoogleGenAI } from "@google/genai";
import { env } from '@/env.mjs';



export default function Page({ params }: { params: { slug: string } }) {
  // 1. Initialize the client
  const ai = new GoogleGenAI({apiKey : env.NEXT_PUBLIC_GEMINI_API_KEY});
  
  const [question, setQuestion] = useState("");
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!question.trim()) return;

    try {
      setLoading(true);

      // 2. Get the model instance and define the Google Search tool
      const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: question }] }],
    
      config: {
        tools : [{ googleSearch: {} }], 
        temperature: 1.0,
      }
    });

      const response =  result.text;
      setResponseText(response ?? " something happened please try again later");

      // Optional: Log search metadata to see the sources in console
      console.log("Sources:", result);

    } catch (error) {
      console.error(error);
      setResponseText("Something went wrong. Check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 text-white bg-slate-900 min-h-screen">
      <div className="flex flex-col max-w-2xl gap-4">
        <input 
          type="text" 
          className="text-black p-2 rounded"
          value={question}
          placeholder="Ask a real-time question (e.g., What is the weather today?)"
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 p-2 rounded transition"
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? "Searching & Thinking..." : "Send"}
        </button>

        <div className="mt-4 p-4 border border-slate-700 rounded bg-slate-800">
          <h3 className="text-sm text-slate-400 mb-2">Response:</h3>
          <p className="whitespace-pre-wrap">
            {responseText || "Waiting for your question..."}
          </p>
        </div>
      </div>
    </div>
  )
}