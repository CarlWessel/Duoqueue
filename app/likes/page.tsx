"use client";

import { UserProfile } from "@/app/profile/page";
import { getUserLikes, acceptLike, rejectLike } from "@/lib/actions/likes";
import { calculateAge } from "@/lib/helpers/calculate-age";
import MatchNotification from "@/components/MatchNotification";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LikesListPage() {
  const router = useRouter();
  const [likes, setLikes] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadLikes() {
      try {
        const userLikes = await getUserLikes();
        setLikes(userLikes);
      } catch (error) {
        setError("Failed to load likes.");
      } finally {
        setLoading(false);
      }
    }

    loadLikes();
  }, []);

  async function handleAccept(liker: UserProfile) {
    if (processingId) return;
    setProcessingId(liker.id);
    try {
      await acceptLike(liker.id);
      setLikes((prev) => prev.filter((like) => like.id !== liker.id));
      setMatchedUser(liker); // triggers the notification
    } catch (error) {
      setError("Failed to create match.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(likerId: string) {
    if (processingId) return;
    setProcessingId(likerId);
    try {
      await rejectLike(likerId);
      setLikes((prev) => prev.filter((like) => like.id !== likerId));
    } catch (error) {
      setError("Failed to remove like.");
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading your likes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      {matchedUser && (
        <MatchNotification
          match={matchedUser}
          onClose={() => setMatchedUser(null)}
          onStartChat={() => router.push(`/chat/${matchedUser.id}`)}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            People Who Like You
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {likes.length} like{likes.length !== 1 ? "s" : ""}
          </p>
        </header>

        {error && <p className="text-center text-red-500 mb-4">{error}</p>}

        {likes.length === 0 ? (
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">💕</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No likes yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Keep swiping — your admirers will show up here!
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="grid gap-4">
              {likes.map((like) => (
                <div
                  key={like.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={like.avatar_url}
                        alt={like.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {like.full_name}, {calculateAge(like.birthdate)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        @{like.username}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {like.bio}
                      </p>
                    </div>

                    <div className="flex-shrink-0 flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleReject(like.id)}
                        disabled={processingId === like.id}
                        aria-label={`Reject ${like.full_name}`}
                        className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAccept(like)}
                        disabled={processingId === like.id}
                        aria-label={`Match with ${like.full_name}`}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-pink-600 hover:to-red-600 disabled:opacity-50 transition-colors"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}