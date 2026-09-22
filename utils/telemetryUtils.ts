export const getTankCapacity = (machineId: string) => 100;

export const getCorrectedVolume = (machineId: string, rawVolume: number = 0) => {
  const trueCapacity = getTankCapacity(machineId);
  const correctedVolume = (rawVolume / 500) * trueCapacity;
  return Math.max(0, correctedVolume);
};

export const getTankPercentage = (volume: number = 0, capacity: number = 100) => {
  if (!capacity || capacity <= 0) return 0;
  return Math.min(100, Math.max(0, (volume / capacity) * 100));
};

export const getTankColor = (percentage: number) => {
  if (percentage >= 90) return '#ef4444'; // Red
  if (percentage >= 75) return '#facc15'; // Yellow
  return '#22c55e'; // Green
};