import { DrawerForm } from '@core/drawer';
import { EFormRuleType, EFormType } from '@models';
import { PhongBanFacade } from '@store';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

const DrawerPhongBan = () => {
  const phongBanFacade = PhongBanFacade();
  const [_, setSearchParams] = useSearchParams();
  return (
    <DrawerForm
      facade={phongBanFacade}
      title={`${phongBanFacade.isEdit ? 'Chỉnh sửa' : 'Thêm mới'} phòng ban`}
      afterOpenChange={(visible) => {
        if (!visible) {
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
          title: 'Mã phòng ban',
          name: 'maPhongBan',
          formItem: {
            rules: [{ type: EFormRuleType.required }],
          },
        },
        {
          title: 'Tên phòng ban',
          name: 'tenPhongBan',
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
        if (phongBanFacade?.data?.id) phongBanFacade.put({ ...values, id: phongBanFacade.data.id });
        else phongBanFacade.post(values);
      }}
    />
  );
};

export default DrawerPhongBan;
