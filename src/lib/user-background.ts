import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const DEFAULT_BACKGROUND_IMAGE = "/barbearia-bg.png";

export interface UserBackground {
  url: string;
  path: string | null; // chave do objeto no R2, null quando é o fundo padrão
}

export const DEFAULT_USER_BACKGROUND: UserBackground = {
  url: DEFAULT_BACKGROUND_IMAGE,
  path: null,
};

export async function getUserBackground(uid: string): Promise<UserBackground> {
  const snap = await getDoc(doc(db, "userPreferences", uid));
  const saved = snap.data()?.backgroundImage as UserBackground | undefined;

  if (!saved?.url) return DEFAULT_USER_BACKGROUND;
  return saved;
}

export const BACKGROUND_UPDATED_EVENT = "background-image-updated";

export async function setUserBackground(uid: string, background: UserBackground) {
  await setDoc(doc(db, "userPreferences", uid), { backgroundImage: background }, { merge: true });
  window.dispatchEvent(new CustomEvent(BACKGROUND_UPDATED_EVENT, { detail: background }));
}
