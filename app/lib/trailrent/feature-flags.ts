/** Gear Builder is enabled by default; set PUBLIC_GEAR_BUILDER_ENABLED=false to hide entry points. */
export function isGearBuilderEnabled(env?: unknown) {
  const raw =
    env && typeof env === 'object' && 'PUBLIC_GEAR_BUILDER_ENABLED' in env
      ? String(
          (env as {PUBLIC_GEAR_BUILDER_ENABLED?: string})
            .PUBLIC_GEAR_BUILDER_ENABLED ?? '',
        )
      : '';
  if (!raw) return true;
  return raw !== 'false' && raw !== '0';
}
