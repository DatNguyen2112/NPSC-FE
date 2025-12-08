import { InvestorTypeFacade, InvestorTypeViewModel, RightMapRoleFacade } from '@store';
import { Button, Col, Drawer, Form, Input, Row, Space, Spin, Tooltip } from 'antd';
import { useEffect } from 'react';

import { CloseOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';

import { EStatusState } from '@models';

export default function EditForm() {
  const [codeTypeForm] = Form.useForm();
  const investorTypeFacade = InvestorTypeFacade();
  const [searchParams, setSearchParams] = useSearchParams();
  const rightMapRoleFacade = RightMapRoleFacade();
  const { id = '' } = {
    ...Object.fromEntries(searchParams),
  };

  useEffect(() => {
    rightMapRoleFacade.getRightMapByListCode('CODETYPE');

    if (id) {
      investorTypeFacade.getById({ id });
      investorTypeFacade.set({ isVisibleForm: true });
    }
  }, []);

  useEffect(() => {
    switch (investorTypeFacade.status) {
      case EStatusState.postFulfilled:
      case EStatusState.putFulfilled:
        handleCloseDrawer();
        break;
      case EStatusState.getByIdFulfilled:
        codeTypeForm.setFieldsValue(investorTypeFacade.data);
    }
  }, [investorTypeFacade.status]);

  const handleCloseDrawer = () => {
    investorTypeFacade.set({ isVisibleForm: false });
  };

  const onFinish = (value: InvestorTypeViewModel) => {
    id ? investorTypeFacade.put({ ...value, id }) : investorTypeFacade.post(value);
  };
  return (
    <Drawer
      title={id ? 'Chỉnh sửa loại chủ đầu tư' : 'Thêm mới loại chủ đầu tư'}
      open={investorTypeFacade.isVisibleForm}
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
          codeTypeForm.resetFields(['code', 'name']);
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
      <Spin spinning={investorTypeFacade.isFormLoading}>
        <Form layout={'vertical'} form={codeTypeForm} onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={'Mã loại chủ đầu tư'}
                name={'code'}
                rules={[{ required: true, message: 'Vui lòng nhập mã loại chủ đầu tư' }]}
              >
                <Input disabled={!!id} placeholder="Nhập mã loại chủ đầu tư" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={'Tên loại chủ đầu tư'}
                name={'name'}
                rules={[{ required: true, message: 'Vui lòng nhập tên loại chủ đầu tư' }]}
              >
                <Input placeholder="Nhập tên loại chủ đầu tư" />
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
            {/*<Col span={24}>*/}
            {/*  <Form.Item label={'Mô tả'} name={'description'}>*/}
            {/*    <Input.TextArea rows={3} placeholder="Nhập mô tả" />*/}
            {/*  </Form.Item>*/}
            {/*</Col>*/}
          </Row>
        </Form>
      </Spin>
    </Drawer>
  );
}
