import { CodeTypeFacade, CodeTypeManagement, CodeTypeManagementFacade, TypesCodeTypeManagementFacade } from '@store';
import { Button, Col, Drawer, Flex, Form, Input, Row, Select, Space, Spin, Tooltip, Typography } from 'antd';
import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { icons } from '@pages/navigation/icon';
import { EStatusState } from '@models';

export default function EditForm() {
  const [codeTypeForm] = Form.useForm();
  const codeTypeManagementFacade = CodeTypeManagementFacade();
  const typesCodeTypeManagementFacade = TypesCodeTypeManagementFacade();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    page,
    size,
    filter = '{}',
    sort = '',
    id = '',
  } = {
    ...Object.fromEntries(searchParams),
    page: Number(searchParams.get('page') || 1),
    size: Number(searchParams.get('size') || 20),
  };
  const parsedFilter = JSON.parse(filter);

  useEffect(() => {
    typesCodeTypeManagementFacade.get({ size: -1 });
    codeTypeForm.setFieldsValue({
      type: "PROCESS_TEMPLATE"
    })

    if (id) {
      codeTypeManagementFacade.getById({ id });
      codeTypeManagementFacade.set({ isVisibleForm: true });
    }
  }, []);

  useEffect(() => {
    switch (codeTypeManagementFacade.status) {
      case EStatusState.postFulfilled:
      case EStatusState.putFulfilled:
        handleCloseDrawer();
        break;
      case EStatusState.getByIdFulfilled:
        codeTypeForm.setFieldsValue(codeTypeManagementFacade.data);
    }
  }, [codeTypeManagementFacade.status]);

  const handleCloseDrawer = () => {
    codeTypeManagementFacade.set({ isVisibleForm: false });
  };

  const onFinish = (value: CodeTypeManagement) => {
    id ? codeTypeManagementFacade.put({ ...value, id }) : codeTypeManagementFacade.post(value);
  };
  return (
    <Drawer
      title={id ? 'Chỉnh sửa danh mục' : 'Thêm mới danh mục'}
      width={700}
      open={codeTypeManagementFacade.isVisibleForm}
      onClose={handleCloseDrawer}
      maskClosable={false}
      closeIcon={false}
      extra={<Button icon={<CloseOutlined />} type={'text'} onClick={handleCloseDrawer} />}
      footer={
        <Space className={'flex justify-end'}>
          <Button type={'default'} onClick={handleCloseDrawer}>
            Huỷ bỏ
          </Button>
          <Button type={'primary'} onClick={codeTypeForm.submit}>
            Lưu lại
          </Button>
        </Space>
      }
      afterOpenChange={(visible) => {
        if (!visible) {
          codeTypeForm.resetFields(['code', 'title', 'description']);
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
      <Spin spinning={codeTypeManagementFacade.isFormLoading}>
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
                label={'Danh mục'}
                name={'type'}
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select
                  className="w-full"
                  placeholder="Chọn danh mục"
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  options={typesCodeTypeManagementFacade.pagination?.content?.filter((x) => x.code === 'PROCESS_TEMPLATE').map((item: any) => ({
                    label: item.title,
                    value: item.code,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={'Mã'} name={'code'} rules={[{ required: true, message: 'Vui lòng nhập mã' }]}>
                <Input disabled={!!id} placeholder="Nhập mã" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={'Biểu tượng'} name={'iconClass'}>
                <Select
                  className="w-full"
                  placeholder="Chọn biểu tượng"
                  showSearch
                  allowClear
                  optionFilterProp="value"
                  options={icons.map((item) => ({
                    label: (
                      <Flex align="center" gap={4}>
                        <i className={`${item}`}></i>
                        <Typography.Text>{item}</Typography.Text>
                      </Flex>
                    ),
                    value: item,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label={'Tên'} name={'title'} rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                <Input placeholder="Nhập tên" />
              </Form.Item>
            </Col>
            <Col span={24} hidden={!['purposeReceipt', 'EXPENDITURE_PURPOSE'].includes(parsedFilter?.type)}>
              <Form.List name="codeTypeItems">
                {(codeTypeItems, { add, remove }) => (
                  <div style={{ display: 'flex', rowGap: 0, flexDirection: 'column' }}>
                    {codeTypeItems.map(({ key, name, ...restField }, index) => (
                      <Space key={key}>
                        <span>{index + 1}.</span>
                        <Form.Item
                          {...restField}
                          label={'Mã'}
                          name={[name, 'code']}
                          rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
                        >
                          <Input className="!w-full" placeholder="Nhập mã" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          label={'Tên'}
                          name={[name, 'title']}
                          rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                        >
                          <Input className="!w-full" placeholder="Nhập tên" />
                        </Form.Item>
                        <Form.Item {...restField} label={'Biểu tượng'} name={[name, 'iconClass']}>
                          <Select
                            className="!w-52"
                            placeholder="Chọn biểu tượng"
                            showSearch
                            allowClear
                            optionFilterProp="value"
                            optionLabelProp={'label'}
                            options={icons.map((item) => ({
                              label: (
                                <Flex align="center" gap={4}>
                                  <i className={`${item}`}></i>
                                  <Typography.Text>{item}</Typography.Text>
                                </Flex>
                              ),
                              value: item,
                            }))}
                          />
                        </Form.Item>
                        <Tooltip title={'Xoá mục con'}>
                          <CloseOutlined
                            onClick={() => {
                              remove(name);
                            }}
                          />
                        </Tooltip>
                      </Space>
                    ))}
                    <Button icon={<PlusOutlined />} color="primary" variant="dashed" onClick={() => add()} block>
                      Thêm mục con
                    </Button>
                  </div>
                )}
              </Form.List>
            </Col>
            <Col span={24}>
              <Form.Item label={'Mô tả'} name={'description'}>
                <Input.TextArea rows={3} placeholder="Nhập mô tả" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Spin>
    </Drawer>
  );
}
