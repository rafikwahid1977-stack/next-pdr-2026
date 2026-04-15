import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook pour afficher un toast de bienvenue quand l'utilisateur accède à une page privée
 * Le toast s'affiche une seule fois par session utilisateur
 */
export function useWelcomeToast() {
  const { user } = useAuth();
  const hasShownToast = useRef(false);

  useEffect(() => {
    // Afficher le toast seulement si:
    // 1. L'utilisateur est connecté
    // 2. On n'a pas déjà affichéle toast dans cette session
    if (user?.username && !hasShownToast.current) {
      hasShownToast.current = true;

      // Afficher le toast de bienvenue pendant 2 secondes
      const toastId = toast.success(`Bienvenue ${user.username}! 👋`, {
        duration: 2000,
        position: "top-center",
      });
    }
  }, [user?.username]);
}
