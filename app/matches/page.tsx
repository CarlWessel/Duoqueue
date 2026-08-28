"use client"
import { UserProfile } from "@/app/profile/page";
import { getPotentialMatches } from "@/lib/actions/matches";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function MatchesPage(){
    const [potentialMatches, setPotentialMatches] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

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

    const currentPotentialMatch = potentialMatches[currentIndex];

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
            </div>
        </div>

    );
}