"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Monitor, Users, Zap, Shield, ArrowRight, Sparkles } from "lucide-react";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const createParty = () => {
    setIsCreating(true);
    const code = generateCode();
    // Store host flag in session
    sessionStorage.setItem(`party-${code}-role`, "host");
    router.push(`/party/${code}`);
  };

  const joinParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setIsJoining(true);
    const code = joinCode.trim().toUpperCase();
    sessionStorage.setItem(`party-${code}-role`, "guest");
    router.push(`/party/${code}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-[#0a0a0f] to-[#0a0a0f]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sky-300 text-sm mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pure web prototype — pushing browser limits</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent">
              Web Party
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Create a party. Share your screen. Request control.
            <br className="hidden md:block" />
            Built to test what pure web can actually do in 2026.
          </p>
        </div>

        {/* Main actions */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-20">
          {/* Create */}
          <div className="glass-strong rounded-2xl p-8 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center mb-5">
              <Monitor className="w-6 h-6 text-sky-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Create a Party</h2>
            <p className="text-slate-400 text-sm mb-6 flex-1">
              You become the host. Get a short code and share it with friends.
            </p>
            <button
              onClick={createParty}
              disabled={isCreating}
              className="w-full py-3.5 px-6 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isCreating ? (
                <span className="animate-pulse">Creating...</span>
              ) : (
                <>
                  Create Party
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Join */}
          <div className="glass-strong rounded-2xl p-8 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-5">
              <Users className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Join a Party</h2>
            <p className="text-slate-400 text-sm mb-6">
              Enter the 6-character code from the host.
            </p>
            <form onSubmit={joinParty} className="space-y-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={6}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-sky-500 focus:outline-none text-center text-lg tracking-[0.3em] font-mono uppercase"
              />
              <button
                type="submit"
                disabled={isJoining || joinCode.length < 4}
                className="w-full py-3.5 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium transition-all disabled:opacity-50"
              >
                {isJoining ? "Joining..." : "Join Party"}
              </button>
            </form>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center p-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-medium mb-2">Real-time WebRTC</h3>
            <p className="text-sm text-slate-500">
              Peer-to-peer screen stream + data channel for control signals.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-medium mb-2">Accept / Decline</h3>
            <p className="text-sm text-slate-500">
              Host always stays in control. Guests must request permission.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-10 h-10 rounded-lg bg-rose-500/15 flex items-center justify-center mx-auto mb-4">
              <Monitor className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="font-medium mb-2">Pushing Limits</h3>
            <p className="text-sm text-slate-500">
              Built to discover exactly where browsers stop us — then go further.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-16">
          iOS screen sharing is blocked by Apple. Full OS control requires native code.
          This prototype goes as far as pure web allows.
        </p>
      </div>
    </div>
  );
}
