import {CartForm} from '@shopify/hydrogen';
import {useCallback, useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useLocale} from '~/providers/LocaleProvider';
import {sumLineDeposits, formatDepositGel} from '~/lib/trailrent/deposit';
import type {CartLine} from '~/components/CartLineItem';
import {
  DEPOSIT_TOTAL_ATTR,
  KYC_SESSION_ID_ATTR,
  RENTAL_SECURITY_PATH_ATTR,
  mergeCartAttributes,
  readSecurityPath,
  type RentalSecurityPath,
} from '~/lib/trailrent/rental-security';
import type {KycCheckoutStatus} from '~/lib/trailrent/kyc';
import {IconShield} from '~/components/trailrent/Icons';

export type RentalSecurityGate = {
  path: RentalSecurityPath;
  verified: boolean;
  blocked: boolean;
};

type RentalSecurityPanelProps = {
  cart: CartApiQueryFragment | null;
  lines: CartLine[];
  isLoggedIn: boolean;
  initialKycStatus: KycCheckoutStatus;
  initialVerified: boolean;
  initialBlocked: boolean;
  onGateChange?: (gate: RentalSecurityGate) => void;
};

type KycStatusResponse = {
  verified: boolean;
  blocked: boolean;
  status: KycCheckoutStatus;
  loggedIn?: boolean;
};

type KycSessionResponse = {
  url?: string;
  session_id?: string;
  error?: string;
};

