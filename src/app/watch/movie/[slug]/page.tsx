"use client"

import { useState } from "react"
import EmbedPlayer from "@/components/watch/embed-player"
import { Button } from "@/components/ui/button"

import { Badge } from "@/components/ui/badge"
import MovieService from "@/services/MovieService"
import { ISeason, KeyWord, MediaType, Show, ShowWithGenreAndVideo } from "@/types"
import { type } from "os"
import { getIdFromSlug } from "@/lib/utils"
import React from "react"
import { useModalStore } from '@/stores/modal';
import { AxiosResponse } from "axios"
import { MovieDetails } from "@/components/ui/movie-details-section"
import FlowingLightStreaks from "@/components/flowing-light-streaks"
import { useLoadingStore } from "@/stores/loading"
import { EpisodeList } from "@/components/episodes-list"


interface Server {
  name: string
  url: string
  quality: string
  isWorking: boolean
}

export default function Page({ params }: { params: { slug: string } }) {
  const id = params.slug.split("-").pop()
   console.log("slug",params.slug);
   const [show ,setShow] = useState<Show | undefined>(undefined);
  const [url ,setUrl] = useState<string>(`https://vidsrc.cc/v2/embed/movie/${id}`);
  const [seasons, setSeasons] = React.useState<ISeason[] | undefined>(undefined);
  const handleGetData = async () => {
     const movieId: number = getIdFromSlug(params.slug);
    // const data: Show =   await MovieService.findCurrentMovie(movieId, params.slug);
     const response: AxiosResponse<Show> = await MovieService.findMovie(movieId);
       const { data } = response;
       const season : ISeason= { _id : data.showId , name : "Season 1", id : data.id,overview : data.overview ?? "",
         season_number : 1,
        air_date : data.first_air_date ?? "" , poster_path : data.poster_path ?? "" , vote_average : data.vote_average , episodes : [{name : data.title ?? "", air_date : data.first_air_date ?? "",runtime : data.runtime ?? 1, episode_number : 1 , episode_type : "movie"  , guest_stars : [], crew : []}]  }
         setSeasons([season])
        // if (!data?.seasons?.length) {
    //    useLoadingStore.getState().hide();
    //   return;
    // }
    // const seasonsFiltered = data.seasons.filter(
    //   (season: ISeason) => season.season_number,
    // );
    // const promises = seasonsFiltered.map(async (season: ISeason) => {
    //   return MovieService.getSeasons(movieId, season.season_number);
    // });

    // const seasonWithEpisodes = await Promise.all(promises);
    
    //     setSeasons(
    //   seasonWithEpisodes.map((res: AxiosResponse<ISeason>) => res.data) );
     setShow(response.data)
      useLoadingStore.getState().hide();

  };
  const episodeData = [
    {
      id: 1,
      title: "Season 1",
      episodes: [
        { id: 1, title: "Superman", duration: "24m" },
      ],
    },
  ]

  const handleEpisodeSelect = (seasonId: number, episodeId: number) => {
    console.log(`[v0] Selected season ${seasonId}, episode ${episodeId}`)
    // In a real app, you'd update the video source here
  }
  React.useEffect(() => {
        useModalStore.setState({open : false})
    void handleGetData();
  }, []);
  return (
    <div className="  text-white">
      <div className=" min-h-screen     ">
        <div className="  md:mx-14   mt-3 md:mt-10  ">
          {/* Movie Player */}
          <div className="flex flex-col lg:flex-row gap-6">
           
          <div className="flex-1">
          <div className="  w-full max-w-5xl  aspect-video md:h-[72vh] ">
               <EmbedPlayer url={url} noSandbox={false}/>
          </div>

               <div className=" mx-4 md:mx-1  py-8">
          <MovieDetails showWithGenre={show} showEpisode="" setUrl={setUrl} id= {id!}/>
          
        </div>
        </div>
         <div className="lg:w-80">
            <EpisodeList show = {show} seasons={seasons} onEpisodeSelect={handleEpisodeSelect} />
          </div>
        </div>

          
           
        </div>
      </div>
    </div>
  )
}
