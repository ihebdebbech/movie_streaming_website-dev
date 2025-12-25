// import React from 'react';
// import EmbedPlayer from '@/components/watch/embed-player';

// export const revalidate = 3600;
// //https://vidsrc.su/embed/tv/76331/1/9
// export default function Page({ params }: { params: { slug: string } }) {
//   const id = params.slug.split('-').pop();
//   return <EmbedPlayer url={`https://vidsrc.cc/v2/embed/tv/${id}`} />;
// }
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
   console.log(params.slug);
   const [show ,setShow] = useState<Show | undefined>(undefined);
    const [url ,setUrl] = useState<string>(`https://vidsrc.cc/v2/embed/movie/${id}`);
     const [showSeason ,setshowSeason] = useState<string>("1");
   const [showEpisode ,setshowEpisode] = useState<string>("1");
       const [seasons, setSeasons] = React.useState<ISeason[] | undefined>(undefined);
     
  const handleGetData = async () => {
 
     const showId: number = getIdFromSlug(params.slug);
    // const data: Show =   await MovieService.findCurrentMovie(movieId, params.slug);
 const response: AxiosResponse<Show> = await MovieService.findTvSeries(showId);
    const { data } = response;
    if (!data?.seasons?.length) {
       useLoadingStore.getState().hide();
      return;
    }
    const seasonsFiltered = data.seasons.filter(
      (season: ISeason) => season.season_number,
    );
    const promises = seasonsFiltered.map(async (season: ISeason) => {
      return MovieService.getSeasons(showId, season.season_number);
    });

    const seasonWithEpisodes = await Promise.all(promises);
    
        setSeasons(
      seasonWithEpisodes.map((res: AxiosResponse<ISeason>) => res.data) );
      setShow(response.data)
      useLoadingStore.getState().hide();
   

  };

  const handleEpisodeSelect = (seasonNumber: number, episodeNumber: number) => {
    console.log("inhandle")
  setshowEpisode(episodeNumber.toString())
  setshowSeason(seasonNumber.toString())
  } 
   React.useEffect(() => {
      useModalStore.setState({open : false})
      void handleGetData();
    }, []);
  
  return (
    <div className="  text-white">
      <div className=" min-h-screen     ">
        <div className=" mx-14  mt-10  ">
          {/* Movie Player */}
          <div className="flex flex-col lg:flex-row gap-6">
           
          <div className="flex-1">
          <div className="  w-full max-w-5xl  aspect-video md:h-[72vh] ">
               <EmbedPlayer url={url} />
          </div>

               <div className=" mx-1  py-8">
          <MovieDetails showWithGenre={show} showSeason={showSeason} showEpisode ={showEpisode} setUrl={setUrl} id= {id!}/>
          
        </div>
        </div>
         <div className="lg:w-80">
            <EpisodeList show = {show} seasons={seasons}  onEpisodeSelect={handleEpisodeSelect} />
          </div>
        </div>

          
           
        </div>
      </div>
    </div>
  )
}
