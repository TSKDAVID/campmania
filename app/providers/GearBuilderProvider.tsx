import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  GearBuilderProduct,
  GearBuilderSlot,
  GearBuilderState,
  GearItemType,
} from '~/lib/trailrent/gear-builder';
import {
  emptyGearBuilderState,
  GEAR_BUILDER_LOCAL_KEY,
  parseGearBuilderState,
} from '~/lib/trailrent/gear-builder/storage';

type GearBuilderContextValue = {
  state: GearBuilderState;
  addProduct: (product: GearBuilderProduct, variantId?: string) => void;
  addItemType: (itemType: GearItemType) => void;
  setSlotProduct: (
    itemType: GearItemType,
    product: GearBuilderProduct,
    variantId?: string,
  ) => void;
  removeSlot: (itemType: GearItemType) => void;
  clearSlotProduct: (itemType: GearItemType) => void;
  clearAll: () => void;
  replaceState: (state: GearBuilderState) => void;
};

const GearBuilderContext = createContext<GearBuilderContextValue | null>(null);

function productToSlot(
  product: GearBuilderProduct,
  variantId?: string,
): GearBuilderSlot {
  const variant =
    product.variants.find((entry) => entry.id === variantId) ??
    product.variants.find((entry) => entry.availableForSale) ??
    product.variants[0];

  return {
    itemType: product.metafields.itemType,
    productId: product.id,
    variantId: variant?.id ?? product.variantId,
    handle: product.handle,
    title: product.title,
    imageUrl: product.imageUrl,
    dailyRate: variant?.price ?? product.dailyRate,
  };
}

export function GearBuilderProvider({children}: {children: ReactNode}) {
  const [state, setState] = useState<GearBuilderState>(emptyGearBuilderState);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(GEAR_BUILDER_LOCAL_KEY);
    if (!raw) return;
    try {
      const parsed = parseGearBuilderState(JSON.parse(raw));
      if (parsed) setState(parsed);
    } catch {
      // ignore invalid local state
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(GEAR_BUILDER_LOCAL_KEY, JSON.stringify(state));
  }, [state]);

  const upsertSlot = useCallback((slot: GearBuilderSlot) => {
    setState((current) => {
      const nextSlots = current.slots.filter(
        (entry) => entry.itemType !== slot.itemType,
      );
      nextSlots.push(slot);
      return {
        version: 1,
        slots: nextSlots,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const addProduct = useCallback(
    (product: GearBuilderProduct, variantId?: string) => {
      upsertSlot(productToSlot(product, variantId));
    },
    [upsertSlot],
  );

  const addItemType = useCallback((itemType: GearItemType) => {
    setState((current) => {
      if (current.slots.some((slot) => slot.itemType === itemType)) {
        return current;
      }
      return {
        version: 1,
        slots: [...current.slots, {itemType}],
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const setSlotProduct = useCallback(
    (itemType: GearItemType, product: GearBuilderProduct, variantId?: string) => {
      upsertSlot({...productToSlot(product, variantId), itemType});
    },
    [upsertSlot],
  );

  const removeSlot = useCallback((itemType: GearItemType) => {
    setState((current) => ({
      version: 1,
      slots: current.slots.filter((slot) => slot.itemType !== itemType),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const clearSlotProduct = useCallback((itemType: GearItemType) => {
    setState((current) => ({
      version: 1,
      slots: current.slots.map((slot) =>
        slot.itemType === itemType ? {itemType: slot.itemType} : slot,
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const clearAll = useCallback(() => {
    setState(emptyGearBuilderState());
  }, []);

  const replaceState = useCallback((next: GearBuilderState) => {
    setState(next);
  }, []);

  const value = useMemo(
    () => ({
      state,
      addProduct,
      addItemType,
      setSlotProduct,
      removeSlot,
      clearSlotProduct,
      clearAll,
      replaceState,
    }),
    [
      state,
      addProduct,
      addItemType,
      setSlotProduct,
      removeSlot,
      clearSlotProduct,
      clearAll,
      replaceState,
    ],
  );

  return (
    <GearBuilderContext.Provider value={value}>
      {children}
    </GearBuilderContext.Provider>
  );
}

export function useGearBuilder() {
  const context = useContext(GearBuilderContext);
  if (!context) {
    throw new Error('useGearBuilder must be used within GearBuilderProvider');
  }
  return context;
}
