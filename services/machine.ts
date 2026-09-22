import api from "@/api/apiClient";
import { MachineVolume } from "@/constants/Machine";

// Flip to true to use dummy data while the backend is down
export const USE_MOCK = true; 

// DUMMY DATA INJECTION
const DUMMY_MACHINES: MachineVolume[] = [
    {
        id: "1",
        machineId: "GO-000003",
        machineLocationName: "Masjid Al-Abrar Kariah Taman Keladi",
        capacityLiters: 100,
        bufferVolume: 0,
        isOnline: true,
        metrics: { mainTankVolumeLiters: 120, turbidityValue: 150, junkTankDistanceCm: 15 }
    },
    {
        id: "2",
        machineId: "GO-000009",
        machineLocationName: "Masjid Sultan Abdul Halim",
        capacityLiters: 100,
        bufferVolume: 0,
        isOnline: false,
        metrics: { mainTankVolumeLiters: 180, turbidityValue: 650, junkTankDistanceCm: 5 } 
    }
];

type RawMachine = {
    id: string;
    machineId: string;                
    machineLocationName?: string;     
    bufferVolume?: number;            
    createdAt?: string;               
    // Added new telemetry fields expected from backend
    isOnline?: boolean;
    metrics?: {
        mainTankVolumeLiters: number;
        turbidityValue: number;
        junkTankDistanceCm: number;
    };
};

// Changed to 100 to match Vue downscaling
const DEFAULT_CAPACITY = 100; 

function mapRawToVM(x: RawMachine): MachineVolume {
    return {
        id: x.id,
        machineId: x.machineId,
        machineLocationName: x.machineLocationName ?? "-",
        capacityLiters: DEFAULT_CAPACITY,
        bufferVolume: Number(x.bufferVolume ?? 0),
        isOnline: x.isOnline ?? false,
        metrics: x.metrics ?? { mainTankVolumeLiters: 0, turbidityValue: 0, junkTankDistanceCm: 0 }
    };
}

export async function fetchCollectorMachines(): Promise<MachineVolume[]> {
    if (USE_MOCK) {
        // This sends your new DUMMY_MACHINES to the screen
        return new Promise((resolve) => setTimeout(() => resolve(DUMMY_MACHINES), 800));
    }

    const res = await api.get<RawMachine[]>("/UCOTracking/get-collector");
    const list = Array.isArray(res.data) ? res.data : [];
    return list.map(mapRawToVM);
}

export const fetchMachineTelemetry = async () => {
    if (USE_MOCK) {
        return new Promise((resolve) => setTimeout(() => resolve(DUMMY_MACHINES), 800));
    }
    const response = await api.get('/api/machine/telemetry');
    return response.data;
};

export async function getMachines() {
    try {
        let res = await api.get('/machine/all');
        return res.data;
    } catch (error) {
        console.error('Failed to fetch machines:', error);
    }
}

export async function getCollectorMachines() {
    try {
        let res = await api.get('/machine/collector');
        return res.data;
    } catch (error) {
        console.error('Failed to fetch collector machines:', error);
    }
}