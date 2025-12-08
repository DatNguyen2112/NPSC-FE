import { Checkbox, Form, Input, Table } from 'antd';
import React from 'react';
import { RightMapRoleFacade } from 'src/store/right-map-role';

const { Column } = Table;

const RightMapEditableTable = (props: any) => {
  const { data, disabledAdminId } = props;
  const rightMapRoleFacade = RightMapRoleFacade();

  return (
    <>
      <Table
        size={'small'}
        className={'w-3/4 mt-3 mx-auto'}
        scroll={{ x: 'max-content', y: 'calc(100vh - 280px)' }}
        dataSource={data}
        pagination={false}
        bordered
      >
        <Column
          align={'left'}
          dataIndex={'groupName'}
          title={<p className={'ml-2'}>Chức năng</p>}
          render={(value, row: any, index) => {
            return (
              <Form.Item name={[index, 'groupName']}>
                <Input readOnly variant="borderless" />
              </Form.Item>
            );
          }}
        />
        <Column
          width={100}
          align={'center'}
          dataIndex={'isViewAllowed'}
          title={'Xem'}
          render={(value, row: any, index) => {
            return (
              <Form.Item name={[index, 'isViewAllowed']} valuePropName="checked">
                <Checkbox
                // disabled={
                //   disabledAdminId === '00000000-0000-0000-0000-000000000001' ||
                //   !rightMapRoleFacade.rightDatas?.find((x) => x.groupCode === 'RIGHTMAPROLE')?.isUpdateAllowed
                // }
                />
              </Form.Item>
            );
          }}
        />
        <Column
          width={100}
          align={'center'}
          dataIndex={'isViewAllAllowed'}
          title={'Xem tất cả'}
          render={(value, row: any, index) => {
            return (
              <Form.Item name={[index, 'isViewAllAllowed']} valuePropName="checked">
                <Checkbox
                // disabled={
                //   disabledAdminId === '00000000-0000-0000-0000-000000000001' ||
                //   !rightMapRoleFacade.rightDatas?.find((x) => x.groupCode === 'RIGHTMAPROLE')?.isUpdateAllowed
                // }
                />
              </Form.Item>
            );
          }}
        />
        <Column
          width={100}
          align={'center'}
          dataIndex={'isCreateAllowed'}
          title={'Thêm'}
          render={(value, row: any, index) => {
            return (
              <Form.Item name={[index, 'isCreateAllowed']} valuePropName="checked">
                <Checkbox
                // disabled={
                //   disabledAdminId === '00000000-0000-0000-0000-000000000001' ||
                //   !rightMapRoleFacade.rightDatas?.find((x) => x.groupCode === 'RIGHTMAPROLE')?.isUpdateAllowed
                // }
                />
              </Form.Item>
            );
          }}
        />
        <Column
          width={100}
          align={'center'}
          dataIndex={'isUpdateAllowed'}
          title={'Cập nhật'}
          render={(value, row, index) => {
            return (
              <Form.Item name={[index, 'isUpdateAllowed']} valuePropName="checked">
                <Checkbox
                // disabled={
                //   disabledAdminId === '00000000-0000-0000-0000-000000000001' ||
                //   !rightMapRoleFacade.rightDatas?.find((x) => x.groupCode === 'RIGHTMAPROLE')?.isUpdateAllowed
                // }
                />
              </Form.Item>
            );
          }}
        />
        <Column
          width={100}
          align={'center'}
          dataIndex={'isDeleteAllowed'}
          title={'Xóa'}
          render={(value, row, index) => {
            return (
              <Form.Item name={[index, 'isDeleteAllowed']} valuePropName="checked">
                <Checkbox
                // disabled={
                //   disabledAdminId === '00000000-0000-0000-0000-000000000001' ||
                //   !rightMapRoleFacade.rightDatas?.find((x) => x.groupCode === 'RIGHTMAPROLE')?.isUpdateAllowed
                // }
                />
              </Form.Item>
            );
          }}
        />
      </Table>
    </>
  );
};

export default RightMapEditableTable;
