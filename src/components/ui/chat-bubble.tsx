'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function ChatBubble() {
  return (
    <Link
      href="/recommendations"
      className="hidden lg:flex fixed bottom-8 right-8 z-40 w-16 h-16 bg-gradient-to-br from-primary to-accent hover:shadow-lg hover:shadow-primary/50 rounded-full items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110"
      title="Get AI movie recommendations"
    >
      <MessageCircle size={28} className="text-primary-foreground" />
    </Link>
  );
}
