import React, { ReactElement } from 'react';
import { Typography } from 'antd';

interface AmountInfoProps {
  label: string;
  value?: number | string | ReactElement;
  typeValue?: 'secondary' | 'success' | 'warning' | 'danger';
  labelWidth?: number | string;
  labelClassName?: string;
  valueClassName?: string;
  valueStrong?: boolean;
}

const DescriptionsCore: React.FC<AmountInfoProps> = ({
  label,
  value,
  typeValue,
  labelWidth,
  labelClassName = 'text-gray-500',
  valueClassName,
  valueStrong = false,
}) => {
  return (
    <div className="flex items-start">
      <span className={`${labelClassName}`} style={{ width: labelWidth, minWidth: labelWidth }}>
        {label}
      </span>
      <div className="flex items-start gap-2">
        <span>:</span>
        <Typography.Text strong={valueStrong} className={`${valueClassName} line-clamp-2`} type={typeValue}>
          {value}
        </Typography.Text>
      </div>
    </div>
  );
};

export default DescriptionsCore;
