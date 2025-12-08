import { reactions } from '@store';
import { Popover } from 'antd';
import { FC, useState } from 'react';

interface ReactionPopupProps {
  children: React.ReactNode;
  onSelect?: (reaction: keyof typeof reactions) => void;
}

const reactionList = Object.values(reactions);

const ReactionPopup: FC<ReactionPopupProps> = ({ children, onSelect }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      styles={{ body: { padding: 0, backgroundColor: 'transparent', borderRadius: 0, boxShadow: 'none' } }}
      arrow={false}
      trigger={['click', 'hover']}
      open={open}
      onOpenChange={(open) => setOpen(open)}
      mouseEnterDelay={0.2}
      content={
        <div className="flex gap-2 -m-3 p-1 rounded-full bg-white -translate-y-3 shadow-lg">
          {reactionList.map((reaction) => (
            <img
              key={reaction.value}
              src={reaction.animationImage}
              alt={reaction.label}
              className="size-10 cursor-pointer hover:scale-125 transition-all"
              onClick={() => {
                onSelect?.(reaction.value);
                setOpen(false);
              }}
            />
          ))}
        </div>
      }
    >
      {children}
    </Popover>
  );
};

export default ReactionPopup;
