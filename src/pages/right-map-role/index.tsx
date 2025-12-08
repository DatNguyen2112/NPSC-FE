import { SubHeader } from '@layouts/admin';
import { RightFacade, RightModel, RoleFacade } from '@store';
import { Button, Card, Checkbox, Form, Menu, MenuProps, Spin, Tooltip } from 'antd';
import Table, { ColumnProps } from 'antd/es/table';
import { FC, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RightMapRoleFacade } from 'src/store/right-map-role';
import { SaveOutlined } from '@ant-design/icons';

const roleOrders = {
  ADMIN: 1,
  BGĐ: 2,
  LĐPĐ: 3,
  TT: 4,
  CV: 5,
  KT: 6,
};

const RightScreen: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [form] = Form.useForm();
  const roleFacade = RoleFacade();
  const rightFacade = RightFacade();
  const rightMapFacade = RightMapRoleFacade();
  const activeGroupKey = searchParams.get('group');
  const rightMenuItems: NonNullable<MenuProps['items']> = useMemo(() => {
    const groupRight = rightFacade.rightList?.reduce(
      (acc, item) => {
        acc[item.groupCode ?? ''] = item.groupName ?? '-';
        return acc;
      },
      {} as Record<string, string>,
    );

    return Object.entries(groupRight ?? {}).map(([key, value], i) => ({
      label: (
        <span className="pl-1">
          {i + 1}. {value}
        </span>
      ),
      key,
    }));
  }, [rightFacade.rightList]);
  const rightByGroup = useMemo(() => {
    return rightFacade.rightList?.filter((item) => item.groupCode === activeGroupKey) ?? [];
  }, [rightFacade.rightList, activeGroupKey]);
  const columns: ColumnProps<RightModel>[] = useMemo(
    () => [
      {
        title: 'Chức năng',
        dataIndex: 'name',
        key: 'name',
        align: 'left',
        width: 250,
        minWidth: 200,
      } satisfies ColumnProps<RightModel>,
      ...[...(roleFacade.pagination?.content ?? [])]
        .sort(
          (a, b) =>
            (roleOrders[a.code as keyof typeof roleOrders] ?? 9999) -
            (roleOrders[b.code as keyof typeof roleOrders] ?? 9999),
        )
        .map(
          (item) =>
            ({
              title: item.name ?? '',
              dataIndex: item.code ?? '',
              key: item.code ?? '',
              align: 'center',
              width: 100,
              minWidth: 100,
              render: (text, record) => {
                return (
                  <div className="-m-4">
                    <Form.Item name={[item.id!, record.id!]} valuePropName="checked">
                      <Checkbox />
                    </Form.Item>
                  </div>
                );
              },
            }) satisfies ColumnProps<RightModel>,
        ),
    ],
    [rightByGroup, roleFacade.pagination],
  );

  useEffect(() => {
    const data = Object.fromEntries(
      roleFacade.pagination?.content.map((role) => [
        role.id,
        Object.fromEntries(
          rightByGroup.map((right) => [
            right.id,
            rightMapFacade.configList?.[role.code!]?.includes(right.code!) ?? false,
          ]),
        ),
      ]) ?? [],
    );
    form.setFieldsValue(data);
  }, [rightMapFacade.configList, roleFacade.pagination]);

  useEffect(() => {
    if (activeGroupKey) {
      rightMapFacade.getConfig(activeGroupKey);
    }
  }, [activeGroupKey]);

  // useEffect(() => {
  //   if (rightMapFacade.status === EStatusRightMapRole.putConfigFulfilled) {
  //     rightMapFacade.getConfig(activeGroupKey ?? '');
  //   }
  // }, [rightMapFacade.status]);

  useEffect(() => {
    roleFacade.get({});
    rightFacade.getAll();
    rightMapFacade.getRightMapByListCode('USER');
  }, []);

  useEffect(() => {
    if (!activeGroupKey && rightFacade.rightList?.length) {
      setSearchParams({ group: rightFacade.rightList?.[0]?.groupCode ?? '' });
    }
  }, [activeGroupKey, rightFacade.rightList]);

  const onFinish = (value: Record<string, Record<string, boolean>>) => {
    if (!activeGroupKey) return;

    const data: { roleId: string; rightIds: string[] }[] = Object.entries(value).map(([roleId, rightIds]) => ({
      roleId: roleId,
      rightIds: Object.entries(rightIds)
        .filter(([_, checked]) => checked)
        .map(([rightId, _]) => rightId),
    }));

    rightMapFacade.putConfig(activeGroupKey ?? '', data);
  };

  return (
    <>
      <SubHeader />
      <div className="p-4 grid grid-cols-[auto_1fr] gap-4 h-[calc(100vh-105px)]">
        <Card
          className="w-60"
          title={<span className="pl-6">Nhóm chức năng</span>}
          styles={{ body: { padding: 0 }, header: { padding: 0 } }}
        >
          <Spin spinning={rightFacade.isLoading}>
            <Menu
              items={rightMenuItems}
              onClick={({ key }) => setSearchParams({ group: key })}
              selectedKeys={[activeGroupKey ?? '']}
            />
          </Spin>
        </Card>
        <Card styles={{ body: { padding: 0 } }} className="overflow-hidden">
          <Form form={form} onFinish={onFinish}>
            <Table
              loading={rightMapFacade.isLoading}
              columns={columns}
              scroll={{ x: true, y: 'calc(100vh - 308px)' }}
              rowKey={(record) => record.id ?? ''}
              bordered
              dataSource={rightByGroup}
              pagination={false}
            />
            <div className="flex justify-end p-4" onClick={form.submit}>
              {!rightMapFacade?.rightDatas?.[0]?.rightCodes?.includes('AUTHORIZE') ? (
                <Tooltip title="Bạn không có quyền thực hiện thao tác này">
                  <Button disabled={true} type="primary" icon={<SaveOutlined />}>
                    Lưu lại
                  </Button>
                </Tooltip>
              ) : (
                <Button type="primary" icon={<SaveOutlined />}>
                  Lưu lại
                </Button>
              )}
            </div>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default RightScreen;
