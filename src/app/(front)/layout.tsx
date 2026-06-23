import GlobalLoader from '@/components/loader';
import SiteFooter from '@/components/main/site-footer';
import SiteHeader from '@/components/main/site-header';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import AiIcon from '@/components/ui/sparkle-icon';
const FrontLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lightdarkslate via-lightdarkblue to-lightdarkslate">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
       <GlobalLoader />
       {/* Floating AI Chat Button */}
      <Link 
        href="/chat" 
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-950  shadow-lg transition-transform hover:scale-110 hover:bg-slate-700 "
        aria-label="Navigate to AI Chat"
      >
        
<AiIcon/>
      </Link>
    </div>
  );
};

export default FrontLayout;
