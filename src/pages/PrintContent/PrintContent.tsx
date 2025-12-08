import React, { ReactNode } from 'react';

interface PrintContentProps {
  children?: ReactNode;
}

const PrintContent = React.forwardRef<HTMLDivElement, PrintContentProps>(({ children }, ref) => {
  return (
    <div className="py-8 px-7 max-w-3xl mx-auto" ref={ref}>
      {children}
    </div>
  );
});
// Đảm bảo component này có displayName để dễ dàng debug
PrintContent.displayName = 'PrintContent';
export default PrintContent;
