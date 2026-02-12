import api from "@/api/apiClient";
import { MachineVolume } from "@/constants/Machine";

export const USE_MOCK = false; // flip to false when your API is ready
type RawMachine = {
    id: string;
    machineId: string;                // e.g. "GH-000002"
    machineLocationName?: string;     // shown in your log
    bufferVolume?: number;            // shown in your log
    createdAt?: string;               // shown in your log
};
const DEFAULT_CAPACITY = 120;
function mapRawToVM(x: RawMachine): MachineVolume {
    return {
        id: x.id,
        machineId: x.machineId,
        machineLocationName: x.machineLocationName ?? "-",
        capacityLiters: DEFAULT_CAPACITY,
        bufferVolume: Number(x.bufferVolume ?? 0),
    };
}
export async function fetchCollectorMachines(): Promise<MachineVolume[]> {

    const res = await api.get<RawMachine[]>("/UCOTracking/get-collector");
    const list = Array.isArray(res.data) ? res.data : [];
    const mapped = list.map(mapRawToVM);
    return mapped;
}

export async function getMachines() {
    try {
        let res = await api.get('/machine/all');
        return res.data
    } catch (error) {
        console.error('Failed to fetch machine ID:', error);
    }
}

export async function getCollectorMachines() {
    try {
        let res = await api.get('/machine/collector');
        return res.data
    } catch (error) {
        console.error('Failed to fetch machine ID:', error);
    }
}
