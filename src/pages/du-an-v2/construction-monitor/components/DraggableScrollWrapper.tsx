import { useEffect, useRef } from 'react';

interface DraggableScrollWrapperProps {
  children: React.ReactNode;
}

export function DraggableScrollWrapper({ children }: DraggableScrollWrapperProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;

    const mouseDownHandler = (e: MouseEvent) => {
      isDown = true;
      slider.classList.add('active');
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const mouseLeaveHandler = () => {
      isDown = false;
      slider.classList.remove('active');
    };

    const mouseUpHandler = () => {
      isDown = false;
      slider.classList.remove('active');
    };

    const mouseMoveHandler = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2;
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener('mousedown', mouseDownHandler);
    slider.addEventListener('mouseleave', mouseLeaveHandler);
    slider.addEventListener('mouseup', mouseUpHandler);
    slider.addEventListener('mousemove', mouseMoveHandler);

    return () => {
      slider.removeEventListener('mousedown', mouseDownHandler);
      slider.removeEventListener('mouseleave', mouseLeaveHandler);
      slider.removeEventListener('mouseup', mouseUpHandler);
      slider.removeEventListener('mousemove', mouseMoveHandler);
    };
  }, []);

  return (
    <div ref={scrollRef} style={{ overflowX: 'auto', cursor: 'grab' }} className="w-full mb-1 miniScroll pb-2.5">
      {children}
    </div>
  );
}
