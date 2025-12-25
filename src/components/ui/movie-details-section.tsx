import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Star, Server } from "lucide-react"
import { MediaType, Show } from "@/types"
import { formatDate } from "@/lib/utils"
import { useModalStore } from "@/stores/modal"
import CustomImage from "../custom-image"
import { usePathname, useSearchParams } from "next/navigation"
import React from "react"
import { PosterImage } from "./poster"
interface MovieDetailsProps {
  showSeason?: string
  showEpisode?: string
  showWithGenre?: Show
  setUrl: React.Dispatch<React.SetStateAction<string>>
  id: string
}

export function MovieDetails({ showWithGenre, showSeason, showEpisode, setUrl, id }: MovieDetailsProps) {
  const [activeServer, setActiveServer] = useState<number | null>(0)
  const modalStore = useModalStore();
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  const showType = segments[1]
  const servers = [

    //s https://uqload.cx/p9n6tl74j611.html
    // { name: "Server 1", urlMovie: `https://vidsrcme.su/embed/${showType}/${id}`,urlTv: `https://vidsrcme.su/embed/${showType}/${id}/${showSeason}/${showEpisode}` },
    //{ name: "Server 1", urlMovie: `https://111movies.com/${showType}/${id}`, urlTv: `https://111movies.com/${showType}/${id}/${showSeason}/${showEpisode}` },
    //https://godriveplayer.com/player.php?type=series&tmdb=111110&season=1&episode=1
//https://multiembed.mov/directstream.php?video_id=tt6791350
      // { name: "Server 2", urlMovie: `https://vidsrc.icu/embed/${showType}/${id}`, urlTv: `https://vidsrc.icu/embed/${showType}/${id}/${showSeason}/${showEpisode}` },
    //  { name: "Server 4", urlMovie: `https://www.2embed.cc/embed/${id}`, urlTv: `https://www.2embed.cc/embedtv/${id}&s=${showSeason}&e=${showEpisode}` },
    { name: "Server 1", urlMovie: `https://embed.vidsrc.pk/${showType}/${id}`, urlTv: `https://embed.vidsrc.pk/${showType}/${id}/${showSeason}-${showEpisode}` },

    { name: "Server 2", urlMovie: `https://moviesapi.club/${showType}/${id}`, urlTv: `https://moviesapi.club/${showType}/${id}-${showSeason}-${showEpisode}` },
    { name: "Server 3", urlMovie: `https://www.vidking.net/embed/${showType}/${id}`, urlTv: `https://www.vidking.net/embed/${showType}/${id}/${showSeason}/${showEpisode}` },

    { name: "Server 4", urlMovie: `https://vidsrc.cc/v3/embed/${showType}/${id}`, urlTv: `https://vidsrc.cc/v3/embed/${showType}/${id}/${showSeason}/${showEpisode}` },
    { name: "Server 5", urlMovie: `https://vidsrc.cc/v2/embed/${showType}/${id}`, urlTv: `https://vidsrc.cc/v2/embed/${showType}/${id}/${showSeason}/${showEpisode}` },
    { name: "Server 6", urlMovie: `https://111movies.com/${showType}/${id}`, urlTv: `https://111movies.com/${showType}/${id}/${showSeason}/${showEpisode}` },

  //  { name: "Server 6", urlMovie: `https://vidsrc.su/${showType}/${id}`, urlTv: `https://vidsrc.su/${showType}/${id}/${showSeason}/${showEpisode}` },
  ]

  const formatRating = (rating: number) => {
    return rating ? rating.toFixed(1) : "N/A"
  }

  const handleServerClick = (index: number, url: string) => {
    setActiveServer(index)
    setUrl(url)
  }
  React.useEffect(() => {
    setUrl(showType == "tv" ? servers[0].urlTv : servers[0].urlMovie)

  }, [showEpisode]);

  return (
    <div className="max-w-5xl">
      {/* Movie Header Section */}
      <div className=" md:hidden flex flex-col  gap-6 mb-8">
        <div className="flex flex-row md:flex-row md:flex-1 gap-3">
        {/* Poster */}
        {/* Poster */}
        <PosterImage showWithGenre={showWithGenre} />

        {/* Movie Info */}
        <div className="flex flex-col  gap-3 text-left">
          <h1 className="text-3xl md:text-4xl font-bold font-montserrat ">
            {showType == "movie" ? showWithGenre?.title : showWithGenre?.name}
          </h1>

          <div className="flex flex-wrap  sm:justify-start items-center gap-3 text-muted-foreground text-xs ">
            <span>{formatDate(showWithGenre?.release_date || showWithGenre?.first_air_date!)}</span>
            {showWithGenre?.runtime && (
              <>
                <span>•</span>
                <span>{showWithGenre.runtime}</span>
              </>
            )}
            {showWithGenre?.vote_average && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{showWithGenre.vote_average.toFixed(1)}</span>
                </div>
              </>
            )}
          </div>
       
          <div className="flex flex-wrap  sm:justify-start gap-1 text-xs  text-slate-400 mb-3">
            <span className="font-semibold">Genres:</span>
            <span>{showWithGenre?.genres.map((g) => g.name).join(", ")}</span>
          </div>
          </div>
</div>


  {/* Action Buttons */}
        <div className="lg:w-64">
        <div className="flex-1 grid grid-cols-2 md:flex md:flex-col gap-3">
            {servers.map((server, index) => (
              <Button
                key={index}
                variant="outline"
                size="lg"
                onClick={() => handleServerClick(index, showType == "tv" ? server.urlTv : server.urlMovie)}
                className={`w-full transition-colors ${activeServer === index
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white"
                  }`}
              >
                <Server className="w-5 h-5 mr-2" />
                {server.name}
              </Button>
            ))}
          </div>
        </div>


          <p className="text-sm leading-relaxed mb-8 text-pretty">
            {showWithGenre?.overview}
          </p>
      </div>
{/* Dekstop version */}

 <div className="hidden md:flex flex-col md:flex-row gap-6 mb-8">
        {/* Poster */}
        <PosterImage showWithGenre={showWithGenre} />

        {/* Movie Info */}
        <div className="flex flex-col justify-center flex-1  sm:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-montserrat mb-2">
                  {showType === "movie" ? showWithGenre?.title : showWithGenre?.name}
          </h1>

          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-muted-foreground text-sm mb-3">
            <span>{formatDate(showWithGenre?.release_date || showWithGenre?.first_air_date!)}</span>
            {showWithGenre?.runtime && (
              <>
                <span>•</span>
                <span>{showWithGenre.runtime}</span>
              </>
            )}
            {showWithGenre?.vote_average && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{showWithGenre.vote_average.toFixed(1)}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap justify-center sm:justify-start gap-1 text-xs sm:text-sm text-slate-400 mb-3">
            <span className="font-semibold">Genres:</span>
            <span>{showWithGenre?.genres.map((g) => g.name).join(", ")}</span>
          </div>

          <p className="text-lg leading-relaxed mb-8 text-pretty">
            {showWithGenre?.overview}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="lg:w-64">
          <div className="space-y-3">
            {servers.map((server, index) => (
              <Button
                key={index}
                variant="outline"
                size="lg"
                onClick={() => handleServerClick(index, showType == "tv" ? server.urlTv : server.urlMovie)}
                className={`w-full transition-colors ${activeServer === index
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white"
                  }`}
              >
                <Server className="w-5 h-5 mr-2" />
                {server.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div >
  )
}
