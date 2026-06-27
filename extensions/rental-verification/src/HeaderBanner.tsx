import {
  reactExtension,
  Banner,
  useCartLines,
  useTranslate,
} from '@shopify/ui-extensions-react/checkout';
import {cartHasRentalLines} from './rental-utils';

export default reactExtension(
  'purchase.checkout.header.render-after',
  () => <RentalHeaderBanner />,
);

function RentalHeaderBanner() {
  const lines = useCartLines();
  const translate = useTranslate();

  if (!cartHasRentalLines(lines)) {
    return null;
  }

  return (
    <Banner title={translate('header_banner_title')} status="info">
      {translate('header_banner_body')}
    </Banner>
  );
}
