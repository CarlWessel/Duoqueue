"use client";

import { UserProfile } from "@/app/profile/page";
import Image from "next/image";
import { useEffect, useState } from "react";
import { calculateAge } from "@/lib/helpers/calculate-age";

export default function MatchCard({user}: {user: UserProfile}){
    const photos = [user.avatar_url, ...(user.photo_urls || [])].filter(Boolean);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    // Reset to the first photo whenever the displayed user changes
    useEffect(() => {
        setCurrentPhotoIndex(0);
    }, [user.id]);

    function goToNextPhoto() {
        setCurrentPhotoIndex((prev) => Math.min(prev + 1, photos.length - 1));
    }

    function goToPreviousPhoto() {
        setCurrentPhotoIndex((prev) => Math.max(prev - 1, 0));
    }

    return(
        <div className="relative w-full max-w-sm mx-auto">
            <div className="card-swipe aspect-[3/4] overflow-hidden">
                <div className="relative w-full h-full">
                    <Image
                    src={photos[currentPhotoIndex]}
                    alt={user.full_name}
                    fill
                    className={`object-cover transition-opacity duration-300`}
                    priority
                    />

                    {/* Segmented progress bar */}
                    {photos.length > 1 && (
                        <div className="absolute top-3 left-3 right-3 flex gap-1.5 z-20">
                            {photos.map((_, i) => (
                                <div
                                    key={i}
                                    className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
                                >
                                    <div
                                        className={`h-full bg-white transition-all duration-200 ${
                                            i <= currentPhotoIndex ? "w-full" : "w-0"
                                        }`}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tap zones for photo navigation */}
                    {photos.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={goToPreviousPhoto}
                                disabled={currentPhotoIndex === 0}
                                aria-label="Previous photo"
                                className="absolute top-0 left-0 w-1/2 h-full z-10 cursor-pointer disabled:cursor-default"
                            />
                            <button
                                type="button"
                                onClick={goToNextPhoto}
                                disabled={currentPhotoIndex === photos.length - 1}
                                aria-label="Next photo"
                                className="absolute top-0 right-0 w-1/2 h-full z-10 cursor-pointer disabled:cursor-default"
                            />
                        </>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none">
                            <div className="flex items-end justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">
                                    {user.full_name}, {calculateAge(user.birthdate)}
                                    </h2>
                                    <p className="text-sm opacity-90 mb-2">@{user.username}</p>
                                    <p className="text-sm leading-relaxed mb-3">{user.bio}</p>

                                    {user.favourite_games.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {user.favourite_games.map((game) => (
                                                <span
                                                    key={game.id}
                                                    className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium"
                                                    title={game.company}
                                                >
                                                    🎮 {game.title}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                </div>
            </div>

        </div>
    );
}