"use client"

import PhotoUpload from "@/components/PhotoUpload";
import PhotoUploader from "@/components/PhotoUploader";
import { getCurrentUserProfile, updateUserProfile, getAvailableVideoGames, updateUserFavouriteGames, updateUserPhotos } from "@/lib/actions/profile";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { VideoGame } from "../page";


export default function EditProfilePage(){

    const [formData, setFormData] = useState({
        full_name: "",
        username: "",
        bio: "",
        gender: "male" as "male" | "female" | "other",
        birthdate: "",
        avatar_url: "",
        age_min: 18,
        age_max: 50,
        distance: 25,
        gender_preference: [] as ("male" | "female" | "other")[],
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [availableGames, setAvailableGames] = useState<VideoGame[]>([]);
    const [selectedGameIds, setSelectedGameIds] = useState<number[]>([]);
    const [gamesPickerOpen, setGamesPickerOpen] = useState(false);
    const [photoUrls, setPhotoUrls] = useState<string[]>([]);
    const router = useRouter()

    useEffect(() => {
        async function loadProfile(){
            try {
                const [profileData, gamesData] = await Promise.all([
                    getCurrentUserProfile(),
                    getAvailableVideoGames(),
                ]);

                if(profileData){
                   setFormData({
                        full_name: profileData.full_name || "",
                        username: profileData.username || "",
                        bio: profileData.bio || "",
                        gender: profileData.gender || "male",
                        birthdate: profileData.birthdate || "",
                        avatar_url: profileData.avatar_url || "",
                        
                        age_min: profileData.preferences?.age_range?.min ?? 18,
                        age_max: profileData.preferences?.age_range?.max ?? 50,
                        distance: profileData.preferences?.distance ?? 25,
                        gender_preference: profileData.preferences?.gender_preference ?? [],
                   });
                   setPhotoUrls(profileData.photo_urls ?? []);
                   setSelectedGameIds(profileData.favourite_games.map((g: VideoGame) => g.id));
                   //console.log("submitting game ids:", selectedGameIds);
                }
                setAvailableGames(gamesData);
            } catch (err) {
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    async function handleFormSubmit(e: React.FormEvent){
        e.preventDefault();

        setSaving(true);
        setError(null);

        try{
            const result = await updateUserProfile(formData);
            if(!result.success){
                setError(result.error || "Failed to update profile");
                return;
            }

            const gamesResult = await updateUserFavouriteGames(selectedGameIds);
            if(!gamesResult.success){
                setError(gamesResult.error || "Failed to update favourite games");
                return;
            }

            const photosResult = await updateUserPhotos(photoUrls);
            if(!photosResult.success){
                setError(photosResult.error || "Failed to update photos");
                return;
            }
            console.log("photoUrls being saved:", photoUrls);

            router.push("/profile");
        } catch {
            setError("Failed to update profile");
        } finally {
            setSaving(false);
        }
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>){
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: Number(value),
        }));
    }

    function toggleGenderPreference(g: "male" | "female" | "other") {
        setFormData((prev) => {
            const alreadySelected = prev.gender_preference.includes(g);
            return {
                ...prev,
                gender_preference: alreadySelected
                    ? prev.gender_preference.filter((item) => item !== g)
                    : [...prev.gender_preference, g],
            };
        });
    }

    function toggleGame(gameId: number) {
        setSelectedGameIds((prev) => {
            if (prev.includes(gameId)) {
                return prev.filter((id) => id !== gameId);
            }
            if (prev.length >= 5) {
                return prev; // silently ignore — button will be disabled anyway
            }
            return [...prev, gameId];
        });
    }

    if (loading) {
        return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
            <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading profile...
            </p>
            </div>
        </div>
        );
    }

    return(
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Edit Profile
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Update your profile information
                    </p>
                </header>
                <div className="max-w-2xl mx-auto">
                    <form onSubmit={handleFormSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                        <div className="mb-8">
                            <label>
                                Profile Picture
                            </label>
                            <div className="flex items-center space-x-6">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full overflow-hidden">
                                        <img
                                            src={formData.avatar_url || "/blank-profile.png"}
                                            alt="Profile"
                                            className="w-full h-full object cover"
                                        />
                                    </div>
                                    <PhotoUpload onPhotoUploaded={(url) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            avatar_url: url
                                        }))
                                    }}/>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Upload a new profile picture
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                        JPG, PNG or GIF, Mac 5MB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Photo upload */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Photos
                            </label>
                            <PhotoUploader photos={photoUrls} onPhotosChange={setPhotoUrls} />
                        </div>
                        
                        {/* Basic info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label
                                htmlFor="full_name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                Full Name *
                                </label>
                                <input
                                type="text"
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                Username *
                                </label>
                                <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="Choose a username"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label
                                htmlFor="gender"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                Gender *
                                </label>
                                <select
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label
                                htmlFor="birthdate"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                Birthday *
                                </label>
                                <input
                                type="date"
                                id="birthdate"
                                name="birthdate"
                                value={formData.birthdate}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>


                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Favourite Games ({selectedGameIds.length}/5)
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setGamesPickerOpen((prev) => !prev)}
                                    className="text-sm font-medium text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300"
                                >
                                    {gamesPickerOpen ? "Close" : "Edit games"}
                                </button>
                            </div>

                            {/* Selected games, always visible even when collapsed */}
                            {selectedGameIds.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {selectedGameIds.map((id) => {
                                        const game = availableGames.find((g) => g.id === id);
                                        if (!game) return null;
                                        return (
                                            <span
                                                key={id}
                                                className="px-3 py-1.5 bg-pink-500 text-white rounded-full text-sm font-medium"
                                                title={game.company}
                                            >
                                                {game.title}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}

                            {selectedGameIds.length === 0 && !gamesPickerOpen && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No games selected yet.</p>
                            )}

                            {/* Full picker grid, only when open */}
                            {gamesPickerOpen && (
                                <div className="flex flex-wrap gap-2 mt-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                                    {availableGames.map((game) => {
                                        const isSelected = selectedGameIds.includes(game.id);
                                        const isDisabled = !isSelected && selectedGameIds.length >= 5;

                                        return (
                                            <button
                                                key={game.id}
                                                type="button"
                                                onClick={() => toggleGame(game.id)}
                                                disabled={isDisabled}
                                                title={game.company}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors duration-200 ${
                                                    isSelected
                                                        ? "bg-pink-500 text-white border-pink-500"
                                                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                                                } ${isDisabled ? "opacity-40 cursor-not-allowed" : "hover:border-pink-400"}`}
                                            >
                                                {game.title}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="mb-8">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                Dating Preferences
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Age Range
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            name="age_min"
                                            min={18}
                                            max={99}
                                            value={formData.age_min}
                                            onChange={handleNumberChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                                        />
                                        <span className="text-gray-500">to</span>
                                        <input
                                            type="number"
                                            name="age_max"
                                            min={18}
                                            max={99}
                                            value={formData.age_max}
                                            onChange={handleNumberChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Maximum Distance ({formData.distance} km)
                                    </label>
                                    <input
                                        type="range"
                                        name="distance"
                                        min={1}
                                        max={200}
                                        value={formData.distance}
                                        onChange={handleNumberChange}
                                        className="w-full accent-pink-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    Interested In
                                </label>
                                <div className="flex gap-3">
                                    {(["male", "female", "other"] as const).map((g) => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => toggleGenderPreference(g)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium border capitalize transition-colors duration-200 ${
                                                formData.gender_preference.includes(g)
                                                    ? "bg-pink-500 text-white border-pink-500"
                                                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                                            }`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <label
                                htmlFor="bio"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                About Me *
                            </label>
                            <textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                required
                                rows={4}
                                maxLength={500}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                                placeholder="Tell others about yourself..."
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formData.bio.length}/500 characters
                            </p>
                        </div>

                        {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                        )}

                        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
}