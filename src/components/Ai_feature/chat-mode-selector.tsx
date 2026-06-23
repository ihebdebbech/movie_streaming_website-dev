'use client';

import { MessageCircle, Sparkles } from 'lucide-react';

interface ChatModeSelectorProps {
  onSelectMode: (mode: 'personalized' | 'free') => void;
}

export function ChatModeSelector({ onSelectMode }: ChatModeSelectorProps) {
  return (

<div>
    
    <div className="hidden lg:flex flex-col gap-4">
      {/* Welcome Message */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-foreground mb-2">Welcome to Assistant Filmozo</h3>
        <p className="text-muted-foreground">How would you like to discover movies?</p>
      </div>

      {/* Mode Selection Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Personalized Recommendations */}
        <button
          onClick={() => onSelectMode('personalized')}
          className="group flex flex-col items-center gap-3 p-6 border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer"
        >
          <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="text-left w-full">
            <h4 className="font-semibold text-foreground mb-1">
              Personalized Recommendations
            </h4>
            <p className="text-sm text-muted-foreground">
              Answer 7 quick questions and get AI-powered movie suggestions tailored to your taste
            </p>
          </div>
        </button>

        {/* Free Chat */}
        <button
          onClick={() => onSelectMode('free')}
          className="group flex flex-col items-center gap-3 p-6 border border-border rounded-xl hover:border-accent hover:bg-accent/5 transition-all duration-200 cursor-pointer"
        >
          <div className="p-3 bg-white/10 rounded-lg group-hover:bg-accent/20 transition-colors">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <div className="text-left w-full">
            <h4 className="font-semibold text-foreground mb-1">Chat Freely</h4>
            <p className="text-sm text-muted-foreground">
              Ask anything about movies, get recommendations on the fly, or discuss your favorites
            </p>
          </div>
        </button>
      </div>
</div>


 <div className="lg:hidden flex flex-col gap-4">
        {/* Welcome Message */}
      <div className=" text-center mb-12">
        <h3 className="text-xl font-bold text-foreground mb-2">Welcome to Assistant Filmozo</h3>
        <p className="text-muted-foreground">How would you like to discover movies?</p>
      </div>

      {/* Mode Selection Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Personalized Recommendations */}
        <button
          onClick={() => onSelectMode('personalized')}
          className="group flex flex-col items-center gap-3 p-6 pt-10 pb-10 border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer"
        >
          <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="text-left w-full">
            <h4 className="font-semibold text-foreground mb-1">
              Personalized Recommendations
            </h4>
            <p className="text-sm text-muted-foreground">
              Answer 7 quick questions and get AI-powered movie suggestions tailored to your taste
            </p>
          </div>
        </button>

        {/* Free Chat */}
        <button
          onClick={() => onSelectMode('free')}
          className="group flex flex-col items-center gap-3 p-6 pt-10 pb-10 border border-border rounded-xl hover:border-accent hover:bg-accent/5 transition-all duration-200 cursor-pointer"
        >
          <div className="p-3 bg-white/10 rounded-lg group-hover:bg-accent/20 transition-colors">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <div className="text-left w-full">
            <h4 className="font-semibold text-foreground mb-1">Chat Freely</h4>
            <p className="text-sm text-muted-foreground">
              Ask anything about movies, get recommendations on the fly, or discuss your favorites
            </p>
          </div>
        </button>
      </div>
    </div>
    </div>
  );
}
