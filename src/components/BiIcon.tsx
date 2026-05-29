'use client';

import React from 'react';

/**
 * Bootstrap Icon wrapper component.
 * Usage: <BiIcon name="search" className="text-[20px] text-gray-400" />
 * For filled icons: <BiIcon name="heart" fill className="text-[24px]" />
 *
 * Size mapping (replace w/h classes):
 *   w-3 h-3 (12px) → text-[12px]
 *   w-4 h-4 (14px) → text-[14px]
 *   size-4 (16px) → text-[16px]
 *   w-5 h-5 (20px) → text-[20px]
 *   size-5 (20px) → text-[20px]
 *   w-6 h-6 (24px) → text-[24px]
 *   size-6 (24px) → text-[24px]
 *   w-7 h-7 (28px) → text-[28px]
 *   w-8 h-8 (32px) → text-[32px]
 *   w-9 h-9 (36px) → text-[36px]
 *   w-10 h-10 (40px) → text-[40px]
 *   w-12 h-12 (48px) → text-[48px]
 *   w-14 h-14 (56px) → text-[56px]
 *   w-16 h-16 (64px) → text-[64px]
 *   w-20 h-20 (80px) → text-[80px]
 */
interface BiIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Bootstrap icon name (e.g., "search", "heart", "house-fill") */
  name: string;
  /** Whether to use filled variant (-fill suffix is auto-appended if name doesn't already contain it) */
  fill?: boolean;
}

export function BiIcon({ name, fill = false, className = '', ...props }: BiIconProps) {
  // If fill is true and name doesn't end with -fill, add it
  const iconName = fill && !name.endsWith('-fill') && !name.endsWith('-half') ? `${name}-fill` : name;
  return <i className={`bi bi-${iconName} ${className}`} {...props} />;
}

export default BiIcon;
