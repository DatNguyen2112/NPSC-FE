import { Image } from 'antd';
import React from 'react';

interface CustomerFormItemProps {
  value?: string; // Giá trị của component, dùng cho URL ảnh
  onChange?: (value: string) => void;
  width: number;
  height: number;
  alt: string; // Hàm callback được gọi khi giá trị thay đổi
}

const CustomFormItem: React.FC<CustomerFormItemProps> = ({ value, onChange, width, height, alt }) => {
  // Xử lý thay đổi giá trị (gọi hàm onChange nếu được truyền vào)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue); // Gọi hàm callback với giá trị mới
    }
  };

  return (
    <div>
      <Image src={value} alt={alt} width={width} height={height} />
    </div>
  );
};

export default CustomFormItem;
