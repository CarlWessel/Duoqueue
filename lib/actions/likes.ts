"use server";

import { createClient } from "@/lib/supabase/server";
import { UserProfile } from "@/app/profile/page";

/**
 * Returns the profiles of everyone who has liked the current user
 * but is not yet matched with them (i.e. the current user hasn't
 * liked them back yet).
 */
export async function getUserLikes(): Promise<UserProfile[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  // Everyone who has liked the current user
  const { data: likes, error: likesError } = await supabase
    .from("likes")
    .select("from_user_id")
    .eq("to_user_id", user.id);

  if (likesError) {
    throw new Error(likesError.message);
  }

  if (!likes || likes.length === 0) {
    return [];
  }

  const likerIds = likes.map((like) => like.from_user_id);

  // Exclude anyone who's already a match (mutual like already happened,
  // so the trigger already created the match row)
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("user1_id, user2_id")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

  if (matchesError) {
    throw new Error(matchesError.message);
  }

  const matchedIds = new Set(
    (matches ?? []).flatMap((m) =>
      m.user1_id === user.id ? [m.user2_id] : [m.user1_id]
    )
  );

  const pendingLikerIds = likerIds.filter((id) => !matchedIds.has(id));

  if (pendingLikerIds.length === 0) {
    return [];
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("users")
    .select("*")
    .in("id", pendingLikerIds);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  return profiles ?? [];
}

/**
 * Accepts an incoming like by liking the sender back.
 * The create_match_trigger in the DB fires on this insert and
 * creates the match row automatically, since the other like
 * already exists.
 *
 * Uses upsert with ignoreDuplicates so re-accepting (e.g. after a
 * match row was manually deleted while the underlying like row
 * still exists) doesn't throw a unique-constraint error. Note:
 * if the like row already existed, the insert is skipped and the
 * match trigger will NOT re-fire — if you need the match row itself
 * recreated, that has to be handled separately (e.g. check for the
 * match after this call and create it manually if still missing).
 */
export async function acceptLike(likerId: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("likes")
    .upsert(
      { from_user_id: user.id, to_user_id: likerId },
      { onConflict: "from_user_id,to_user_id", ignoreDuplicates: true }
    );

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Rejects an incoming like by deleting it. Relies on the
 * "Users can reject likes sent to them" RLS policy, which lets
 * the recipient (to_user_id) delete a like sent to them.
 */
export async function rejectLike(likerId: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("likes")
    .delete()
    .eq("from_user_id", likerId)
    .eq("to_user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}