import { useCallback, useEffect, useState } from 'react';
import { api } from '../../utils/api';

type OwnerAdminStatus = {
  localUrl: string;
  remoteUrl: string | null;
  workspacesRoot: string | null;
  tailscale: {
    installed: boolean;
    running: boolean;
    backendState: string;
    dnsName: string | null;
    authUrl: string | null;
  };
};

type PendingDevice = {
  request_token: string;
  device_id: string;
  device_name: string | null;
  platform: string | null;
  requested_ip: string | null;
};

type TrustedDevice = {
  device_id: string;
  device_name: string | null;
  platform: string | null;
};

async function parseJsonOrThrow(response: Response) {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || 'Request failed');
  }

  return payload;
}

export function useOwnerAdminState(isOpen: boolean) {
  const [status, setStatus] = useState<OwnerAdminStatus | null>(null);
  const [pendingDevices, setPendingDevices] = useState<PendingDevice[]>([]);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statusResponse, pendingResponse, trustedResponse] = await Promise.all([
        api.ownerAdmin.status(),
        api.ownerAdmin.pendingDevices(),
        api.ownerAdmin.trustedDevices(),
      ]);

      const [statusPayload, pendingPayload, trustedPayload] = await Promise.all([
        parseJsonOrThrow(statusResponse),
        parseJsonOrThrow(pendingResponse),
        parseJsonOrThrow(trustedResponse),
      ]);

      setStatus(statusPayload as OwnerAdminStatus);
      setPendingDevices((pendingPayload?.requests || []) as PendingDevice[]);
      setTrustedDevices((trustedPayload?.devices || []) as TrustedDevice[]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to load owner admin data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, 3000);

    return () => window.clearInterval(timer);
  }, [isOpen, refresh]);

  const approveDevice = useCallback(async (requestToken: string) => {
    await parseJsonOrThrow(await api.ownerAdmin.approveDevice(requestToken));
    await refresh();
  }, [refresh]);

  const rejectDevice = useCallback(async (requestToken: string) => {
    await parseJsonOrThrow(await api.ownerAdmin.rejectDevice(requestToken));
    await refresh();
  }, [refresh]);

  const revokeDevice = useCallback(async (deviceId: string) => {
    await parseJsonOrThrow(await api.ownerAdmin.revokeDevice(deviceId));
    await refresh();
  }, [refresh]);

  return {
    status,
    pendingDevices,
    trustedDevices,
    isLoading,
    error,
    refresh,
    approveDevice,
    rejectDevice,
    revokeDevice,
  };
}
