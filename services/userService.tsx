import { useRouter } from 'expo-router';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import api from '../api/apiClient';
import authStorage from '../api/authStorage';

const UserContext = createContext(null);
export type BankAccount = {
  bankCode: string;
  accountNumber: string;
};
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [loadingBank, setLoadingBank] = useState(true);
  const justLogout = useCallback(async () => {
    await authStorage.clear();
    router.dismissAll();
    router.replace('/auth/login');
  }, [router]);

  const refreshBank = useCallback(async () => {
    setLoadingBank(true);
    try {
      // Server should infer customerId from JWT
      // If not found, return 204 or { bankCode: null, accountNumber: null }
      const res = await api.get('/customer/get-bank-account');
      console.log(res.data);
      setBankAccount(res.data?.bankCode ? res.data as BankAccount : null);
    } catch (e) {
      // If 404/204, just treat as no bank account
      setBankAccount(null);
    } finally {
      setLoadingBank(false);
    }
  }, []);

  const loadUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = await authStorage.getAccessToken();
      if (!token) {
        setUser(null);
        setBankAccount(null);
        await justLogout();
        return Promise.reject(new Error("Token Expired"));
      }
      const res = await api.get('/user/profile');
      refreshBank();
      setUser(res.data);
    } catch (error) {
      console.error('Error loading user:', error);
      await justLogout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [justLogout, refreshBank]);

  const loginUser = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      const { accessToken, refreshToken } = response.data;

      // WILL BE REMOVED SOON
      // const token = accessToken;
      // const decoded = jwtDecode<{ exp: number; [key: string]: any }>(token);
      // const expiresAt = new Date(decoded.exp * 1000);

      await authStorage.setAccessToken(accessToken);
      await authStorage.setRefreshToken(refreshToken);
      loadUserProfile();
      return true;
    } catch (error) {
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const source = "mobile";
      const response = await api.post('/auth/forgot-password', { email, source: source });
      return response.status === 200;
    } catch (error) {
      throw error;
    }
  };

  const validateResetToken = async (token: string) => {
    try {
      const response = await api.get('/auth/validate-reset-token', {
        params: { token },
      });
      return response.status === 200;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword: password,
      });
      return response.status === 200;
    } catch (error) {
      throw error;
    }
  };

  const updateBankAccount = async (bank: BankAccount) => {
    // persist to backend, then update local state
    console.log("Updating bank account:", bank);
    await api.post("/customer/create-or-update-bank-account", bank); // ← create this endpoint
    console.log("Bank account updated on server.", bank);
    setBankAccount(bank);
  };
  const hasBankAccount = useMemo(
    () => !!bankAccount?.bankCode && !!bankAccount?.accountNumber,
    [bankAccount]
  );
  
  // --- COMMENT THIS OUT FOR LOCAL TESTING ---
  // useEffect(() => {
  //   loadUserProfile();
  // }, [loadUserProfile]);
  // ------------------------------------------

  return (
    <UserContext.Provider value={{ user, loading, loadUserProfile, loginUser, justLogout, updateBankAccount, hasBankAccount, bankAccount, refreshBank, loadingBank, requestPasswordReset, validateResetToken, resetPassword }}>
      {children}
    </UserContext.Provider>
  );
};