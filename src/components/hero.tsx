'use client';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { getIdFromSlug, getNameFromShow, getSlug } from '@/lib/utils';
import MovieService from '@/services/MovieService';
import { useModalStore } from '@/stores/modal';
import { useSearchStore } from '@/stores/search';
import { MediaType, type Show } from '@/types';
import { type AxiosResponse } from 'axios';
import Link from 'next/link';
import React, { useState } from 'react';
import CustomImage from './custom-image';
import { usePathname } from 'next/navigation';

interface HeroProps {
  randomShow: Show [];
}

const Hero = ({ randomShow }: HeroProps) => {
  const path = usePathname();
    const [index, setIndex] = useState(0);
      const show = randomShow[index];
  React.useEffect(() => {
    window.addEventListener('popstate', handlePopstateEvent, false);
    return () => {
      window.removeEventListener('popstate', handlePopstateEvent, false);
    };
  }, []);
    React.useEffect(() => {
    if (!randomShow || randomShow.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % randomShow.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [randomShow]);

  const handlePopstateEvent = () => {
    const pathname = window.location.pathname;
    if (!/\d/.test(pathname)) {
      modalStore.reset();
    } else if (/\d/.test(pathname)) {
      const movieId: number = getIdFromSlug(pathname);
      if (!movieId) {
        return;
      }
      const findMovie: Promise<AxiosResponse<Show>> = pathname.includes(
        '/tv-shows',
      )
        ? MovieService.findTvSeries(movieId)
        : MovieService.findMovie(movieId);
      findMovie
        .then((response: AxiosResponse<Show>) => {
          const { data } = response;
          useModalStore.setState({ show: data, open: true, play: true });
        })
        .catch((error) => {
          console.error(`findMovie: `, error);
        });
    }
  };

  // stores
  const modalStore = useModalStore();
  const searchStore = useSearchStore();

  if (searchStore.query.length > 0) {
    return null;
  }

  const handleHref = (): string => {
    if (!randomShow) {
      return '#';
    }
    if (!path.includes('/anime')) {
      const type = show.media_type === MediaType.MOVIE ? 'movie' : 'tv';
      return `/watch/${type}/${show.id}`;
    }
    const prefix: string =
      show?.media_type === MediaType.MOVIE ? 'm' : 't';
    const id = `${prefix}-${show.id}`;
    return `/watch/anime/${id}`;
  };
 const next = () => {
    setIndex((prev) => (prev + 1) % randomShow.length)
  }

  const prev = () => {
    setIndex((prev) =>
      prev === 0 ? randomShow.length - 1 : prev - 1
    )
  }
  return (
    <section aria-label="Hero" className="w-full">
      {show && (
        <>
          <div className="absolute inset-0 z-0 h-[100vw] w-full sm:h-[56.25vw]">
            <CustomImage
              src={`https://image.tmdb.org/t/p/original${
                show?.backdrop_path ?? show?.poster_path ?? ''
              }`}
              alt={show?.title ?? 'poster'}
              className="-z-40 h-auto w-full object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 100vw, 33vw"
              fill
              priority
                   style={{
      WebkitMaskImage:
        "linear-gradient(to bottom, black 40%, transparent 100%)",
      maskImage:
        "linear-gradient(to bottom, black 40%, transparent 100%)",
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
    }}
            />
            <div className="absolute bottom-0 left-0 right-0 top-0">
              <div className="absolute bottom-[35%] left-[4%] top-0 z-10 flex w-[36%] flex-col justify-end space-y-2">
                <h1 className="text-[3vw] font-bold">
                  {show?.title ?? show?.name}
                </h1>
                <div className="flex space-x-2 text-[2vw] font-semibold md:text-[1.2vw]">
                  <p className="text-green-600">
                    {Math.round(show?.vote_average * 10) ?? '-'}% Match
                  </p>
                  {/* <p className="text-gray-300">{show?.release_date ?? "-"}</p> */}
                  <p>{show?.release_date ?? '-'}</p>
                </div>
                {/* <p className="line-clamp-4 text-sm text-gray-300 md:text-base"> */}
                <p className="hidden text-[1.2vw] sm:line-clamp-3">
                  {show?.overview ?? '-'}
                </p>
                <div className="mt-[1.5vw] flex items-center space-x-2">
                  <Link prefetch={false} href={handleHref()}>
                    <Button
                      aria-label="Play video"
                      className="h-auto flex-shrink-0 gap-2 rounded-xl">
                      <Icons.play className="fill-current" aria-hidden="true" />
                      Play
                    </Button>
                  </Link>
                  <Button
                    aria-label="Open show's details modal"
                    variant="outline"
                    className="h-auto flex-shrink-0 gap-2 rounded-xl"
                    onClick={() => {
                      const name = getNameFromShow(show);
                      const path: string =
                        show?.media_type === MediaType.TV
                          ? 'tv-shows'
                          : 'movies';
                      // window.history.pushState(
                      //   null,
                      //   '',
                      //   `${path}/${getSlug(show?.id, name)}`,
                      // );
                      useModalStore.setState({
                        show: show,
                        open: true,
                        play: true,
                      });
                    }}>
                    <Icons.info aria-hidden="true" />
                    More Info
                  </Button>
                </div>
              </div>
            </div>{' '}
   <div className="fixed inset-0 bg-gradient-to-r top-0 left-0  w-1/2 from-slate-950  to-transparent " />
      <div className="fixed inset-0 bg-gradient-to-t from-slate-950  to-transparent " />
          </div>
          <div className="relative inset-0 -z-50 mb-5 pb-[60%] sm:pb-[40%]"></div>
        </>
      )}
    </section>
  );
};

export default Hero;
