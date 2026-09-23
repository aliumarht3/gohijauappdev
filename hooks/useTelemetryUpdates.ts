import * as signalR from '@microsoft/signalr';
import { useEffect, useRef } from 'react';
import authStorage from '../api/authStorage';

export const useTelemetryUpdates = (onUpdateReceived: (payload: any) => void) => {
  const callbackRef = useRef(onUpdateReceived);

  // Keep callback ref updated so we don't trigger unnecessary re-renders
  useEffect(() => {
    callbackRef.current = onUpdateReceived;
  }, [onUpdateReceived]);

  useEffect(() => {
    let connection: signalR.HubConnection;

    const setupSignalR = async () => {
      const token = await authStorage.getAccessToken();

      connection = new signalR.HubConnectionBuilder()
        .withUrl("https://services.gohijau.org/machineHub", {
          accessTokenFactory: () => token || ''
        })
        .withAutomaticReconnect()
        .build();

      connection.on("ReceiveTelemetryUpdate", (updatedMachine) => {
        callbackRef.current(updatedMachine);
      });

      connection.on("ReceiveStatus", (machineId, status) => {
        callbackRef.current({ 
            machineId, 
            isOnline: status === "Active",
            activeStatus: status 
        });
      });

      try {
        await connection.start();
        console.log("🟢 Connected to live telemetry stream");
      } catch (err) {
        console.error("🔴 SignalR Connection Error: ", err);
      }
    };

    setupSignalR();

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, []);
};