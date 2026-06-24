import {Link} from 'react-router';
import type {ButtonHTMLAttributes, AnchorHTMLAttributes} from 'react';

type ButtonVariant = 'primary' | 'outline';

type BaseProps = {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {to?: undefined};

type LinkProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {to: string};

export function Button(props: ButtonProps | LinkProps) {
  const {variant = 'primary', fullWidth, className = '', children} = props;
  const classes = [
    'cm-btn',
    variant === 'primary' ? 'cm-btn--primary' : 'cm-btn--outline',
    fullWidth ? 'cm-btn--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if ('to' in props && props.to) {
    const {to, variant: _v, fullWidth: _f, className: _c, ...rest} = props;
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const {
    variant: _v,
    fullWidth: _f,
    className: _c,
    type = 'button',
    ...buttonProps
  } = props as ButtonProps;

  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
