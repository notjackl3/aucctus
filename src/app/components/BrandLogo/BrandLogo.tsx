import { useAccountBranding } from '@hooks/query/accountBranding.hook';
import type { ILogoVariant } from '@libs/api/types/accountBranding';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export type BrandLogoSurface = 'auto' | 'light' | 'dark' | 'color';

export interface BrandLogoProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  surface?: BrandLogoSurface;
  className?: string;
  alt?: string;
  fallback?: React.ReactNode;
}

const channel = (c: number): number => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};

const relativeLuminance = (r: number, g: number, b: number): number =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

const RGB_RE =
  /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/;

const parseOpaqueRgb = (
  value: string,
): { r: number; g: number; b: number } | null => {
  if (!value || value === 'transparent') return null;
  const match = RGB_RE.exec(value);
  if (!match) return null;
  const r = Number(match[1]);
  const g = Number(match[2]);
  const b = Number(match[3]);
  const a = match[4] !== undefined ? Number(match[4]) : 1;
  if (!Number.isFinite(a) || a === 0) return null;
  return { r, g, b };
};

const detectAncestorLuminance = (el: HTMLElement | null): number | null => {
  if (typeof window === 'undefined') return null;
  let node: HTMLElement | null = el?.parentElement ?? null;
  const root =
    typeof document !== 'undefined' ? document.documentElement : null;
  while (node) {
    const bg = window.getComputedStyle(node).backgroundColor;
    const rgb = parseOpaqueRgb(bg);
    if (rgb) return relativeLuminance(rgb.r, rgb.g, rgb.b);
    if (node === root) break;
    node = node.parentElement;
  }
  return null;
};

const BrandLogo: React.FC<BrandLogoProps> = ({
  surface = 'auto',
  className,
  alt = 'Account logo',
  fallback = null,
  onError,
  ...imgProps
}) => {
  const { branding } = useAccountBranding();
  const imgRef = useRef<HTMLImageElement>(null);
  const [ancestorLuminance, setAncestorLuminance] = useState<number | null>(
    null,
  );
  const [errored, setErrored] = useState(false);

  const logos = branding?.logos;
  const deprecatedLogoUrl = branding?.logoUrl;

  useEffect(() => {
    if (surface !== 'auto') return;
    if (typeof window === 'undefined' || typeof document === 'undefined')
      return;

    const measure = () => {
      setAncestorLuminance(detectAncestorLuminance(imgRef.current));
    };

    measure();

    const observer = new MutationObserver(measure);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [surface, logos]);

  const resolvedUrl = useMemo<string | null>(() => {
    const pick = (variant: ILogoVariant | null | undefined): string | null =>
      variant?.url ?? null;

    const fallbackChain = (preferred: string | null): string | null =>
      preferred ?? pick(logos?.color) ?? deprecatedLogoUrl ?? null;

    if (surface === 'color') return fallbackChain(pick(logos?.color));
    if (surface === 'light') return fallbackChain(pick(logos?.light));
    if (surface === 'dark') return fallbackChain(pick(logos?.dark));

    // surface === 'auto'
    // Default to light surface when detection fails (most pages are light).
    const luminance = ancestorLuminance ?? 1;
    const preferred = luminance > 0.5 ? pick(logos?.dark) : pick(logos?.light);
    return fallbackChain(preferred);
  }, [surface, logos, deprecatedLogoUrl, ancestorLuminance]);

  if (!resolvedUrl || errored) {
    return <>{fallback}</>;
  }

  return (
    <img
      {...imgProps}
      ref={imgRef}
      src={resolvedUrl}
      alt={alt}
      className={className}
      onError={(e) => {
        setErrored(true);
        onError?.(e);
      }}
    />
  );
};

export default BrandLogo;
