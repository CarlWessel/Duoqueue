"use server";

import { UserProfile, VideoGame } from "@/app/profile/page";
import { createClient } from "../supabase/server";
import { calculateAge } from "@/lib/helpers/calculate-age";

// Helpers

// Haversine formula — straight-line distance in km between two lat/lng points
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Fetch favourite games for multiple users in one query,
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

const AGE_MARGIN_YEARS = 2;
const DISTANCE_MARGIN_KM = 10;

// Discovery / ranking

export async function getPotentialMatches(): Promise<UserProfile[]> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Not authenticated.");
    }

    // Already-liked / already-passed exclusion
    const [{ data: likedRows }, { data: passedRows }] = await Promise.all([
        supabase.from("likes").select("to_user_id").eq("from_user_id", user.id),
        supabase.from("passes").select("to_user_id").eq("from_user_id", user.id),
    ]);

    const excludedIds = new Set([
        ...(likedRows ?? []).map((r) => r.to_user_id),
        ...(passedRows ?? []).map((r) => r.to_user_id),
    ]);

    // Current user's own data: preferences, location, and their own games
    const { data: currentUserRow, error: currentUserError } = await supabase
        .from("users")
        .select("preferences, location_lat, location_lng")
        .eq("id", user.id)
        .single();

    if (currentUserError || !currentUserRow) {
        throw new Error("Failed to get current user data");
    }

    const prefs = currentUserRow.preferences as any;
    const ageMin: number = prefs?.age_range?.min ?? 18;
    const ageMax: number = prefs?.age_range?.max ?? 99;
    const preferredDistance: number = prefs?.distance ?? 25;
    const genderPreference: string[] = prefs?.gender_preference || [];

    const myLat = currentUserRow.location_lat;
    const myLng = currentUserRow.location_lng;
    const haveMyLocation = myLat != null && myLng != null;

    const { data: myGameRows } = await supabase
        .from("user_favourite_games")
        .select("game_id")
        .eq("user_id", user.id);

    const myGameIds = new Set((myGameRows ?? []).map((r) => r.game_id));

    // Candidate pool — wider than final result since filtering is more
    // aggressive now (age margin, distance margin, already liked/passed)
    const { data: potentialMatches, error } = await supabase
        .from("users")
        .select("*")
        .neq("id", user.id)
        .limit(200);

    if (error) {
        throw new Error("failed to fetch potential matches");
    }

    const gamesByUser = await getFavouriteGamesForUsers(
        supabase,
        (potentialMatches ?? []).map((m) => m.id)
    );

    type Ranked = {
        match: (typeof potentialMatches)[number];
        ageTier: number; // 0 = exact range, 1 = within margin
        distanceTier: number; // 0 = within preferred, 1 = within margin, 2 = unknown location
        sharedGame: boolean;
    };

    const ranked: Ranked[] = [];

    for (const match of potentialMatches ?? []) {
        if (excludedIds.has(match.id)) continue;

        // Gender preference filter
        if (genderPreference.length > 0 && !genderPreference.includes(match.gender)) {
            continue;
        }

        // --- Age filter + tier ---
        const age = calculateAge(match.birthdate);
        let ageTier: number;
        if (age >= ageMin && age <= ageMax) {
            ageTier = 0;
        } else if (age >= ageMin - AGE_MARGIN_YEARS && age <= ageMax + AGE_MARGIN_YEARS) {
            ageTier = 1;
        } else {
            continue; // outside margin entirely — excluded
        }

        // --- Distance filter + tier ---
        let distanceTier: number;
        const theirLat = match.location_lat;
        const theirLng = match.location_lng;
        const haveTheirLocation = theirLat != null && theirLng != null;

        if (!haveMyLocation || !haveTheirLocation) {
            // Can't compute — don't exclude, just rank after everyone with known distance
            distanceTier = 2;
        } else {
            const distanceKm = getDistanceKm(myLat, myLng, theirLat, theirLng);
            if (distanceKm <= preferredDistance) {
                distanceTier = 0;
            } else if (distanceKm <= preferredDistance + DISTANCE_MARGIN_KM) {
                distanceTier = 1;
            } else {
                continue; // beyond margin entirely — excluded
            }
        }

        // --- Shared game check ---
        const theirGames = gamesByUser[match.id] || [];
        const sharedGame = theirGames.some((g) => myGameIds.has(g.id));

        ranked.push({ match, ageTier, distanceTier, sharedGame });
    }

    // Sort: age tier first, then distance tier, then shared game priority
    ranked.sort((a, b) => {
        if (a.ageTier !== b.ageTier) return a.ageTier - b.ageTier;
        if (a.distanceTier !== b.distanceTier) return a.distanceTier - b.distanceTier;
        if (a.sharedGame !== b.sharedGame) return a.sharedGame ? -1 : 1;
        return 0;
    });

    return ranked.map(({ match }) => ({
        id: match.id,
        full_name: match.full_name,
        username: match.username,
        email: "",
        gender: match.gender,
        birthdate: match.birthdate,
        bio: match.bio,
        avatar_url: match.avatar_url,
        photo_urls: match.photo_urls || [],
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

// Likes / passes

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
                photo_urls: matchedUser.photo_urls || [],
                favourite_games: gamesByUser[toUserId] || [],
            } as UserProfile,
        };
    }

    return { success: true, isMatch: false };
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
        // Ignore duplicate-pass errors (unique constraint) — harmless,
        // the end result (excluded next time) is the same either way
        if (error.code !== "23505") {
            throw new Error(`Failed to record pass: ${error.message}`);
        }
    }

    return { success: true };
}

// Matches list

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
            photo_urls: otherUser.photo_urls || [],
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

// Sent likes ("who have I liked")

export async function getSentLikes(): Promise<(UserProfile & { isMatch: boolean })[]> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Not authenticated.");
    }

    const { data: likedRows, error: likesError } = await supabase
        .from("likes")
        .select("to_user_id")
        .eq("from_user_id", user.id);

    if (likesError) {
        throw new Error("Failed to fetch sent likes");
    }

    const likedIds = (likedRows ?? []).map((r) => r.to_user_id);

    if (likedIds.length === 0) {
        return [];
    }

    const [{ data: likedUsers, error: usersError }, { data: matchRows }, gamesByUser] =
        await Promise.all([
            supabase.from("users").select("*").in("id", likedIds),
            supabase
                .from("matches")
                .select("user1_id, user2_id")
                .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
                .eq("is_active", true),
            getFavouriteGamesForUsers(supabase, likedIds),
        ]);

    if (usersError) {
        throw new Error("Failed to fetch liked user profiles");
    }

    const matchedIds = new Set(
        (matchRows ?? []).map((m) => (m.user1_id === user.id ? m.user2_id : m.user1_id))
    );

    return (likedUsers ?? []).map((u) => ({
        id: u.id,
        full_name: u.full_name,
        username: u.username,
        email: "",
        gender: u.gender,
        birthdate: u.birthdate,
        bio: u.bio,
        avatar_url: u.avatar_url,
        photo_urls: u.photo_urls || [],
        preferences: u.preferences,
        location_lat: undefined,
        location_lng: undefined,
        last_active: new Date().toISOString(),
        is_verified: true,
        is_online: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        favourite_games: gamesByUser[u.id] || [],
        isMatch: matchedIds.has(u.id),
    }));
}