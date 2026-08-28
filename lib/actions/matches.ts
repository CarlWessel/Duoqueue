"use server"

import { UserProfile } from "@/app/profile/page";
import { createClient } from "../supabase/server"

export async function getPotentialMatches(): Promise<UserProfile[]> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if(!user){
        throw new Error("Not authenticated.");
    }

    const {data: potentialMatches, error} = await supabase.from("users").select("*").neq("id", user.id).limit(50);

    if(error){
        throw new Error("failed to fetch potential matches");
    }

    const {data: userPrefs, error: prefsError} = await supabase.from("users").select("preferences").eq("id", user.id).single();

    if(prefsError){
        throw new Error("Failed to get user preferences");
    }

    const currentUserPrefs = userPrefs.preferences as any;
    const genderPreference = currentUserPrefs.gender_preference || [];

    const filteredMatches = potentialMatches.filter((match) => {
        if(!genderPreference || genderPreference.length === 0){
            return true;
        }

        return genderPreference.include(match.gender);
    }).map((match) => ({
        id: match.id,
        full_name: match.full_name,
        username: match.username,
        email: "",
        gender: match.gender,
        birthdate: match.birthdate,
        bio: match.bio,
        avatar_url: match.avatar_url,
        preferences: match.preferences,
        location_lat: undefined,
        location_lng: undefined,
        last_active: new Date().toISOString(),
        is_verified: true,
        is_online: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    })) || [];
    return filteredMatches;
}