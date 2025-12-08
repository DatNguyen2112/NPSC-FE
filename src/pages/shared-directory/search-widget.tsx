import { SearchOutlined } from '@ant-design/icons';
import { Form, FormInstance, Input } from 'antd';
import React, { FC, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

type _T_Props = {
  form: (form: FormInstance) => void;
  callback: (value: string) => void;
  onClick?: any;
  size?: 'small' | 'middle' | 'large';
  className?: string;
  placeholder?: string;
  prefix?: React.ReactNode;
  defaultValue?: string;
  tabActive?: string;
  hidden?: boolean;
  disabled?: boolean;
  value?: string;
};
export const SearchWidget: FC<_T_Props> = (props) => {
  const [form] = Form.useForm();
  let debounceSearch: any;
  const [searchParams] = useSearchParams();
  const  filter = JSON.parse(searchParams.get('filter') ?? '{}')

  useEffect(() => {
    form.setFieldValue('search', filter?.fullTextSearch ? filter?.fullTextSearch : '' );
  }, [filter?.fullTextSearch]);

  const handleSearch = (value: string) => {
    clearTimeout(debounceSearch);
    debounceSearch = setTimeout(function () {
      props.callback(value);
      props.form(form);
    }, 300);
  };

  return (
    <Form form={form}>
      <Form.Item hidden={props.hidden ?? false} name={'search'} className={'mb-0'}>
        <Input
          onClick={props.onClick}
          className={props.className}
          size={props.size ?? 'middle'}
          allowClear
          disabled={props.disabled || false}
          placeholder={props.placeholder ?? 'Nhập nội dung tìm kiếm'}
          prefix={props.prefix ?? <SearchOutlined />}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </Form.Item>
    </Form>
  );
};
