import { cleanWebSocketClient } from "@/lib/singleton-socket";
import { useLiveSpectatorStore } from "@/store/live-quiz/useLiveQuizUserStore"
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";


export const useSpectatorWarning = () => {
    const { spectatorData } = useLiveSpectatorStore();
    const router = useRouter();

    useEffect(() => {
        if (spectatorData?.isKicked) {
            cleanWebSocketClient();
            router.back();
            toast.error("You've been kicked!");
        }
    }, [spectatorData?.isKicked])
}