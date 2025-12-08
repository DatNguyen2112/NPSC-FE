import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { InputProps } from 'antd/lib';
import React from 'react';

type _T_Props = InputProps & {
  callback: (value: string) => void;
};
export const InputSearch: React.FC<_T_Props> = ({
  callback,
  prefix = <SearchOutlined />,
  placeholder = 'Nhập dữ liệu tìm kiếm',
  defaultValue,
  className,
  ...props
}) => {
  let debounceSearch: any;

  const handleSearch = (value: string) => {
    clearTimeout(debounceSearch);
    debounceSearch = setTimeout(function () {
      callback(value);
    }, 500);
  };

  return (
    <Input
      className={className}
      allowClear
      placeholder={placeholder}
      prefix={prefix}
      defaultValue={defaultValue}
      onChange={(e) => handleSearch(e.target.value)}
      {...props}
    />
  );
};
