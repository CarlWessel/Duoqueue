"use server";

import { UserProfile, VideoGame } from "@/app/profile/page";
import { createClient } from "../supabase/server";

// Helper: fetch favourite games for multiple users in one query,
// returns a map of user_id -> VideoGame[]
async function getFavouriteGamesForUsers(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userIds: string[]
): Promise<Record<string, VideoGame[]>> {
    if (userIds.length === 0) return {};

    const { data, error } = await supabase
        .from("user_favourite_games")
        .select("user_id, video_games(id, title, company)")
        .in("user_id", userIds);

    if (error) {
        console.error("Error fetching favourite games for users", error);
        return {};
    }

    const gamesByUser: Record<string, VideoGame[]> = {};
    for (const row of data ?? []) {
        const game = row.video_games as unknown as VideoGame;
        if (!gamesByUser[row.user_id]) {
            gamesByUser[row.user_id] = [];
        }
        gamesByUser[row.user_id].push(game);
    }
    return gamesByUser;
}

export async function getPotentialMatches(): Promise<UserProfile[]> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Not authenticated.");
    }

    // Get IDs of users already liked or passed on
    const [{ data: likedRows }, { data: passedRows }] = await Promise.all([
        supabase.from("likes").select("to_user_id").eq("from_user_id", user.id),
        supabase.from("passes").select("to_user_id").eq("from_user_id", user.id),
    ]);

    const excludedIds = new Set([
        ...(likedRows ?? []).map((r) => r.to_user_id),
        ...(passedRows ?? []).map((r) => r.to_user_id),
    ]);

    const { data: potentialMatches, error } = await supabase
        .from("users")
        .select("*")
        .neq("id", user.id)
        .limit(50);

    if (error) {
        throw new Error("failed to fetch potential matches");
    }

    const { data: userPrefs, error: prefsError } = await supabase
        .from("users")
        .select("preferences")
        .eq("id", user.id)
        .single();

    if (prefsError) {
        throw new Error("Failed to get user preferences");
    }

    const currentUserPrefs = userPrefs.preferences as any;
    const genderPreference = currentUserPrefs?.gender_preference || [];

    const filtered = (potentialMatches || []).filter((match) => {
        if (excludedIds.has(match.id)) {
            return false;
        }
        if (!genderPreference || genderPreference.length === 0) {
            return true;
        }
        return genderPreference.includes(match.gender);
    });

    const gamesByUser = await getFavouriteGamesForUsers(
        supabase,
        filtered.map((m) => m.id)
    );

    return filtered.map((match) => ({
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
        favourite_games: gamesByUser[match.id] || [],
    }));
}

export async function passUser(toUserId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Not authenticated.");
    }

    const { error } = await supabase.from("passes").insert({
        from_user_id: user.id,
        to_user_id: toUserId,
    });

    if (error) {
        console.error("passError:", error);
        // Ignore duplicate-pass errors (unique constraint) — harmless if it
        // happens, since the end result (excluded next time) is the same
        if (error.code !== "23505") {
            throw new Error(`Failed to record pass: ${error.message}`);
        }
    }

    return { success: true };
}

export async function likeUser(toUserId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Not authenticated.");
    }

    const { error: likeError } = await supabase.from("likes").insert({
        from_user_id: user.id,
        to_user_id: toUserId,
    });

    if (likeError) {
        //throw new Error("Failed to create like");
        console.error("likeError:", likeError);
        throw new Error(`Failed to create like: ${likeError.message}`);
    }

    const { data: existingLike, error: checkError } = await supabase
        .from("likes")
        .select("*")
        .eq("from_user_id", toUserId)
        .eq("to_user_id", user.id)
        .single();

    if (checkError && checkError.code !== "PGRST116") {
        throw new Error("Failed to check for match");
    }

    if (existingLike) {
        const { data: matchedUser, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", toUserId)
            .single();

        if (userError) {
            throw new Error("Failed to fetch matched user");
        }

        const gamesByUser = await getFavouriteGamesForUsers(supabase, [toUserId]);

        return {
            success: true,
            isMatch: true,
            matchedUser: {
                ...matchedUser,
                favourite_games: gamesByUser[toUserId] || [],
            } as UserProfile,
        };
    }

    return { success: true, isMatch: false };
}

export async function getUserMatches() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Not authenticated.");
    }

    const { data: matches, error } = await supabase
        .from("matches")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq("is_active", true);

    if (error) {
        throw new Error("Failed to fetch matches");
    }

    const otherUserIds = (matches || []).map((m) =>
        m.user1_id === user.id ? m.user2_id : m.user1_id
    );

    if (otherUserIds.length === 0) {
        return [];
    }

    const { data: otherUsers, error: usersError } = await supabase
        .from("users")
        .select("*")
        .in("id", otherUserIds);

    if (usersError) {
        throw new Error("Failed to fetch matched users");
    }

    const gamesByUser = await getFavouriteGamesForUsers(supabase, otherUserIds);

    return (matches || [])
        .map((match) => {
            const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
            const otherUser = otherUsers?.find((u) => u.id === otherUserId);
            if (!otherUser) return null;

            return {
                id: otherUser.id,
                full_name: otherUser.full_name,
                username: otherUser.username,
                email: otherUser.email,
                gender: otherUser.gender,
                birthdate: otherUser.birthdate,
                bio: otherUser.bio,
                avatar_url: otherUser.avatar_url,
                preferences: otherUser.preferences,
                location_lat: undefined,
                location_lng: undefined,
                last_active: new Date().toISOString(),
                is_verified: true,
                is_online: false,
                created_at: match.created_at,
                updated_at: match.created_at,
                favourite_games: gamesByUser[otherUserId] || [],
            } as UserProfile;
        })
        .filter((u): u is UserProfile => u !== null);
}