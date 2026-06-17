import { Role } from "@/contexts/AuthContext";

export function shouldShowGamePopup(role?: Role | null): boolean {
  return !!role && role !== Role.SuperAdmin;
}
