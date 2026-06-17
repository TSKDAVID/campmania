import type {GearBuilderState} from './types';

export const GEAR_BUILDER_SESSION_KEY = 'gearBuilderState';
export const GEAR_BUILDER_LOCAL_KEY = 'campmania-gear-builder-v1';

export function emptyGearBuilderState(): GearBuilderState {
  return {
    version: 1,
    slots: [],
    updatedAt: new Date().toISOString(),
  };
}

export function parseGearBuilderState(raw: unknown): GearBuilderState | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as GearBuilderState;
  if (candidate.version !== 1 || !Array.isArray(candidate.slots)) return null;
  return {
    version: 1,
    slots: candidate.slots.filter(
      (slot) => slot && typeof slot.itemType === 'string',
    ),
    updatedAt: candidate.updatedAt ?? new Date().toISOString(),
  };
}

export function serializeGearBuilderState(state: GearBuilderState): string {
  return JSON.stringify(state);
}

/** Strip bulky fields so the cookie session stays under browser size limits. */
export function compactGearBuilderStateForSession(
  state: GearBuilderState,
): GearBuilderState {
  return {
    version: 1,
    updatedAt: state.updatedAt,
    slots: state.slots.map(({imageUrl: _imageUrl, ...slot}) => slot),
  };
}

export function gearBuilderSessionKey(customerId?: string | null) {
  return customerId
    ? `${GEAR_BUILDER_SESSION_KEY}:${customerId}`
    : GEAR_BUILDER_SESSION_KEY;
}

export function readGearBuilderFromSession(
  session: {get: (key: string) => unknown},
  customerId?: string | null,
): GearBuilderState | null {
  const customerState = customerId
    ? parseGearBuilderState(session.get(gearBuilderSessionKey(customerId)))
    : null;
  if (customerState?.slots.length) return customerState;
  return parseGearBuilderState(session.get(GEAR_BUILDER_SESSION_KEY));
}

export function writeGearBuilderToSession(
  session: {
    set: (key: string, value: unknown) => void;
    unset: (key: string) => void;
  },
  state: GearBuilderState | null,
  customerId?: string | null,
) {
  const key = gearBuilderSessionKey(customerId);
  if (!state || state.slots.length === 0) {
    session.unset(key);
    if (customerId) session.unset(GEAR_BUILDER_SESSION_KEY);
    return;
  }
  session.set(key, compactGearBuilderStateForSession(state));
}
