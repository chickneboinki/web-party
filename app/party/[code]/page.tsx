"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Monitor,
  MonitorOff,
  MousePointer2,
  Users,
  Copy,
  Check,
  ArrowLeft,
  Hand,
  X,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

type Role = "host" | "guest";
type ControlState = "none" | "requesting" | "granted" | "denied";

export default function PartyPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string)?.toUpperCase() || "";

  const [role, setRole] = useState<Role | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [controlState, setControlState] = useState<ControlState>("none");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Connecting...");
  const [guestConnected, setGuestConnected] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  // Determine role on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(`party-${code}-role`) as Role | null;
    if (stored) {
      setRole(stored);
      setStatus(stored === "host" ? "You are the host. Share your screen when ready." : "Joined as guest. Waiting for host to share...");
    } else {
      // Default to guest if no role stored
      setRole("guest");
      sessionStorage.setItem(`party-${code}-role`, "guest");
      setStatus("Joined as guest.");
    }
  }, [code]);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Start screen share (host only)
  const startShare = async () => {
    try {
      setError(null);
      // Check support
      if (!navigator.mediaDevices?.getDisplayMedia) {
        setError("Screen sharing is not supported on this device/browser (common on iOS). Try a desktop Chrome/Edge/Firefox.");
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true,
      });

      streamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
      }

      // When user stops sharing via browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopShare();
      };

      setIsSharing(true);
      setStatus("Screen is being shared. Guests can now request control.");

      // TODO: WebRTC signaling would go here (PeerJS or Supabase Realtime)
      // For this prototype we show the local preview + control UI flow
    } catch (err: any) {
      console.error(err);
      if (err.name === "NotAllowedError") {
        setError("Permission denied. You must allow screen sharing.");
      } else {
        setError(err.message || "Failed to start screen share.");
      }
    }
  };

  const stopShare = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    setIsSharing(false);
    setControlState("none");
    setStatus("Sharing stopped.");
  };

  // Guest requests control
  const requestControl = () => {
    setControlState("requesting");
    setStatus("Control request sent to host...");
    // In a full implementation this would go over data channel / signaling
    // For prototype we simulate the host side later
  };

  // Host accepts
  const acceptControl = () => {
    setControlState("granted");
    setStatus("Control granted to guest.");
  };

  // Host declines
  const declineControl = () => {
    setControlState("denied");
    setStatus("Control request declined.");
    setTimeout(() => setControlState("none"), 3000);
  };

  // Guest releases
  const releaseControl = () => {
    setControlState("none");
    setStatus("Control released.");
  };

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading party...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      {/* Top bar */}
      <header className="glass-strong border-b border-slate-800/60 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg tracking-widest text-sky-300">{code}</span>
              <button onClick={copyCode} className="p-1.5 rounded hover:bg-slate-800">
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              {role === "host" ? "You are hosting" : "You joined as guest"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Users className="w-4 h-4" />
          <span>{role === "host" ? (guestConnected ? "1 guest" : "Waiting for guests") : "Connected"}</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col md:flex-row gap-4 p-4 max-w-7xl mx-auto w-full">
        {/* Video area */}
        <div className="flex-1 glass rounded-2xl overflow-hidden relative min-h-[320px] flex items-center justify-center bg-slate-950/50">
          {role === "host" ? (
            <>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-contain ${isSharing ? "" : "hidden"}`}
              />
              {!isSharing && (
                <div className="text-center p-8">
                  <MonitorOff className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-2">Your screen is not being shared yet</p>
                  <p className="text-sm text-slate-600">Click the button below to start</p>
                </div>
              )}
            </>
          ) : (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center p-8 glass rounded-2xl">
                  <Monitor className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">Waiting for host screen...</p>
                  <p className="text-xs text-slate-600 mt-2">
                    (Full WebRTC signaling will connect the stream here)
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Control overlay indicator */}
          {controlState === "granted" && (
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm">
              <MousePointer2 className="w-4 h-4" />
              Control active
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="w-full md:w-80 flex flex-col gap-4">
          {/* Status */}
          <div className="glass rounded-xl p-4">
            <p className="text-sm text-slate-300">{status}</p>
            {error && (
              <p className="mt-2 text-sm text-rose-400 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </p>
            )}
          </div>

          {/* Host controls */}
          {role === "host" && (
            <div className="glass rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Host Controls</h3>

              {!isSharing ? (
                <button
                  onClick={startShare}
                  className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium flex items-center justify-center gap-2 transition"
                >
                  <Monitor className="w-4 h-4" />
                  Share Screen
                </button>
              ) : (
                <button
                  onClick={stopShare}
                  className="w-full py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-medium flex items-center justify-center gap-2 transition border border-rose-500/30"
                >
                  <MonitorOff className="w-4 h-4" />
                  Stop Sharing
                </button>
              )}

              {/* Incoming control request simulation */}
              {isSharing && controlState === "requesting" && (
                <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <p className="text-sm text-amber-200 mb-3 flex items-center gap-2">
                    <Hand className="w-4 h-4" />
                    Guest is requesting control
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={acceptControl}
                      className="flex-1 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 text-sm font-medium hover:bg-emerald-500/30 flex items-center justify-center gap-1"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={declineControl}
                      className="flex-1 py-2 rounded-lg bg-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-600 flex items-center justify-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                </div>
              )}

              {controlState === "granted" && (
                <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300">
                  Guest currently has control. They can release it or you can stop sharing.
                </div>
              )}
            </div>
          )}

          {/* Guest controls */}
          {role === "guest" && (
            <div className="glass rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Guest Controls</h3>

              {controlState === "none" || controlState === "denied" ? (
                <button
                  onClick={requestControl}
                  className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium flex items-center justify-center gap-2 transition"
                >
                  <Hand className="w-4 h-4" />
                  Request Control
                </button>
              ) : controlState === "requesting" ? (
                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-slate-700 text-slate-400 font-medium flex items-center justify-center gap-2"
                >
                  <span className="animate-pulse">Waiting for host...</span>
                </button>
              ) : (
                <button
                  onClick={releaseControl}
                  className="w-full py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-medium flex items-center justify-center gap-2 border border-rose-500/30"
                >
                  <MousePointer2 className="w-4 h-4" />
                  Release Control
                </button>
              )}

              <p className="text-xs text-slate-500 leading-relaxed">
                When control is granted, your mouse/touch events will be sent to the host over a WebRTC data channel (prototype stage).
              </p>
            </div>
          )}

          {/* Tech note */}
          <div className="glass rounded-xl p-4 text-xs text-slate-500 leading-relaxed">
            <p className="font-medium text-slate-400 mb-1">Prototype status</p>
            Screen capture works on desktop. Full multi-peer signaling + input injection is the next layer. iOS cannot share screen by design.
          </div>
        </div>
      </main>
    </div>
  );
}
