import { useState, useEffect, useCallback } from "react";

const API_BASE = "https://play.kotagames.web.id/api";
const SESSION_KEY = "ne_session";

export interface SessionUser {
  id: number;
  username: string;
  email: string;
  tokens: number;
  account_type: number;
  klaim: number;
  created_at: string;
}

export interface SessionCharacter {
  id: number;
  user_id: number;
  name: string;
  level: number;
  xp: number;
  gender: number;
  rank: number;
  class: string | null;
  gold: number;
  tp: number;
  prestige: number;
  ss: number;
  element_1: number;
  element_2: number;
  element_3: number;
  point_wind: number;
  point_fire: number;
  point_lightning: number;
  point_water: number;
  point_earth: number;
  point_free: number;
  equipment_weapon: string | null;
  equipment_back: string | null;
  equipment_clothing: string | null;
  equipment_accessory: string | null;
  equipment_skills: string[] | null;
  equipment_pet: string | null;
  pvp_played: number;
  pvp_won: number;
  pvp_lost: number;
  pvp_trophy: number;
  last_login: string;
  double_xp_expire_at: string | null;
  xp_bonus_rate: number;
}

export interface SessionData {
  user: SessionUser;
  characters: SessionCharacter[];
  admin: boolean;
  donatur: boolean;
  donatur_nom: number;
}

export const getSession = () => localStorage.getItem(SESSION_KEY);
export const clearSession = () => localStorage.removeItem(SESSION_KEY);
export const setSession = (s: string) => localStorage.setItem(SESSION_KEY, s);

export const rankNames: Record<number, string> = {
  0: "Academy",
  1: "Genin",
  2: "Chunin",
  3: "Jounin",
  4: "Special Jounin",
  5: "Sanin",
  6: "Kage",
  7: "Legend",
  8: "Legend",
  9: "Legend",
  10: "Legend",
};

export const genderLabel = (g: number, lang: string) => {
  if (g === 0) return lang === "id" ? "Laki-Laki" : "Male";
  if (g === 1) return lang === "id" ? "Perempuan" : "Female";
  return "—";
};

export function useSession() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SessionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(async () => {
    const sesi = getSession();
    if (!sesi) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/me/${sesi}`);
      const json = await res.json();
      if (!json.status) {
        clearSession();
        setData(null);
        setError(json.message || "Session invalid");
      } else {
        setData({
          user: json.user,
          characters: json.characters || [],
          admin: json.admin || false,
          donatur: json.donatur || false,
          donatur_nom: json.donatur_nom || 0,
        });
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    validate();
  }, [validate]);

  const logout = useCallback(() => {
    clearSession();
    setData(null);
  }, []);

  return { loading, data, error, logout, refresh: validate, isLoggedIn: !!data };
}
