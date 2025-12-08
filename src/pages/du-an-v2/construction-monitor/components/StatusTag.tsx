import { Tag } from 'antd';

interface StatusTagProps {
  statusCode: string;
  statusName: string;
  className?: string;
}

export function StatusTag({ statusCode, statusName, className = '' }: StatusTagProps) {
  const getColor = (code: string) => {
    switch (code) {
      case 'COMPLETED':
      case 'APPROVED':
      case 'RIGHT_ON_PLAN':
        return 'success';
      case 'CANCELED':
      case 'CANCELLED':
      case 'REJECT':
      case 'BEHIND_SCHEDULE':
        return 'error';
      case 'WAIT_PROCESSING':
      case 'PENDING_APPROVE':
      case 'WAIT_TRANSFER':
        return 'warning';
      case 'AUTHOR_SUPERVISOR':
        return 'geekblue';
      case 'IS_DESIGNING':
        return 'volcano';
      case 'IN_PROGRESS':
        return 'processing';
      case 'OVER_SCHEDULE':
        return 'cyan';
      default:
        return 'default';
    }
  };

  return (
    <Tag className={`rounded-full mx-0 ${className}`} color={getColor(statusCode)}>
      {statusName}
    </Tag>
  );
}

export function getStatusColor(statusCode: string): string {
  switch (statusCode) {
    case 'COMPLETED':
    case 'APPROVED':
    case 'RIGHT_ON_PLAN':
      return 'success';
    case 'CANCELED':
    case 'CANCELLED':
    case 'REJECT':
    case 'BEHIND_SCHEDULE':
      return 'error';
    case 'WAIT_PROCESSING':
    case 'PENDING_APPROVE':
    case 'WAIT_TRANSFER':
    case 'NOT_APPROVE':
      return 'warning';
    case 'AUTHOR_SUPERVISOR':
      return 'geekblue';
    case 'IS_DESIGNING':
      return 'volcano';
    case 'IN_PROGRESS':
      return 'processing';
    case 'OVER_SCHEDULE':
      return 'cyan';
    default:
      return 'default';
  }
}
