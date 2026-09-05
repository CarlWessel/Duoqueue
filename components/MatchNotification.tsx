import { UserProfile } from "@/app/profile/page";

interface MatchNotificationProps{
    match: UserProfile;
    onClose: () => void;
    onStartChat: () => void;
}

export default function MatchNotification({match, onClose, onStartChat}: MatchNotificationProps){
    return(
        <div>New Match</div>
    );
}