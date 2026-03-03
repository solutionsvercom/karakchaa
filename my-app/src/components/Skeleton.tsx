import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'card';
  width?: number | string;
  height?: number | string;
  count?: number;
}

export function Skeleton({
  variant = 'text',
  width = '100%',
  height,
  count = 1
}: SkeletonProps) {
  const getHeight = () => {
    if (height) return height;
    switch (variant) {
      case 'text': return 16;
      case 'rectangular': return 100;
      case 'circular': return 40;
      case 'card': return 200;
      default: return 16;
    }
  };

  const getBorderRadius = () => {
    switch (variant) {
      case 'text': return 4;
      case 'rectangular': return 8;
      case 'circular': return '50%';
      case 'card': return 12;
      default: return 4;
    }
  };

  const skeletonStyle: React.CSSProperties = {
    width,
    height: getHeight(),
    borderRadius: getBorderRadius(),
    background: 'linear-gradient(90deg, var(--gray-3) 25%, var(--gray-4) 50%, var(--gray-3) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} style={skeletonStyle} />
      ))}
    </>
  );
}

/**
 * Product Card Skeleton
 */
export function ProductCardSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          style={{
            borderRadius: 12,
            padding: 12,
            background: 'var(--gray-1)',
            border: '1px solid var(--gray-4)',
          }}
        >
          <Skeleton variant="rectangular" height={140} />
          <div style={{ marginTop: 12 }}>
            <Skeleton width="60%" />
          </div>
          <div style={{ marginTop: 8 }}>
            <Skeleton width="40%" />
          </div>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton width="30%" />
            <Skeleton width="20%" />
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Table Row Skeleton
 */
export function TableRowSkeleton({ columns = 5, rows = 10 }: { columns?: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} style={{ padding: '12px 16px' }}>
              <Skeleton width={colIndex === 0 ? '80%' : '60%'} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/**
 * List Item Skeleton
 */
export function ListItemSkeleton({ count = 10 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--gray-4)',
          }}
        >
          <Skeleton width="70%" />
          <div style={{ marginTop: 8 }}>
            <Skeleton width="40%" />
          </div>
        </div>
      ))}
    </>
  );
}
