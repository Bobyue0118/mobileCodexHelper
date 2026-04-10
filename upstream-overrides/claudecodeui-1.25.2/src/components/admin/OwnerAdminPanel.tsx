import { X } from 'lucide-react';
import { useOwnerAdminState } from './useOwnerAdminState';

type OwnerAdminPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function OwnerAdminPanel({ isOpen, onClose }: OwnerAdminPanelProps) {
  const {
    status,
    pendingDevices,
    trustedDevices,
    isLoading,
    error,
    approveDevice,
    rejectDevice,
    revokeDevice,
  } = useOwnerAdminState(isOpen);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Owner Admin</h2>
            <p className="text-sm text-muted-foreground">
              Approve iPhones, inspect Tailscale access, and manage trusted devices.
            </p>
          </div>
          <button className="rounded-full p-2 hover:bg-accent" onClick={onClose} aria-label="Close owner admin">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-4">
            <div className="rounded-xl border border-border bg-background/60 p-4">
              <div className="text-sm font-medium text-foreground">Access</div>
              <div className="mt-2 text-sm text-muted-foreground">Local: {status?.localUrl || 'Loading status'}</div>
              <div className="text-sm text-muted-foreground">Remote: {status?.remoteUrl || 'Not available yet'}</div>
              <div className="text-sm text-muted-foreground">
                Workspace root: {status?.workspacesRoot || 'Loading workspace root'}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background/60 p-4">
              <div className="text-sm font-medium text-foreground">Pending devices</div>
              <div className="mt-3 space-y-3">
                {pendingDevices.map((device) => (
                  <div key={device.request_token} className="rounded-lg border border-border p-3">
                    <div className="font-medium text-foreground">{device.device_name || device.device_id}</div>
                    <div className="text-xs text-muted-foreground">
                      {device.platform || 'Unknown platform'} · {device.requested_ip || 'Unknown IP'}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white"
                        onClick={() => void approveDevice(device.request_token)}
                      >
                        Approve
                      </button>
                      <button
                        className="rounded-lg bg-zinc-700 px-3 py-1.5 text-sm text-white"
                        onClick={() => void rejectDevice(device.request_token)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
                {!pendingDevices.length && <div className="text-sm text-muted-foreground">No pending devices.</div>}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-xl border border-border bg-background/60 p-4">
              <div className="text-sm font-medium text-foreground">Tailscale</div>
              <div className="mt-2 text-sm text-muted-foreground">
                State: {status?.tailscale?.backendState || 'Loading state'}
              </div>
              <div className="text-sm text-muted-foreground">
                DNS: {status?.tailscale?.dnsName || 'Unavailable'}
              </div>
              {status?.tailscale?.authUrl && (
                <a
                  className="mt-3 inline-flex rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white"
                  href={status.tailscale.authUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Finish Tailscale Login
                </a>
              )}
            </div>

            <div className="rounded-xl border border-border bg-background/60 p-4">
              <div className="text-sm font-medium text-foreground">Trusted devices</div>
              <div className="mt-3 space-y-3">
                {trustedDevices.map((device) => (
                  <div key={device.device_id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <div className="font-medium text-foreground">{device.device_name || device.device_id}</div>
                      <div className="text-xs text-muted-foreground">{device.platform || 'Unknown platform'}</div>
                    </div>
                    <button
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white"
                      onClick={() => void revokeDevice(device.device_id)}
                    >
                      Revoke
                    </button>
                  </div>
                ))}
                {!trustedDevices.length && <div className="text-sm text-muted-foreground">No trusted devices yet.</div>}
              </div>
            </div>

            {(isLoading || error) && (
              <div className="rounded-xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
                {error || 'Refreshing owner admin data'}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
