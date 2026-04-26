import { useAuth } from '@/contexts/AuthContext';
import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback } from 'react';

type GateResult = {
  success: boolean;
  reason?: string;
};

export function useBiometricGate() {
  const { biometricEnabled } = useAuth();

  const requestApproval = useCallback(
    async (promptMessage: string): Promise<GateResult> => {
      if (!biometricEnabled) {
        return { success: true };
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !enrolled) {
        return {
          success: false,
          reason:
            'Šajā ierīcē nav pieejama biometriskā autentifikācija. Pārbaudiet ierīces iestatījumus.',
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Atcelt',
        disableDeviceFallback: false,
        biometricsSecurityLevel: 'strong',
      });

      if (result.success) {
        return { success: true };
      }
      return {
        success: false,
        reason: 'Biometriskā autentifikācija nebija veiksmīga.',
      };
    },
    [biometricEnabled]
  );

  return { requestApproval };
}
