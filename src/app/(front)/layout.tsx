import GlobalLoader from '@/components/loader';
import SiteFooter from '@/components/main/site-footer';
import SiteHeader from '@/components/main/site-header';

const FrontLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lightdarkslate via-lightdarkblue to-lightdarkslate">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
       <GlobalLoader />
    </div>
  );
};

export default FrontLayout;
