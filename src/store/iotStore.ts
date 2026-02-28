import { create } from 'zustand';

export interface IoTDevice {
    id: string;
    type: string;
    location: string;
    cpu: number;
    temp: number;
    latency: number;
    timestamp: number;
}

interface IoTState {
    devices: Record<string, IoTDevice>;
    history: Record<string, IoTDevice[]>;
    updateTelemetry: (incoming: IoTDevice[]) => void;
}

export const useIoTStore = create<IoTState>((set) => ({
    devices: {},
    history: {},
    updateTelemetry: (incoming) => set((state) => {
        const nextDevices = { ...state.devices };
        const nextHistory = { ...state.history };

        incoming.forEach(device => {
            nextDevices[device.id] = device;

            if (!nextHistory[device.id]) {
                nextHistory[device.id] = [];
            }

            // Keep last 30 data points for the sparklines
            const newHistory = [...nextHistory[device.id], device];
            if (newHistory.length > 30) {
                newHistory.shift();
            }
            nextHistory[device.id] = newHistory;
        });

        return { devices: nextDevices, history: nextHistory };
    }),
}));
