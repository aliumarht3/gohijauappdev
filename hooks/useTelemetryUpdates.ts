import * as signalR from '@microsoft/signalr';
import { useEffect, useState } from 'react';
import { fetchMachineTelemetry } from '../services/machine';

export const useTelemetryUpdates = () => {
  const [machines, setMachines] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadTelemetry = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchMachineTelemetry();
      setMachines(data || []);
    } catch (error) {
      console.error("Failed to fetch telemetry:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTelemetry();

    // Use your production URL or your local network IP if testing locally
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://services.gohijau.org/machineHub') 
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveTelemetryUpdate", (updatedMachine) => {
      setMachines((prev) => {
        const index = prev.findIndex(m => m.machineId === updatedMachine.machineId);
        if (index !== -1) {
          const newMachines = [...prev];
          newMachines[index] = updatedMachine;
          return newMachines;
        }
        return [...prev, updatedMachine];
      });
    });

    connection.start().catch(err => console.error("SignalR Connection Error: ", err));

    return () => {
      connection.stop();
    };
  }, []);

  return { machines, isRefreshing, loadTelemetry };
};