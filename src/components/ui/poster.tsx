import { Show } from "@/types";
import CustomImage from "../custom-image";
import { useModalStore } from "@/stores/modal"

interface PosterImageProps {
  showWithGenre?: Show;
}

export  function PosterImage({ showWithGenre } : PosterImageProps) {
     const modalStore = useModalStore();
    return (
         <div className="relative w-20 h-28  sm:h-56 md:w-48 md:h-64 rounded-lg overflow-hidden shadow-md shrink-0">
          <CustomImage
            fill
            priority
            alt={modalStore?.show?.title ?? 'poster'}
            className="object-cover"
            src={`https://image.tmdb.org/t/p/w500${showWithGenre?.poster_path ?? showWithGenre?.backdrop_path
              }`}
            sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 20vw"
          />
        </div>
        );
}