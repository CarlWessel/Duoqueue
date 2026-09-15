import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PASSWORD = "password";

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Fake profile data - League of Legends champions
// Avatar images served from Community Dragon's CDN (community-maintained,
// hotlink-friendly mirror of Riot's game data, no version pinning needed).
const fakeProfiles = [
  {
    full_name: "Ahri",
    username: "ahri_9tails",
    email: "ahri@example.com",
    gender: "female" as const,
    birthdate: "1900-03-15",
    bio: "Smell bad 🦊✨",
    avatar_url:
      "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/103.png",
    preferences: {
      age_range: { min: 99, max: 99 },
      distance: 50,
      gender_preference: ["male"],
    },
  },

  {
    full_name: "Lux",
    username: "lux_lightbringer",
    email: "lux@example.com",
    gender: "female" as const,
    birthdate: "1900-11-08",
    bio: "DEMENCIA!! ✨📖",
    avatar_url:
      "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/99.png",
    preferences: {
      age_range: { min: 99, max: 99 },
      distance: 25,
      gender_preference: ["male"],
    },
  },
  {
    full_name: "Ezreal",
    username: "ez_explorer",
    email: "ezreal@example.com",
    gender: "male" as const,
    birthdate: "1900-05-12",
    bio: "YoU bElOnG iN a MuSeUm 🗺️⚡",
    avatar_url:
      "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/81.png",
    preferences: {
      age_range: { min: 99, max: 99 },
      distance: 40,
      gender_preference: ["female"],
    },
  },

  {
    full_name: "Miss Fortune",
    username: "mf_bounty_hunter",
    email: "missfortune@example.com",
    gender: "female" as const,
    birthdate: "1900-02-28",
    bio: "Looking for my husband Nick 🏴‍☠️💰",
    avatar_url:
      "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/21.png",
    preferences: {
      age_range: { min: 99, max: 99 },
      distance: 30,
      gender_preference: ["male"],
    },
  },
  {
    full_name: "Garen",
    username: "garen_might",
    email: "garen@example.com",
    gender: "male" as const,
    birthdate: "1900-06-14",
    bio: "DEMACIIIAAAA!!! 🛡️💪",
    avatar_url:
      "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/86.png",
    preferences: {
      age_range: { min: 99, max: 99 },
      distance: 50,
      gender_preference: ["female"],
    },
  },
];

async function deleteFakeProfiles() {
  console.log("🗑️  Deleting existing champion profiles (if any)...");

  // listUsers() paginates (50 per page by default) - pull every page so we
  // don't miss a champion just because there are >50 users in the project.
  const existingAuthUsers: { id: string; email?: string }[] = [];
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) {
      console.error("❌ Error listing auth users:", error);
      break;
    }
    existingAuthUsers.push(...data.users);
    if (data.users.length < 1000) break;
    page++;
  }

  for (const profile of fakeProfiles) {
    try {
      const existingAuthUser = existingAuthUsers.find(
        (u) => u.email === profile.email
      );

      if (!existingAuthUser) {
        continue; // nothing to delete for this profile
      }

      const userId = existingAuthUser.id;

      // Remove the profile row first (FK to auth.users typically cascades,
      // but we do it explicitly to be safe regardless of schema setup).
      const { error: deleteProfileError } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (deleteProfileError) {
        console.error(
          `❌ Error deleting profile row for ${profile.full_name}:`,
          deleteProfileError
        );
      }

      // Remove the auth user
      const { error: deleteAuthError } =
        await supabase.auth.admin.deleteUser(userId);

      if (deleteAuthError) {
        console.error(
          `❌ Error deleting auth user for ${profile.full_name}:`,
          deleteAuthError
        );
      } else {
        console.log(`✅ Deleted existing profile for ${profile.full_name}`);
      }
    } catch (error) {
      console.error(
        `❌ Unexpected error deleting profile for ${profile.full_name}:`,
        error
      );
    }
  }

  console.log("🗑️  Cleanup pass complete.\n");
}

async function createFakeProfiles() {
  console.log("🚀 Starting to create fake profiles...");

  for (let i = 0; i < fakeProfiles.length; i++) {
    const profile = fakeProfiles[i];

    try {
      console.log(`\n📝 Creating profile ${i + 1}/${fakeProfiles.length}: ${profile.full_name}`);

      // Create new auth user (existing ones were removed in deleteFakeProfiles)
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: profile.email,
          password: PASSWORD,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            full_name: profile.full_name,
            username: profile.username,
          },
        });

      if (authError) {
        console.error(
          `❌ Error creating auth user for ${profile.full_name}:`,
          authError
        );
        continue;
      }

      const userId = authData.user.id;
      console.log(`✅ Auth user created: ${userId}`);

      // Upsert profile data. Some Supabase projects have a trigger on
      // auth.users that auto-creates a bare-bones public.users row the
      // moment the auth user is created - if that already happened, a
      // plain insert() here would hit a duplicate key error on `id`.
      // upsert() fills in the full profile either way.
      const { error: profileError } = await supabase.from("users").upsert(
        {
          id: userId,
          full_name: profile.full_name,
          username: profile.username,
          email: profile.email,
          gender: profile.gender,
          birthdate: profile.birthdate,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          preferences: profile.preferences,
          location_lat: faker.location.latitude({ min: 37.7, max: 37.8 }), // San Francisco area
          location_lng: faker.location.longitude({ min: -122.5, max: -122.4 }),
          is_verified: true,
          is_online: Math.random() > 0.5,
        },
        { onConflict: "id" }
      );

      if (profileError) {
        console.error(
          `❌ Error creating profile for ${profile.full_name}:`,
          profileError
        );
        // Try to clean up the auth user if profile creation fails
        await supabase.auth.admin.deleteUser(userId);
        continue;
      }

      console.log(`✅ Profile created successfully for ${profile.full_name}`);
      console.log(`   📧 Email: ${profile.email}`);
      console.log(`   🔑 Password: ${PASSWORD}`);
      console.log(`   👤 Username: ${profile.username}`);
    } catch (error) {
      console.error(
        `❌ Unexpected error creating profile for ${profile.full_name}:`,
        error
      );
    }
  }

  console.log("\n🎉 Fake profile creation completed!");
  console.log("\n📋 Summary:");
  console.log('All accounts use password: "password"');
  console.log("All emails are auto-confirmed");
  console.log("Profiles include random location data in San Francisco area");
  console.log("Some users are marked as online for testing");
}

// Run the script: wipe any existing champion profiles, then recreate them fresh
async function main() {
  await deleteFakeProfiles();
  await createFakeProfiles();
}

main().catch(console.error);