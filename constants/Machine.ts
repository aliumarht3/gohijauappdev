export type MachineVolume = {
    id: string;
    machineId: string;
    machineLocationName: string;
    location?: string;
    capacityLiters: number;
    bufferVolume: number;
    // lastCollectionAt?: string; // ISO
    // status?: "Online" | "Offline" | "Maintenance";
};

export type MachinesApiResponse = {
    items: MachineVolume[];
};