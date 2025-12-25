// app/api/proxy/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Prevents Next.js from caching this as a static page

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) return new NextResponse('Missing URL', { status: 400 });

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': new URL(targetUrl).origin,
      },
    });

    let html = await response.text();
    const origin = new URL(targetUrl).origin;

   // Inside your route.ts blockerScript variable:
const scriptBlocker = `
  <script>
    (function() {
      // 1. Fake Window Open: Return a "dummy" window object so 
      // the ad-script thinks the popup succeeded.
      const dummyWindow = {
        focus: function() {},
        close: function() {},
        closed: false,
        location: { href: '' }
      };
      
      window.open = function() { 
        console.log("Ad script tried to open a popup. Neutered.");
        return dummyWindow; 
      };

      // 2. Kill the "Top Level" navigation
      // This stops the player from changing the URL of YOUR website
      window.onbeforeunload = function() {
        return "Are you sure?"; 
      };

      // 3. Block "Location" changes via Object.defineProperty
      // This prevents scripts from doing: window.top.location = 'ads.com'
      try {
        Object.defineProperty(window, 'location', {
          value: window.location,
          writable: false,
          configurable: false
        });
      } catch (e) {}
    })();
  </script>
`;

    // 1. Inject blocker
    html = html.replace('<head>', `<head>${scriptBlocker}`);

    // 2. Fix Relative URLs safely
    // This regex avoids rewriting paths that start with /_next (your local files)
    // It targets src="/path" or href="/path" but skips /_next
    html = html.replace(/(src|href)="(?!\/_next)\/([^"]*)"/g, `$1="${origin}/$2"`);

    return new NextResponse(html, {
      headers: { 
        'Content-Type': 'text/html',
        // Critical: Ensure browser doesn't try to use this as a frame-ancestor for your app
        'X-Frame-Options': 'SAMEORIGIN' 
      },
    });
  } catch (error) {
    console.error("Proxy Error:", error);
    return new NextResponse('Proxy error', { status: 500 });
  }
}