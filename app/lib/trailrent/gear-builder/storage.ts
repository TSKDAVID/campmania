import type {
  GearBuilderLibrary,
  GearBuilderSlot,
  GearBuilderState,
  SavedGearBuild,
} from './types';
import {GEAR_BUILDER_MAX_SAVED_BUILDS} from './types';

export const GEAR_BUILDER_SESSION_KEY = 'gearBuilderState';
export const GEAR_BUILDER_LIBRARY_KEY = 'gearBuilderLibrary';
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
    buildId: typeof candidate.buildId === 'string' ? candidate.buildId : undefined,
    name: typeof candidate.name === 'string' ? candidate.name.trim() : undefined,
    trek: typeof candidate.trek === 'string' ? candidate.trek : undefined,
  };
}

export function serializeGearBuilderState(state: GearBuilderState): string {
  return JSON.stringify(state);
}

function compactSlots(slots: GearBuilderSlot[]): GearBuilderSlot[] {
  return slots.map(({imageUrl: _imageUrl, ...slot}) => slot);
}

/** Strip bulky fields so the cookie session stays under browser size limits. */
export function compactGearBuilderStateForSession(
  state: GearBuilderState,
): GearBuilderState {
  return {
    ...state,
    slots: compactSlots(state.slots),
  };
}

function compactSavedBuild(build: SavedGearBuild): SavedGearBuild {
  return {
    ...build,
    slots: compactSlots(build.slots),
  };
}

export function parseGearBuilderLibrary(raw: unknown): GearBuilderLibrary | null {
  if (!raw || typeof raw !== 'object') return null;

  const candidate = raw as GearBuilderLibrary & GearBuilderState;
  if (candidate.version === 2 && Array.isArray(candidate.builds)) {
    return {
      version: 2,
      builds: candidate.builds
        .filter(
          (build) =>
            build &&
            typeof build.id === 'string' &&
            typeof build.name === 'string' &&
            Array.isArray(build.slots),
        )
        .map((build) =>
          compactSavedBuild({
            id: build.id,
            name: build.name.trim(),
            trek: typeof build.trek === 'string' ? build.trek : undefined,
            slots: build.slots.filter(
              (slot) => slot && typeof slot.itemType === 'string',
            ),
            updatedAt: build.updatedAt ?? new Date().toISOString(),
          }),
        )
        .slice(0, GEAR_BUILDER_MAX_SAVED_BUILDS),
    };
  }

  const legacy = parseGearBuilderState(candidate);
  if (legacy?.slots.length) {
    return {
      version: 2,
      builds: [
        {
          id: 'legacy',
          name: '',
          slots: compactSlots(legacy.slots),
          updatedAt: legacy.updatedAt,
        },
      ],
    };
  }

  return null;
}

export function emptyGearBuilderLibrary(): GearBuilderLibrary {
  return {version: 2, builds: []};
}

export function gearBuilderSessionKey(customerId?: string | null) {
  return customerId
    ? `${GEAR_BUILDER_LIBRARY_KEY}:${customerId}`
    : GEAR_BUILDER_LIBRARY_KEY;
}

/** @deprecated Use readGearBuilderLibrary */
export function readGearBuilderFromSession(
  session: {get: (key: string) => unknown},
  customerId?: string | null,
): GearBuilderState | null {
  const library = readGearBuilderLibrary(session, customerId);
  const first = library?.builds[0];
  if (!first?.slots.length) return null;
  return {
    version: 1,
    slots: first.slots,
    updatedAt: first.updatedAt,
    buildId: first.id,
    name: first.name,
    trek: first.trek,
  };
}

export function readGearBuilderLibrary(
  session: {get: (key: string) => unknown},
  customerId?: string | null,
): GearBuilderLibrary {
  const customerKey = customerId ? gearBuilderSessionKey(customerId) : null;
  const customerLibrary = customerKey
    ? parseGearBuilderLibrary(session.get(customerKey))
    : null;
  if (customerLibrary?.builds.length) return customerLibrary;

  const genericLibrary = parseGearBuilderLibrary(
    session.get(GEAR_BUILDER_LIBRARY_KEY),
  );
  if (genericLibrary?.builds.length) return genericLibrary;

  const legacyCustomer = customerId
    ? parseGearBuilderLibrary(session.get(`${GEAR_BUILDER_SESSION_KEY}:${customerId}`))
    : null;
  if (legacyCustomer?.builds.length) return legacyCustomer;

  const legacyGeneric = parseGearBuilderLibrary(
    session.get(GEAR_BUILDER_SESSION_KEY),
  );
  return legacyGeneric ?? emptyGearBuilderLibrary();
}

