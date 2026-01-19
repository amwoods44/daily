'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('page-enter');

  useEffect(() => {
    // When pathname changes, trigger exit animation
    setTransitionStage('page-exit');

    const timeout = setTimeout(() => {
      setDisplayChildren(children);
      setTransitionStage('page-enter');
    }, 200); // Match pageExit animation duration

    return () => clearTimeout(timeout);
  }, [pathname, children]);

  return (
    <div className={transitionStage}>
      {displayChildren}
    </div>
  );
}

// Simpler version that just animates on mount
export function PageEnterAnimation({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-enter">
      {children}
    </div>
  );
}
