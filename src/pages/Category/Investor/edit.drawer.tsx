import { CloseOutlined } from '@ant-design/icons';
import { EStatusState } from '@models';
import {
  InvestorFacade,
  InvestorTypeFacade,
  InvestorTypeViewModel,
  InvestorViewModel,
  RightMapRoleFacade,
} from '@store';
import { Button, Col, Drawer, Form, Input, Row, Select, Space, Spin, Tooltip } from 'antd';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function EditForm() {
  const [codeTypeForm] = Form.useForm();
  const investorFacade = InvestorFacade();
  const investorTypeFacade = InvestorTypeFacade();
  const rightMapRoleFacade = RightMapRoleFacade();
  const [searchParams, setSearchParams] = useSearchParams();
  const { filter = '{}', id = '' } = {
    ...Object.fromEntries(searchParams),
  };
  const parsedFilter = JSON.parse(filter);

  useEffect(() => {
    investorTypeFacade.get({ size: -1 });
    rightMapRoleFacade.getRightMapByListCode('CODETYPE');

    if (id) {
      investorFacade.getById({ id });
      investorFacade.set({ isVisibleForm: true });
    }
  }, []);

  useEffect(() => {
    switch (investorFacade.status) {
      case EStatusState.postFulfilled:
      case EStatusState.putFulfilled:
        handleCloseDrawer();
        break;
      case EStatusState.getByIdFulfilled:
        codeTypeForm.setFieldsValue(investorFacade.data);
    }
  }, [investorFacade.status]);

  const handleCloseDrawer = () => {
    investorFacade.set({ isVisibleForm: false });
  };

  const onFinish = (value: InvestorViewModel) => {
    id ? investorFacade.put({ ...value, id }) : investorFacade.post(value);
  };
  return (
    <Drawer
      title={id ? 'Chỉnh sửa chủ đầu tư' : 'Thêm mới chủ đầu tư'}
      open={investorFacade.isVisibleForm}
      onClose={handleCloseDrawer}
      maskClosable={false}
      closeIcon={false}
      extra={<Button icon={<CloseOutlined />} type={'text'} onClick={handleCloseDrawer} />}
      footer={
        <Space className={'flex justify-end'}>
          <Button type={'default'} onClick={handleCloseDrawer}>
            Huỷ bỏ
          </Button>
          {!rightMapRoleFacade?.rightDatas?.[0]?.rightCodes?.includes('ADD') ||
          !rightMapRoleFacade?.rightDatas?.[0]?.rightCodes?.includes('UPDATE') ? (
            <Tooltip title="Bạn không có quyền thực hiện thao tác này">
              <Button disabled={true} type={'primary'} onClick={codeTypeForm.submit}>
                Lưu lại
              </Button>
            </Tooltip>
          ) : (
            <Button type={'primary'} onClick={codeTypeForm.submit}>
              Lưu lại
            </Button>
          )}
        </Space>
      }
      afterOpenChange={(visible) => {
        if (!visible) {
          codeTypeForm.resetFields(['code', 'name', 'investorTypeId']);
          setSearchParams(
            (prev) => {
              prev.delete('id');
              return prev;
            },
            { replace: true },
          );
        }
      }}
    >
      <Spin spinning={investorFacade.isFormLoading}>
        <Form
          initialValues={{
            type: parsedFilter.type,
          }}
          layout={'vertical'}
          form={codeTypeForm}
          onFinish={onFinish}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={'Loại chủ đầu tư'}
                name={'investorTypeId'}
                rules={[{ required: true, message: 'Vui lòng chọn loại chủ đầu tư' }]}
              >
                <Select
                  className="w-full"
                  placeholder="Chọn loại chủ đầu tư"
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  options={investorTypeFacade.pagination?.content.map((item: InvestorTypeViewModel) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={'Mã chủ đầu tư'}
                name={'code'}
                rules={[{ required: true, message: 'Vui lòng nhập mã chủ đầu tư' }]}
              >
                <Input disabled={!!id} placeholder="Nhập mã" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={'Tên chủ đầu tư'}
                name={'name'}
                rules={[{ required: true, message: 'Vui lòng nhập tên chủ đầu tư' }]}
              >
                <Input placeholder="Nhập tên chủ đầu tư" />
              </Form.Item>
            </Col>
            {/*<Col span={24} hidden={!['purposeReceipt', 'EXPENDITURE_PURPOSE'].includes(parsedFilter?.type)}>*/}
            {/*  <Form.List name="codeTypeItems">*/}
            {/*    {(codeTypeItems, { add, remove }) => (*/}
            {/*      <div style={{ display: 'flex', rowGap: 0, flexDirection: 'column' }}>*/}
            {/*        {codeTypeItems.map(({ key, name, ...restField }, index) => (*/}
            {/*          <Space key={key}>*/}
            {/*            <span>{index + 1}.</span>*/}
            {/*            <Form.Item*/}
            {/*              {...restField}*/}
            {/*              label={'Mã'}*/}
            {/*              name={[name, 'code']}*/}
            {/*              rules={[{ required: true, message: 'Vui lòng nhập mã' }]}*/}
            {/*            >*/}
            {/*              <Input className="!w-full" placeholder="Nhập mã" />*/}
            {/*            </Form.Item>*/}
            {/*            <Form.Item*/}
            {/*              {...restField}*/}
            {/*              label={'Tên'}*/}
            {/*              name={[name, 'title']}*/}
            {/*              rules={[{ required: true, message: 'Vui lòng nhập tên' }]}*/}
            {/*            >*/}
            {/*              <Input className="!w-full" placeholder="Nhập tên" />*/}
            {/*            </Form.Item>*/}
            {/*            <Form.Item {...restField} label={'Biểu tượng'} name={[name, 'iconClass']}>*/}
            {/*              <Select*/}
            {/*                className="!w-52"*/}
            {/*                placeholder="Chọn biểu tượng"*/}
            {/*                showSearch*/}
            {/*                allowClear*/}
            {/*                optionFilterProp="value"*/}
            {/*                optionLabelProp={'label'}*/}
            {/*                options={icons.map((item) => ({*/}
            {/*                  label: (*/}
            {/*                    <Flex align="center" gap={4}>*/}
            {/*                      <i className={`${item}`}></i>*/}
            {/*                      <Typography.Text>{item}</Typography.Text>*/}
            {/*                    </Flex>*/}
            {/*                  ),*/}
            {/*                  value: item,*/}
            {/*                }))}*/}
            {/*              />*/}
            {/*            </Form.Item>*/}
            {/*            <Tooltip title={'Xoá mục con'}>*/}
            {/*              <CloseOutlined*/}
            {/*                onClick={() => {*/}
            {/*                  remove(name);*/}
            {/*                }}*/}
            {/*              />*/}
            {/*            </Tooltip>*/}
            {/*          </Space>*/}
            {/*        ))}*/}
            {/*        <Button icon={<PlusOutlined />} color="primary" variant="dashed" onClick={() => add()} block>*/}
            {/*          Thêm mục con*/}
            {/*        </Button>*/}
            {/*      </div>*/}
            {/*    )}*/}
            {/*  </Form.List>*/}
            {/*</Col>*/}
          </Row>
        </Form>
      </Spin>
    </Drawer>
  );
}
