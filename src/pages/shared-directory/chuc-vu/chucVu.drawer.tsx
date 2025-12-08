import { DrawerForm } from '@core/drawer';
import { EFormRuleType, EFormType } from '@models';
import { ChucVuFacade } from '@store';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

const ChucVuDrawer = () => {
  const [_, setSearchParams] = useSearchParams();
  const chucVuFacade = ChucVuFacade();
  return (
    <DrawerForm
      facade={chucVuFacade}
      title={`${chucVuFacade.isEdit ? 'Chỉnh sửa' : 'Thêm mới'} chức vụ`}
      afterOpenChange={(visible) => {
        if (!visible && !chucVuFacade?.data?.id) {
          setSearchParams(
            (prev) => {
              prev.delete('id');
              return prev;
            },
            { replace: true },
          );
        }
      }}
      columns={[
        {
          title: 'Mã chức vụ',
          name: 'maChucVu',
          formItem: {
            rules: [{ type: EFormRuleType.required }],
          },
        },
        {
          title: 'Tên chức vụ',
          name: 'tenChucVu',
          formItem: {
            rules: [{ type: EFormRuleType.required }],
          },
        },
        {
          title: 'Ghi chú',
          name: 'ghiChu',
          formItem: {
            type: EFormType.textarea,
          },
        },
      ]}
      onSubmit={(values) => {
        if (chucVuFacade?.data?.id) chucVuFacade.put({ ...values, id: chucVuFacade.data.id });
        else chucVuFacade.post(values);
      }}
    />
  );
};

export default ChucVuDrawer;
