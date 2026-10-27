# Web Party

**Maximum-effort pure web prototype** for real-time screen sharing parties with remote control requests.

## What it does
- Create a party → get a short join code
- Friends join with the code
- One person shares their screen (desktop)
- Others can request control
- Sharer accepts or declines
- When accepted, pointer / basic input is relayed over WebRTC data channel

## Known hard limits (we still built it)
- iOS / iPadOS cannot share screen (`getDisplayMedia` is blocked by Apple)
- Pure browser cannot control the host OS outside the shared surface (no opening apps, no system volume, no home screen control)
- This is the furthest a pure web app can go in 2026

## Stack
- Next.js 15 (App Router)
- Tailwind + modern dark UI
- Supabase (rooms + Realtime presence)
- WebRTC + simple signaling

## Status
Prototype under active construction. Pushing every browser capability we can.
