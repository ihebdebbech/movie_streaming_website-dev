// layout.tsx or FrontLayout.tsx
"use client"

import GlobalLoader from "@/components/loader"
import SiteFooter from "@/components/main/site-footer"
import SiteHeader from "@/components/main/site-header"
import { useEffect, useState } from "react"

const FrontLayout = ({ children }: { children: React.ReactNode }) => {

  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  if (!hydrated) return null // Prevent SSR flicker

  return (
    <div className="min-h-screen bg-gradient-to-br from-lightdarkslate via-lightdarkblue to-lightdarkslate">
       
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
       <GlobalLoader />  
   
    </div>
  )
}

export default FrontLayout
