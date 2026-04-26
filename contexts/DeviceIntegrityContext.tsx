import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type DeviceIntegrityState = {
  compromised: boolean;
  checked: boolean;
  available: boolean;
};

const DeviceIntegrityContext = createContext<DeviceIntegrityState | undefined>(
  undefined
);

function loadJailMonkey(): any {
  try {
    const mod = require('jail-monkey');
    return mod?.default ?? mod;
  } catch {
    return null;
  }
}

export function DeviceIntegrityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DeviceIntegrityState>({
    compromised: false,
    checked: false,
    available: false,
  });

  useEffect(() => {
    let cancelled = false;
    const JailMonkey = loadJailMonkey();

    let compromised = false;
    let available = false;

    if (JailMonkey) {
      available = true;
      try {
        if (typeof JailMonkey.isJailBroken === 'function') {
          compromised = compromised || JailMonkey.isJailBroken();
        }
        if (
          !compromised &&
          typeof JailMonkey.trustFall === 'function'
        ) {
          compromised = compromised || JailMonkey.trustFall();
        }
        if (
          !compromised &&
          typeof JailMonkey.isOnExternalStorage === 'function'
        ) {
          compromised = compromised || JailMonkey.isOnExternalStorage();
        }
      } catch {
        compromised = false;
      }
    }

    if (!cancelled) {
      setState({ compromised, checked: true, available });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DeviceIntegrityContext.Provider value={state}>
      {children}
    </DeviceIntegrityContext.Provider>
  );
}

export function useDeviceIntegrity() {
  const context = useContext(DeviceIntegrityContext);
  if (context === undefined) {
    throw new Error(
      'useDeviceIntegrity jāizmanto DeviceIntegrityProvider iekšienē'
    );
  }
  return context;
}
