import {useCallback, useEffect, useState} from 'react';
import {
  reactExtension,
  Banner,
  BlockStack,
  Button,
  Choice,
  ChoiceList,
  InlineStack,
  Link,
  Text,
  useApplyAttributeChange,
  useBuyerJourneyIntercept,
  useCartLines,
  useCustomer,
  useEmail,
  useSettings,
  useTranslate,
} from '@shopify/ui-extensions-react/checkout';
import {
  cartHasRentalLines,
  createKycSession,
  fetchKycStatus,
  getApiOrigin,
  sumDepositAmount,
  type ExtensionSettings,
} from './rental-utils';

type SecurityPath = 'kyc' | 'deposit' | '';

export default reactExtension(
  'purchase.checkout.block.render',
  () => <RentalPaymentBlock />,
);

function RentalPaymentBlock() {
  const lines = useCartLines();
  const settings = useSettings<ExtensionSettings>();
  const translate = useTranslate();
  const customer = useCustomer();
  const email = useEmail();
  const applyAttributeChange = useApplyAttributeChange();

  const [path, setPath] = useState<SecurityPath>('');
  const [verified, setVerified] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasRent = cartHasRentalLines(lines);
  const depositTotal = sumDepositAmount(lines);
  const origin = getApiOrigin(settings);
  const secret = settings.checkout_extension_secret?.trim() ?? '';
  const customerId = customer?.id ?? '';

  const persistAttributes = useCallback(
    async (nextPath: SecurityPath) => {
      if (!nextPath) return;
      await applyAttributeChange({
        type: 'updateAttribute',
        key: 'rental_security_path',
        value: nextPath,
      });
      if (nextPath === 'deposit') {
        await applyAttributeChange({
          type: 'updateAttribute',
          key: 'deposit_total',
          value: String(depositTotal),
        });
      }
      if (sessionId) {
        await applyAttributeChange({
          type: 'updateAttribute',
          key: 'kyc_session_id',
          value: sessionId,
        });
      }
    },
    [applyAttributeChange, depositTotal, sessionId],
  );

  useEffect(() => {
    if (!hasRent || !origin || !secret || !customerId) return;

    let cancelled = false;

    const poll = async () => {
      const status = await fetchKycStatus(origin, secret, customerId);
      if (cancelled) return;
      setVerified(status.verified);
      setBlocked(status.blocked);
      if (status.verified) {
        setPath('kyc');
      }
    };

    void poll();
    const interval = setInterval(poll, 2500);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [hasRent, origin, secret, customerId]);

  useEffect(() => {
    if (!path) return;
    void persistAttributes(path);
  }, [path, persistAttributes]);

  useBuyerJourneyIntercept(({canBlockProgress}) => {
    if (!hasRent || !canBlockProgress) {
      return {behavior: 'allow'};
    }

    if (blocked) {
      return {
        behavior: 'block',
        reason: translate('blocked_title'),
        errors: [{message: translate('blocked_body')}],
      };
    }

    if (path === 'deposit') {
      return {behavior: 'allow'};
    }

    if (path === 'kyc' && verified) {
      return {behavior: 'allow'};
    }

    if (path === 'kyc' && !verified) {
      return {
        behavior: 'block',
        reason: translate('verification_pending'),
        errors: [{message: translate('verification_pending')}],
      };
    }

    return {
      behavior: 'block',
      reason: translate('choose_path'),
      errors: [{message: translate('choose_path')}],
    };
  });

  if (!hasRent) {
    return null;
  }

  if (blocked) {
    return (
      <Banner title={translate('blocked_title')} status="critical">
        {translate('blocked_body')}
      </Banner>
    );
  }

  async function handlePathChange(selected: string) {
    const next = selected as SecurityPath;
    setPath(next);
    setError(null);
    if (next === 'kyc') {
      await persistAttributes('kyc');
    }
    if (next === 'deposit') {
      await persistAttributes('deposit');
    }
  }

  async function handleStartVerification() {
    if (!origin || !secret || !customerId) {
      setError(translate('login_required'));
      return;
    }

    setLoadingSession(true);
    setError(null);

    try {
      const session = await createKycSession(
        origin,
        secret,
        customerId,
        email,
      );
      if (session.error || !session.url) {
        setError(session.error ?? 'session_create_failed');
        return;
      }
      setSessionUrl(session.url);
      if (session.session_id) {
        setSessionId(session.session_id);
        await applyAttributeChange({
          type: 'updateAttribute',
          key: 'kyc_session_id',
          value: session.session_id,
        });
      }
    } finally {
      setLoadingSession(false);
    }
  }

  return (
    <BlockStack spacing="base">
      <Text size="medium" emphasis="bold">
        {translate('payment_title')}
      </Text>
      <Text>{translate('payment_intro')}</Text>

      {verified ? (
        <Banner status="success">{translate('verified_badge')}</Banner>
      ) : null}

      <ChoiceList
        name="rental_security_path"
        value={path}
        onChange={handlePathChange}
      >
        <Choice id="kyc">
          <BlockStack spacing="extraTight">
            <Text emphasis="bold">{translate('path_kyc_title')}</Text>
            <Text appearance="subdued">{translate('path_kyc_body')}</Text>
          </BlockStack>
        </Choice>
        <Choice id="deposit">
          <BlockStack spacing="extraTight">
            <Text emphasis="bold">{translate('path_deposit_title')}</Text>
            <Text appearance="subdued">{translate('path_deposit_body')}</Text>
            <Text>
              {translate('deposit_total')}: {depositTotal} ₾
            </Text>
            <Text appearance="subdued" size="small">
              {translate('path_deposit_phase2')}
            </Text>
          </BlockStack>
        </Choice>
      </ChoiceList>

      {path === 'kyc' && !verified ? (
        <BlockStack spacing="tight">
          {!customerId ? (
            <Banner status="warning">{translate('login_required')}</Banner>
          ) : (
            <>
              <Button
                kind="secondary"
                loading={loadingSession}
                onPress={handleStartVerification}
              >
                {translate('start_verification')}
              </Button>
              {sessionUrl ? (
                <InlineStack spacing="tight" blockAlignment="center">
                  <Link to={sessionUrl} external>
                    {translate('start_verification')}
                  </Link>
                  <Text appearance="subdued" size="small">
                    {translate('verification_pending')}
                  </Text>
                </InlineStack>
              ) : null}
            </>
          )}
        </BlockStack>
      ) : null}

      {error ? (
        <Banner status="critical">{error}</Banner>
      ) : null}
    </BlockStack>
  );
}
