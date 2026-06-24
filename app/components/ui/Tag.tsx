export function Tag({children, className = ''}: {children: React.ReactNode; className?: string}) {
  return <span className={`cm-tag ${className}`.trim()}>{children}</span>;
}
