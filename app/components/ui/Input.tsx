import type {InputHTMLAttributes} from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  id?: string;
};

export function Input({label, id, className = '', ...props}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className={className}>
      {label && inputId ? (
        <label htmlFor={inputId} className="cm-delivery__field-label">
          {label}
        </label>
      ) : null}
      <input id={inputId} className="cm-input" {...props} />
    </div>
  );
}

export function Textarea({
  label,
  id,
  className = '',
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
}) {
  const inputId = id ?? props.name;

  return (
    <div className={className}>
      {label && inputId ? (
        <label htmlFor={inputId} className="cm-delivery__field-label">
          {label}
        </label>
      ) : null}
      <textarea id={inputId} className="cm-textarea" {...props} />
    </div>
  );
}
