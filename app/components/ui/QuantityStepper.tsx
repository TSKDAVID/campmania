type QuantityStepperProps = {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseDisabled?: boolean;
  increaseDisabled?: boolean;
  decreaseLabel?: string;
  increaseLabel?: string;
};

export function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
  decreaseDisabled,
  increaseDisabled,
  decreaseLabel = 'Decrease quantity',
  increaseLabel = 'Increase quantity',
}: QuantityStepperProps) {
  return (
    <div className="cm-qty-stepper">
      <button
        type="button"
        className="cm-qty-stepper__btn"
        onClick={onDecrease}
        disabled={decreaseDisabled}
        aria-label={decreaseLabel}
      >
        −
      </button>
      <span className="cm-qty-stepper__value" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="cm-qty-stepper__btn"
        onClick={onIncrease}
        disabled={increaseDisabled}
        aria-label={increaseLabel}
      >
        +
      </button>
    </div>
  );
}
