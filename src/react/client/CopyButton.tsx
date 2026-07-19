import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react';
import { copyToClipboard } from '../../behaviors/clipboard';
import { codeBlockClasses } from '../../recipes/article';
import { cx } from '../../recipes/cx';

const COPIED_FEEDBACK_MS = 2000;

export interface CopyButtonProps extends ComponentPropsWithoutRef<'button'> {
  /** Text copied to the clipboard. */
  code: string;
  label?: string;
  copiedLabel?: string;
}

/** Copy-to-clipboard button for <CodeBlock actions={...} />. */
export function CopyButton({
  code,
  label = 'Copy',
  copiedLabel = 'Copied',
  className,
  ...rest
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  async function handleCopy(): Promise<void> {
    const ok = await copyToClipboard(code);
    if (!ok) return;
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cx(copied ? codeBlockClasses.copyCopied : codeBlockClasses.copy, className)}
      aria-live="polite"
      {...rest}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
