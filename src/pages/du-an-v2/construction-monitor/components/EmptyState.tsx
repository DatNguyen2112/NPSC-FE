import { InboxOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="mt-20 text-center">
      <div className="flex justify-center mb-2">
        <InboxOutlined className="text-gray-500 text-[30px]" />
      </div>
      <p className="font-medium color-[#A3A8AF]">{message}</p>
    </div>
  );
}
