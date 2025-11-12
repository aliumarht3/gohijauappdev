import { MachineVolume } from "@/constants/Machine";
import { fetchCollectorMachines } from "@/services/machine";
import * as SignalR from "@microsoft/signalr";
import Constants from "expo-constants";
import * as React from "react";
export function useMachineLiveUpdates(
    enabled: boolean,
    onVolume: (m: Partial<MachineVolume>) => void
) {
    const connRef = React.useRef<SignalR.HubConnection | null>(null);

    const { signalRUrl } = Constants.expoConfig?.extra ?? {};
    React.useEffect(() => {
        if (!enabled) return;

        const conn = new SignalR.HubConnectionBuilder()
            .withUrl(`${signalRUrl}/machineHub`)
            .withAutomaticReconnect()
            .build();

        connRef.current = conn;

        conn
            .start()
            .then(async () => {
                const machines = await fetchCollectorMachines(); // MachineVolume[]
                const machineIds = machines.map(m => m.machineId).filter(Boolean);

                // subscribe in batches (safety for long lists)
                const BATCH = 50;
                for (let i = 0; i < machineIds.length; i += BATCH) {
                    await conn.invoke("SubscribeMachines", machineIds.slice(i, i + BATCH));
                }
                conn.on("ReceiveMachineVolumeUpdate", (payload: Partial<MachineVolume>) => {
                    if (payload?.machineId) onVolume(payload);
                });
                conn.onreconnected(async () => {
                    for (let i = 0; i < machineIds.length; i += BATCH) {
                        await conn.invoke("SubscribeMachines", machineIds.slice(i, i + BATCH));
                    }
                });

            })
            .catch((e) => console.log("SignalR start error", e));

        return () => {
            conn.stop().catch(() => { });
            connRef.current = null;
        };
    }, [enabled, onVolume]);
}
