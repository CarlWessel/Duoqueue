"use server"

import { UserProfile, VideoGame } from "@/app/profile/page";
import { createClient } from "../supabase/server"

export async function getCurrentUserProfile(){
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if(!user){
        return null
    }

    const [{ data: profile, error: profileError }, { data: gamesData, error: gamesError }] =
        await Promise.all([
            supabase.from("users").select("*").eq("id", user.id).single(),
            supabase
                .from("user_favourite_games")
                .select("video_games(id, title, company)")
                .eq("user_id", user.id),
        ]);

    if (profileError || !profile) {
        console.error("Error fetching profile", profileError);
        return null;
    }

    return {
        ...profile,
        favourite_games: (gamesData ?? []).map((row) => row.video_games) as unknown as VideoGame[],
    };
}

export async function updateUserProfile(profileData: Partial<UserProfile> & {
    age_min?: number;
    age_max?: number;
    distance?: number;
    gender_preference?: ("male" | "female" | "other")[];
}){
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if(!user){
        return {success: false, error: "User not authenticated"};
    }

    const {error} = await supabase.from("users").update({
        full_name: profileData.full_name,
        username: profileData.username,
        bio: profileData.bio,
        gender: profileData.gender,
        birthdate: profileData.birthdate,
        avatar_url: profileData.avatar_url,
        preferences: {
            age_range: { min: profileData.age_min, max: profileData.age_max },
            distance: profileData.distance,
            gender_preference: profileData.gender_preference,
        },
        updated_at: new Date().toISOString(),
    }).eq("id", user.id);

    if(error){
        console.log(error);
        return { success: false, error: error.message };
    }

    return { success:true }
}

export async function uploadProfilePhoto(file: File){
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if(!user){
        return {success: false, error: "User not authenticated"};
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const {error} = await supabase.storage.from("profile photos").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
    })

    if (error) {
        return { success: false, error: error.message };
    }

    const {data: {publicUrl}} = supabase.storage.from("profile photos").getPublicUrl(fileName);
    return { success: true, url: publicUrl };
}


export async function updateUserFavouriteGames(gameIds: number[]) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "User not authenticated" };
    }

    if (gameIds.length > 5) {
        return { success: false, error: "You can only select up to 5 games" };
    }

    // Clear existing picks, then insert the new set
    const { error: deleteError } = await supabase
        .from("user_favourite_games")
        .delete()
        .eq("user_id", user.id);

    if (deleteError) {
        console.error(deleteError);
        return { success: false, error: deleteError.message };
    }

    if (gameIds.length === 0) {
        return { success: true };
    }

    const { error: insertError } = await supabase
        .from("user_favourite_games")
        .insert(gameIds.map((gameId) => ({ user_id: user.id, game_id: gameId })));

    if (insertError) {
        console.error(insertError);
        return { success: false, error: insertError.message };
    }

    return { success: true };
}

export async function getAvailableVideoGames() {
    const supabase = await createClient();

    const { data: games, error } = await supabase
        .from("video_games")
        .select("id, title, company")
        .order("title", { ascending: true });

    if (error) {
        console.error("Error fetching video games", error);
        return [];
    }

    return games as VideoGame[];
}

export async function uploadGalleryPhoto(file: File) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "User not authenticated" };
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-gallery-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage.from("profile photos").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
    });

    if (error) {
        return { success: false, error: error.message };
    }

    const { data: { publicUrl } } = supabase.storage.from("profile photos").getPublicUrl(fileName);
    return { success: true, url: publicUrl };
}

export async function updateUserPhotos(photoUrls: string[]) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "User not authenticated" };
    }

    if (photoUrls.length > 5) {
        return { success: false, error: "You can only have up to 5 photos" };
    }

    const { error } = await supabase.from("users").update({
        photo_urls: photoUrls,
        updated_at: new Date().toISOString(),
    }).eq("id", user.id);

    if (error) {
        console.error(error);
        return { success: false, error: error.message };
    }

    return { success: true };
}