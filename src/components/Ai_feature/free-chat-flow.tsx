'use client';

import { Send } from 'lucide-react';

interface FreeChatFlowProps {
  isLoading?: boolean;
}

export function FreeChatFlow({  isLoading = false }: FreeChatFlowProps) {
  // This component just provides a clean interface for free chat
  // The actual message handling is done in the parent component
  // It's separated for clarity and to show the different UX patterns

  return (
    <div className="space-y-4">
      {/* Welcome Message for Free Chat */}
      <div className="bg-secondary/30 border border-border rounded-lg p-4 mb-6">
        <p className="text-sm text-foreground leading-relaxed">
          You're in <span className="font-semibold text-accent">Free Chat Mode</span>. Ask me anything about movies!
          I can help you find recommendations, discuss films, or just chat about your favorites. 🎬
        </p>
      </div>

      {/* This is just a placeholder UI - the actual input is in the parent component */}
      <div className="text-sm text-muted-foreground italic">
        Type your message in the input box below to get started
      </div>
    </div>
  );
}
