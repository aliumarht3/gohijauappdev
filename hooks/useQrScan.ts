import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  generateQrTokenCollector,
  generateQrTokenCustomer,
  generateQrTokenTechnician,
} from '../services/qrService';
import { useUser } from '../services/userService';

export function useQrScan() {
  const router = useRouter();
  const { user } = useUser();
  const [scanFailedVisible, setScanFailedVisible] = useState(false);

  const handleScan = async () => {
    let token: string | null = null;

    switch (user?.userRole) {
      case 'Technician':
        token = await generateQrTokenTechnician();
        break;
      case 'OilCollector':
        token = await generateQrTokenCollector();
        break;
      default:
        token = await generateQrTokenCustomer();
        break;
    }

    if (token) {
      router.push({
        pathname: '/QRCodeScreen',
        params: { token },
      });
    } else {
      setScanFailedVisible(true);
    }
  };

  return {
    handleScan,
    scanFailedVisible,
    setScanFailedVisible,
  };
}