export function RentalSecurityPanel({
  cart,
  lines,
  isLoggedIn,
  initialKycStatus,
  initialVerified,
  initialBlocked,
  onGateChange,
}: RentalSecurityPanelProps) {
  const {translations: tr} = useLocale();
  const attributeSubmitRef = useRef<HTMLButtonElement>(null);
  const [pendingAttributes, setPendingAttributes] = useState<
    Array<{key: string; value: string}> | null
  >(null);

  const [path, setPath] = useState<RentalSecurityPath>(() =>
    initialVerified ? 'kyc' : readSecurityPath(cart?.attributes),
  );
  const [verified, setVerified] = useState(initialVerified);
  const [blocked, setBlocked] = useState(initialBlocked);
  const [kycStatus, setKycStatus] = useState<KycCheckoutStatus>(initialKycStatus);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const depositTotal = sumLineDeposits(lines);
  const persistedPath = readSecurityPath(cart?.attributes);

  useEffect(() => {
    onGateChange?.({path, verified, blocked});
  }, [path, verified, blocked, onGateChange]);

  useEffect(() => {
    if (pendingAttributes && attributeSubmitRef.current) {
      attributeSubmitRef.current.click();
    }
  }, [pendingAttributes]);

  useEffect(() => {
    if (persistedPath && !path) {
      setPath(persistedPath);
    }
  }, [persistedPath, path]);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const response = await fetch('/api/kyc/status');
        if (!response.ok) return;
        const status = (await response.json()) as KycStatusResponse;
        if (cancelled) return;

        if (typeof status.loggedIn === 'boolean') {
          setLoggedIn(status.loggedIn);
        }
        setVerified(status.verified);
        setBlocked(status.blocked);
        setKycStatus(status.status);
        if (status.verified) {
          setPath('kyc');
        }

        // #region agent log
        fetch('http://127.0.0.1:7834/ingest/13766e84-0a43-45d1-bbb7-69a59e80745b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'afdd8d'},body:JSON.stringify({sessionId:'afdd8d',location:'RentalSecurityPanel.tsx:poll',message:'KYC status polled',data:{verified:status.verified,blocked:status.blocked,status:status.status},timestamp:Date.now(),hypothesisId:'H40'})}).catch(()=>{});
        // #endregion
      } catch {
        // ignore transient network errors during poll
      }
    };

    void poll();
    const interval = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const persistAttributes = useCallback(
    (nextPath: RentalSecurityPath, nextSessionId?: string | null) => {
      if (!cart || !nextPath) return;

      const updates: Record<string, string> = {
        [RENTAL_SECURITY_PATH_ATTR]: nextPath,
      };

      if (nextPath === 'deposit') {
        updates[DEPOSIT_TOTAL_ATTR] = String(depositTotal);
      }

      const sid = nextSessionId ?? sessionId;
      if (sid) {
        updates[KYC_SESSION_ID_ATTR] = sid;
      }

      setPendingAttributes(mergeCartAttributes(cart.attributes, updates));
    },
    [cart, depositTotal, sessionId],
  );

  function handlePathChange(next: RentalSecurityPath) {
    setPath(next);
    setError(null);
    persistAttributes(next);

    // #region agent log
    fetch('http://127.0.0.1:7834/ingest/13766e84-0a43-45d1-bbb7-69a59e80745b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'afdd8d'},body:JSON.stringify({sessionId:'afdd8d',location:'RentalSecurityPanel.tsx:pathChange',message:'Security path selected',data:{path:next,depositTotal},timestamp:Date.now(),hypothesisId:'H41'})}).catch(()=>{});
    // #endregion
  }

  async function handleStartVerification() {
    if (!loggedIn) {
      setError(tr.kyc.loginRequired);
      return;
    }

    setLoadingSession(true);
    setError(null);

    try {
      const response = await fetch('/api/kyc/session', {method: 'POST'});
      const session = (await response.json()) as KycSessionResponse;

      if (!response.ok || session.error || !session.url) {
        setError(session.error ?? 'session_create_failed');
        return;
      }

      setSessionUrl(session.url);
      if (session.session_id) {
        setSessionId(session.session_id);
        persistAttributes('kyc', session.session_id);
      }

      window.open(session.url, '_blank', 'noopener,noreferrer');
    } finally {
      setLoadingSession(false);
    }
  }

  if (blocked) {
    return (
      <div className="cm-rental-security cm-rental-security--blocked" role="alert">
        <p className="cm-rental-security__title">{tr.kyc.blockedTitle}</p>
        <p className="text-sm text-muted">{tr.kyc.blockedBody}</p>
      </div>
    );
  }

  return (
    <section
      className="cm-rental-security"
      aria-labelledby="rental-security-heading"
    >
      <h4 id="rental-security-heading" className="cm-rental-security__title">
        <IconShield size={16} className="shrink-0 text-moss" aria-hidden />
        {tr.kyc.paymentTitle}
      </h4>
      <p className="text-sm text-muted">{tr.kyc.paymentIntro}</p>

      {verified ? (
        <p className="cm-rental-security__verified">{tr.kyc.verifiedBadge}</p>
      ) : null}

      <fieldset className="cm-rental-security__choices">
        <legend className="sr-only">{tr.kyc.paymentTitle}</legend>

        <label className={`cm-rental-security__choice${path === 'kyc' ? ' is-selected' : ''}`}>
          <input
            type="radio"
            name="rental_security_path"
            value="kyc"
            checked={path === 'kyc'}
            onChange={() => handlePathChange('kyc')}
          />
          <span>
            <strong>{tr.kyc.pathKycTitle}</strong>
            <span className="block text-sm text-muted">{tr.kyc.pathKycBody}</span>
          </span>
        </label>

        <label
          className={`cm-rental-security__choice${path === 'deposit' ? ' is-selected' : ''}`}
        >
          <input
            type="radio"
            name="rental_security_path"
            value="deposit"
            checked={path === 'deposit'}
            onChange={() => handlePathChange('deposit')}
          />
          <span>
            <strong>{tr.kyc.pathDepositTitle}</strong>
            <span className="block text-sm text-muted">{tr.kyc.pathDepositBody}</span>
            <span className="block text-sm">
              {tr.kyc.depositTotal}: {formatDepositGel(depositTotal)}
            </span>
            <span className="block text-xs text-muted">{tr.kyc.pathDepositPhase2}</span>
          </span>
        </label>
      </fieldset>

      {path === 'kyc' && !verified ? (
        <div className="cm-rental-security__kyc-actions">
          {!loggedIn ? (
            <p className="text-sm">
              <Link
                to={`/account/login?return_to=${encodeURIComponent('/cart')}`}
                className="text-moss underline"
              >
                {tr.kyc.signIn}
              </Link>
              {' — '}
              {tr.kyc.loginRequired}
            </p>
          ) : (
            <>
              <button
                type="button"
                className="tr-btn-secondary cm-rental-security__verify-btn"
                onClick={handleStartVerification}
                disabled={loadingSession}
              >
                {loadingSession ? tr.account.saving : tr.kyc.startVerification}
              </button>
              {sessionUrl ? (
                <p className="text-sm text-muted">
                  <a
                    href={sessionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-moss underline"
                  >
                    {tr.kyc.startVerification}
                  </a>
                  {' — '}
                  {tr.kyc.verificationPending}
                </p>
              ) : null}
              {kycStatus === 'in_review' ? (
                <p className="text-sm text-muted">{tr.kyc.verificationPending}</p>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {error ? (
        <p className="cm-rental-security__error" role="alert">
          {error}
        </p>
      ) : null}

      {pendingAttributes ? (
        <CartForm
          route="/cart"
          action={CartForm.ACTIONS.AttributesUpdateInput}
          inputs={{attributes: pendingAttributes}}
          fetcherKey="rental-security-attributes"
        >
          <button
            type="submit"
            ref={attributeSubmitRef}
            hidden
            tabIndex={-1}
            aria-hidden
          />
        </CartForm>
      ) : null}
    </section>
  );
}

export function canProceedToCheckout(options: {
  hasRentalLines: boolean;
  blocked: boolean;
  path: RentalSecurityPath;
  verified: boolean;
}): {allowed: boolean; reason: string} {
  const {hasRentalLines, blocked, path, verified} = options;

  if (!hasRentalLines) {
    return {allowed: true, reason: 'no_rental_lines'};
  }

  if (blocked) {
    return {allowed: false, reason: 'blocked'};
  }

  if (path === 'deposit') {
    return {allowed: true, reason: 'deposit_path'};
  }

  if (path === 'kyc' && verified) {
    return {allowed: true, reason: 'kyc_verified'};
  }

  if (path === 'kyc' && !verified) {
    return {allowed: false, reason: 'kyc_pending'};
  }

  return {allowed: false, reason: 'choose_path'};
}
