import { Sparkle, Sparkles } from 'lucide-react';

export default function GradientAiIcon() {
  return (
    // Outer container matching the size of your button's icon slot
    <div className="relative h-7 w-7">
      
      {/* 1. The Large Center Star */}
    <span className="  bg-transparent">
  <Sparkles className="absolute inset-0 h-full w-full stroke-[url(#ai-gradient)]" />
  
  {/* Inline SVG Gradient Definition */}
  <svg className="absolute h-0 w-0">
    <defs>
      <linearGradient id="ai-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
       
        <stop offset="15%" stopColor="#0a35c1" />   {/* purple-500 */}
        <stop offset="60%" stopColor="#ffffff" />  {/* indigo-500 */}
       
      </linearGradient>
    </defs>
  </svg>
</span>

      {/* 2. Top-Left Small Star */}
      <Sparkle 
        className="absolute -top-1 -left-0.5 h-2.5 w-2.5 text-[#5271d7] fill-none" 
      />

      {/* 3. Bottom-Right Small Star */}
      <Sparkle 
        className="absolute -bottom-1 -right-0.5 h-2.5 w-2.5 text-[#ffffff] fill-none" 
      />

      {/* Shared SVG Gradient defined once at the bottom */}
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          <linearGradient id="manual-ai-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9333ea" />    {/* Purple */}
            <stop offset="50%" stopColor="#a855f7" />   {/* Mid Purple */}
            <stop offset="100%" stopColor="#ec4899" />  {/* Pink */}
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}