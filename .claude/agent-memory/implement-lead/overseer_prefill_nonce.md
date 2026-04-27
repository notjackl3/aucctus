---
name: Overseer prefill nonce
description: How `openWithPrefill` signals a fresh prefill event to `OverseerInput` so the textarea caret lands at the end of the prefilled message instead of position 0.
type: project
last_modified: 2026-04-26
---

# Overseer prefill nonce

The Overseer chat textarea is controlled by `state.overseer.currentMessage`. When `openWithPrefill` seeds that field, the textarea would otherwise focus on mount with the caret at position 0 — forcing the user to click to the end before typing.

To fix this without re-running on every keystroke, the store carries a dedicated `prefillNonce: number` field that is incremented exactly once per `openWithPrefill` invocation (`state.prefillNonce = state.prefillNonce + 1`).

`OverseerInput` accepts `prefillNonce?: number` as a prop. Its `useEffect([prefillNonce])` calls `textarea.focus()` + `textarea.setSelectionRange(end, end)` + `textarea.scrollTop = textarea.scrollHeight` whenever the nonce changes (and the textarea has content).

Why a nonce instead of watching `currentMessage`: keying the effect on the message string would re-position the caret on every keystroke, making typing impossible. The nonce only flips on a true prefill event.

Why a counter instead of a UUID: cheaper, deterministic, fine for ordering since we only care about "did it change."

Files:
- `aucctus/src/app/stores/overseer/types.ts` — `prefillNonce: number` on `IOverseerState`
- `aucctus/src/app/stores/overseer/store.tsx` — initialized to `0` in both `initialOverseerState` and the slice
- `aucctus/src/app/stores/overseer/actions.tsx` — `openWithPrefill` bumps the nonce inside its `produce` block
- `aucctus/src/app/components/Overseer/OverseerPopup.tsx` — selects the nonce and passes it to `OverseerInput`
- `aucctus/src/app/components/Overseer/OverseerInput.tsx` — caret-positioning effect keyed on `prefillNonce`

**Why:** Default browser behavior on `.focus()` of a textarea with existing content places the caret at index 0; users had to click to the end of the prefilled "Refine the {widget}: " message before typing.

**How to apply:** When adding new "Refine"/"Re-assess"/etc. sparkle buttons that call `openWithPrefill`, no extra wiring is needed — the nonce bump is automatic. If a new component needs the same end-caret behavior on a prefill, accept `prefillNonce` and replicate the effect.
