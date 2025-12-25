"use client"

import { useState } from "react"
import { Play } from "lucide-react"
import { ISeason, Show } from "@/types"

interface Episode {
  id: number
  title: string
  duration: string
}

interface Season {
  id: number
  title: string
  episodes: Episode[]
}

interface EpisodeListProps {
   show?: Show
  seasons? : ISeason[]
  selectedEpisode?: number
  seasonNumber?: number
  onEpisodeSelect: (seasonId: number, episodeId: number) => void
}
function formatRuntime(minutes?: number) {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${m.toString().padStart(2, "0")}min`;
}
export function EpisodeList({ show, seasons,seasonNumber,selectedEpisode, onEpisodeSelect }: EpisodeListProps) {
  const [selectedSeason, setSelectedSeason] = useState(seasonNumber)

  const currentSeason = seasons?.find((s) => s.season_number === selectedSeason)

  return (
    <div className="bg-lightdarkblue backdrop-blur-sm rounded-lg p-4 md:h-[72vh]">
      {/* Season Selector */}
      {seasons?.length! > 1 && (
        <div className="mb-4 text-white">
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
            className="w-full bg-slate-800 text-white rounded-md px-3 py-2 text-sm border border-slate-700 focus:border-purple-500 focus:outline-none"
          >
            {seasons?.map((season) => (
              <option key={season.season_number} value={season.season_number} >
                {season?.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Episode List Header */}
      <div className="mb-4">
        <h2 className="text-white font-bold text-sm">List of episodes:</h2>
      </div>

      {/* Episodes */}
      <div className="space-y-1 h-4/5  overflow-y-auto">
        {currentSeason?.episodes.map((episode) => (
          <button
            key={episode.id}
            onClick={() => { onEpisodeSelect(selectedSeason ?? 1, episode.episode_number ?? 1)}}
            className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors hover:bg-slate-500 ${
              selectedEpisode === episode.episode_number ? "bg-white " : ""
            }`}
          >
            {/* Episode Number */}
            <div className="flex-shrink-0 w-8 h-8 bg-lightdarkslate rounded flex items-center justify-center text-white text-sm font-medium">
              {episode.episode_number}
            </div>

            {/* Episode Title */}
            <div className="flex-1 min-w-0">
              <p className= {` text-sm font-medium truncate  ${
              selectedEpisode === episode.episode_number ? "text-slate-900 " : "text-white"
            }`}>{episode?.name}</p>
              <p className="text-slate-400 text-xs">{formatRuntime(episode.runtime)}</p>
            </div>

          
          </button>
        ))}
      </div>
    </div>
  )
}