export function writeGearBuilderLibrary(
  session: {
    set: (key: string, value: unknown) => void;
    unset: (key: string) => void;
    get?: (key: string) => unknown;
  },
  library: GearBuilderLibrary,
  customerId?: string | null,
) {
  const key = gearBuilderSessionKey(customerId);
  const compact: GearBuilderLibrary = {
    version: 2,
    builds: library.builds
      .slice(0, GEAR_BUILDER_MAX_SAVED_BUILDS)
      .map(compactSavedBuild),
  };

  if (!compact.builds.length) {
    session.unset(key);
    session.unset(GEAR_BUILDER_LIBRARY_KEY);
    session.unset(GEAR_BUILDER_SESSION_KEY);
    if (customerId) {
      session.unset(`${GEAR_BUILDER_SESSION_KEY}:${customerId}`);
    }
    return;
  }

  session.set(key, compact);
}

/** @deprecated Use writeGearBuilderLibrary */
export function writeGearBuilderToSession(
  session: {
    set: (key: string, value: unknown) => void;
    unset: (key: string) => void;
  },
  state: GearBuilderState | null,
  customerId?: string | null,
) {
  if (!state?.slots.length) {
    writeGearBuilderLibrary(session, emptyGearBuilderLibrary(), customerId);
    return;
  }

  const library = readGearBuilderLibrary(session, customerId);
  const build: SavedGearBuild = {
    id: state.buildId ?? `build-${Date.now()}`,
    name: state.name?.trim() || 'My build',
    trek: state.trek,
    slots: state.slots,
    updatedAt: state.updatedAt,
  };

  const builds = library.builds.filter((entry) => entry.id !== build.id);
  builds.unshift(compactSavedBuild(build));
  writeGearBuilderLibrary(session, {version: 2, builds}, customerId);
}

export function upsertSavedBuild(
  library: GearBuilderLibrary,
  build: SavedGearBuild,
): {library: GearBuilderLibrary; error?: 'max_builds'} {
  const existing = library.builds.find((entry) => entry.id === build.id);
  const builds = library.builds.filter((entry) => entry.id !== build.id);

  if (!existing && builds.length >= GEAR_BUILDER_MAX_SAVED_BUILDS) {
    return {library, error: 'max_builds'};
  }

  builds.unshift(compactSavedBuild(build));
  return {
    library: {
      version: 2,
      builds: builds.slice(0, GEAR_BUILDER_MAX_SAVED_BUILDS),
    },
  };
}

export function deleteSavedBuild(
  library: GearBuilderLibrary,
  buildId: string,
): GearBuilderLibrary {
  return {
    version: 2,
    builds: library.builds.filter((build) => build.id !== buildId),
  };
}

export function findSavedBuild(
  library: GearBuilderLibrary,
  buildId: string,
): SavedGearBuild | null {
  return library.builds.find((build) => build.id === buildId) ?? null;
}

export function createBuildId() {
  return `build-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Merge anonymous session builds into a logged-in customer's library once. */
export function mergeGuestGearBuilderLibrary(
  session: {
    get: (key: string) => unknown;
    unset: (key: string) => void;
  },
  library: GearBuilderLibrary,
  customerId: string,
): GearBuilderLibrary {
  if (customerId) {
    const guestLibrary = parseGearBuilderLibrary(
      session.get(GEAR_BUILDER_LIBRARY_KEY),
    );
    if (!guestLibrary?.builds.length) return library;

    let merged = library;
    for (const build of guestLibrary.builds) {
      if (merged.builds.some((entry) => entry.id === build.id)) continue;
      const result = upsertSavedBuild(merged, build);
      if (!result.error) merged = result.library;
    }

    session.unset(GEAR_BUILDER_LIBRARY_KEY);
    session.unset(GEAR_BUILDER_SESSION_KEY);
    return merged;
  }

  return library;
}
