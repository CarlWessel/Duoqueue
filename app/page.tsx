import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/actions/profile";

export default async function Home() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/auth");
  }
  
  if (!profile.avatar_url) {
    redirect("/profile/edit");
  }

  redirect("/matches");
}