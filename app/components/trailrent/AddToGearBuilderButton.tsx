import {Link} from 'react-router';
import {useGearBuilder} from '~/providers/GearBuilderProvider';
import {useLocale} from '~/providers/LocaleProvider';
import type {GearBuilderProduct} from '~/lib/trailrent/gear-builder';
import {IconPackage} from '~/components/trailrent/Icons';

export function AddToGearBuilderButton({
  product,
  variantId,
  className = 'tr-btn-secondary w-full',
}: {
  product: GearBuilderProduct;
  variantId?: string;
  className?: string;
}) {
  const {translations: tr} = useLocale();
  const {addProduct} = useGearBuilder();

  if (!product.metafields.builderEnabled && product.metafields.itemType === 'other') {
    return null;
  }

  return (
    <div className="cm-gear-builder-pdp-actions">
      <button
        type="button"
        className={className}
        onClick={() => addProduct(product, variantId)}
      >
        <IconPackage size={18} />
        {tr.gearBuilder.addToBuilder}
      </button>
      <Link to="/gear-builder" className="cm-gear-builder-pdp-link">
        {tr.gearBuilder.openBuilder}
      </Link>
    </div>
  );
}
