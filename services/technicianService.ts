import { getMachines } from './machine';

const ACTIVE_STATUSES = new Set(['DEPLOYED', 'RUNNING']);
const ATTENTION_STATUSES = new Set(['MAINTENANCE', 'STOPPED']);

export type TechnicianDashboardStats = {
  totalMachines: number;
  activeMachines: number;
  needsAttentionCount: number;
  locationLabel: string | null;
};

type RawMachine = {
  technician?: string;
  status?: string;
  location?: {
    district?: string;
    state?: string;
    name?: string;
  };
};

function formatLocation(location?: RawMachine['location']): string | null {
  if (!location) return null;
  const parts = [location.district, location.state].filter((p) => p && String(p).trim());
  if (parts.length > 0) return parts.join(', ');
  if (location.name?.trim()) return location.name.trim();
  return null;
}

export async function fetchTechnicianDashboardStats(
  userId: string,
): Promise<TechnicianDashboardStats> {
  const raw = await getMachines();
  const machines: RawMachine[] = Array.isArray(raw) ? raw : [];
  const assigned = machines.filter((m) => m.technician && m.technician === userId);
  const list = assigned.length > 0 ? assigned : machines;

  const totalMachines = list.length;
  const activeMachines = list.filter((m) =>
    ACTIVE_STATUSES.has(String(m.status ?? '').toUpperCase()),
  ).length;
  const needsAttentionCount = list.filter((m) =>
    ATTENTION_STATUSES.has(String(m.status ?? '').toUpperCase()),
  ).length;

  const locationLabel = formatLocation(assigned[0]?.location ?? list[0]?.location);

  return {
    totalMachines,
    activeMachines,
    needsAttentionCount,
    locationLabel,
  };
}
