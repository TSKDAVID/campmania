export function SectionHeading({
  title,
  className = '',
}: {
  title: string;
  className?: string;
}) {
  return (
    <div className={`cm-section-heading ${className}`.trim()}>
      <h2 className="cm-section-heading__title">{title}</h2>
      <hr className="cm-section-heading__rule" aria-hidden />
    </div>
  );
}
