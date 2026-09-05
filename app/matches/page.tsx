"use client"
import { UserProfile } from "@/app/profile/page";
import { getPotentialMatches, likeUser } from "@/lib/actions/matches";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MatchCard from "@/components/MatchCard";
import MatchButtons from "@/components/MatchButtons";
import MatchNotification from "@/components/MatchNotification";


export default function MatchesPage(){
    const [potentialMatches, setPotentialMatches] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showMatchNotification, setShowMatchNotification] = useState(false);
    const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);

    const router = useRouter();
    
    useEffect(() => {
        async function loadUsers() {
            try {
                const potentialMatchesData = await getPotentialMatches();
                setPotentialMatches(potentialMatchesData);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadUsers();
    }, [])

    async function handleLike(){
        if(currentIndex < potentialMatches.length -1){
           const likedUser = potentialMatches[currentIndex];
           try{
            const result = await likeUser(likedUser.id)

            if (result.isMatch){
                setMatchedUser(result.matchedUser!)
                setShowMatchNotification(true);
            }

            setCurrentIndex((prev) => prev + 1);
           } catch (err) {
                console.error(err)
           }
        }
    }

    function handlePass(){
        if(currentIndex < potentialMatches.length){
            setCurrentIndex((prev) => prev + 1);
        }
    }

    function handleOnRedo(){

    }

    function handleOnSuperLike(){
        
    }

    function handleCloseMatchNotification(){

    }

    function handleStartChat(){

    }

    const currentPotentialMatch = potentialMatches[currentIndex];

    if (loading) {
        return (
        <div className="h-full bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
            <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
                Finding your matches...
            </p>
            </div>
        </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors duration-200"
                        title="Go back"
                        >
                            <svg
                                className="w-6 h-6 text-gray-700 dark:text-gray-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>
                        <div className="flex-1" />
                    </div>

                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Discover Matches
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {currentIndex + 1} of {potentialMatches.length} profiles
                        </p>
                    </div>
                </header>

                <div className="max-w-md mx-auto">
                    <MatchCard user={currentPotentialMatch} />
                    <div className="mt-8">
                        <MatchButtons onLike={handleLike} onPass={handlePass} onRedo={handleOnRedo} onSuperLike={handleOnSuperLike}/>
                    </div>
                </div>

                {showMatchNotification && matchedUser && (
                    <MatchNotification match={matchedUser} onClose={handleCloseMatchNotification} onStartChat={handleStartChat}/>
                )}

            </div>
        </div>

    );
}