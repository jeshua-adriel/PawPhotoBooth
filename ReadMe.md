# PawShoot (React)

A cute photobooth, now built for **two people in different places** to pose
together, ported from the original single-file `pawshoot.html` into this
Vite + React project.

## Features

- 💕 **Two-camera couple booth** — a private room, one shareable invite link,
  live video straight between two browsers.
- 🎨 Six picture filters (warm, cool, black & white, sepia, vivid, none) and
  four corner-sticker frames (paws, hearts, whiskers, none).
- 🖼️ Side-by-side or stacked camera layout, single photo or 3-shot strip.
- 🔄 **Live sync** — whichever side changes a filter or layout setting, it
  updates on the other side automatically.
- 📸 **Shared gallery** — every capture saves to both people's galleries,
  not just whoever pressed the button.
- 🚪 **Leave session** — ends the call and resets your invite link; if the
  host leaves, the session ends for both, if the guest leaves, the host's
  room just stays open for someone new.
- ⬇️🖨️📤 Download, print, or share any saved photo (native share sheet,
  Facebook, Messenger, Instagram, X, Snapchat, WhatsApp, or copy to
  clipboard).

## Tech stack

- **[React](https://react.dev)** (function components + hooks) for the UI,
  bundled and served in dev by **[Vite](https://vitejs.dev)** — Node.js is
  only needed to run that tooling (`npm install`, `npm run dev`), not as an
  app server.
- **[PeerJS](https://peerjs.com)** for WebRTC: its free public broker is
  used purely to introduce the two browsers to each other (signalling).
  Once connected, video and data flow directly peer-to-peer.
- **No backend.** There's no Django/Node/Express server, no database, and
  no API. Camera capture and photo compositing happen entirely in the
  browser via `getUserMedia` and `<canvas>`; settings and the gallery are
  saved to each device's own `localStorage`.

## What's new: the couple booth

The Booth page always shows **exactly two camera boxes** — yours and your
partner's:

1. Open the Booth tab. PawShoot creates a private room and shows a
   **Copy invite link** button.
2. Send that link to your partner. When they open it, their browser
   auto-joins your room.
3. Video connects **directly between the two browsers** (WebRTC) — nothing
   is ever uploaded to a server, even mid-call.
4. Strike a pose together and capture a combined photo (or a 3-shot strip),
   just like the original booth.

This uses [PeerJS](https://peerjs.com) and its free public broker only to
introduce the two browsers to each other (signalling). No custom backend is
required. Run `npm install` to pull in the `peerjs` dependency.

Once connected, filter/layout/card-style changes made in **Settings** by
either the host or the guest are sent to the other side over a WebRTC data
channel and applied automatically — both cameras always end up showing the
same settings. Captured photos are shared the same way: whoever presses
"Strike a pose!" sends the exact finished image to their partner too, so
both galleries end up with an identical copy of every shot. This, the
camera, and the room connection itself all live in `App.jsx` rather than
the Booth page, so navigating to Settings or Gallery and back never drops
the session.

**Leave session** is asymmetric by design:
- Whoever clicks it always ends the call on their side and resets their
  own address bar back to the default link (no `?room=`).
- If the **host** clicks it, the guest is told over the data channel and
  is also fully disconnected — the whole session ends for both.
- If the **guest** clicks it, only the guest leaves — the host's room
  stays open, waiting for a new guest, until the host chooses to leave.

## Project layout