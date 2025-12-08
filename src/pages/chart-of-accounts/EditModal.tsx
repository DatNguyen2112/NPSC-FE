import { EStatusState } from '@models';
import { CodeTypeManagement, CodeTypeManagementFacade } from '@store';
import { Col, Divider, Flex, Form, FormInstance, Input, Modal, Row, Select, Tooltip, Typography } from 'antd';
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CloseOutlined } from '@ant-design/icons';
import { icons } from '@pages/navigation/icon';

export default function EditModal({ chartOfAccountForm }: { chartOfAccountForm: FormInstance }) {
  const codeTypeManagementFacade = CodeTypeManagementFacade();

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
    if (codeTypeManagementFacade.id) {
      codeTypeManagementFacade.getById({ id: codeTypeManagementFacade.id });
    }
  }, []);

  useEffect(() => {
    switch (codeTypeManagementFacade.status) {
      case EStatusState.getByIdFulfilled:
        chartOfAccountForm.setFieldsValue({
          code: codeTypeManagementFacade.data?.code,
        });
    }
  }, [codeTypeManagementFacade.status]);

  return (
    <Modal
      loading={codeTypeManagementFacade.isFormLoading}
      title={'Tạo phân loại'}
      centered
      open={codeTypeManagementFacade.isVisibleFormCOA}
      width={700}
      onCancel={() => codeTypeManagementFacade.set({ isVisibleFormCOA: false })}
      okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
      okText="Xác nhận"
      modalRender={(dom) => (
        <Form
          layout="vertical"
          form={chartOfAccountForm}
          name="form_in_modal"
          initialValues={{ codeTypeItems: [{}] }}
          clearOnDestroy
          onFinish={(values: CodeTypeManagement) => {
            const data = {
              ...codeTypeManagementFacade.data,
              ...values,
            };

            if (codeTypeManagementFacade.isEdit === false) {
              data.codeTypeItems = [
                ...(codeTypeManagementFacade.data?.codeTypeItems || []),
                ...(values.codeTypeItems || []),
              ];
            }

            codeTypeManagementFacade.put({
              ...data,
              id: codeTypeManagementFacade.id,
            });
          }}
        >
          {dom}
        </Form>
      )}
    >
      <Form.Item name="code" label="Nhóm" rules={[{ required: true, message: 'Vui lòng chọn nhóm' }]}>
        <Select
          disabled
          options={codeTypeManagementFacade.pagination?.content.map((item) => ({
            label: item.title,
            value: item.code,
          }))}
        />
      </Form.Item>
      <Divider orientation="left" plain>
        Danh mục con
      </Divider>
      <Form.List name="codeTypeItems">
        {(codeTypeItems, { add, remove }) => (
          <div style={{ display: 'flex', rowGap: 0, flexDirection: 'column' }}>
            {codeTypeItems?.map(({ key, name, ...restField }, index) => (
              <Row gutter={16} key={key}>
                <Col span={7.5}>
                  <Form.Item
                    {...restField}
                    label={'Mã'}
                    name={[name, 'code']}
                    rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
                  >
                    <Input className="!w-full" placeholder="Nhập mã" />
                  </Form.Item>
                </Col>
                <Col span={7.5}>
                  <Form.Item
                    {...restField}
                    label={'Tên'}
                    name={[name, 'title']}
                    rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                  >
                    <Input className="!w-full" placeholder="Nhập tên" />
                  </Form.Item>
                </Col>
                <Col span={7.5}>
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
                </Col>
                <Col span={1.5}>
                  <Flex justify="center" align="center" style={{ height: '100%' }}>
                    <Tooltip title={'Xoá'}>
                      <CloseOutlined
                        onClick={() => {
                          remove(name);
                        }}
                      />
                    </Tooltip>
                  </Flex>
                </Col>
                <Divider className="my-1" />
              </Row>
            ))}
          </div>
        )}
      </Form.List>
    </Modal>
  );
}
