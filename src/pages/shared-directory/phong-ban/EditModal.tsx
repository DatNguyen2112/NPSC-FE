import { CloseOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { EStatusState } from '@models';
import { CodeTypeManagement, CodeTypeManagementFacade, RightMapRoleFacade } from '@store';
import { Button, Col, Divider, Flex, Form, FormInstance, Input, Modal, Row, Tooltip } from 'antd';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function EditModal({ chartOfAccountForm }: { chartOfAccountForm: FormInstance }) {
  const codeTypeManagementFacade = CodeTypeManagementFacade();
  const rightMapRoleFacade = RightMapRoleFacade();

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
    rightMapRoleFacade.getRightMapByListCode('CODETYPE');
  }, []);

  useEffect(() => {
    switch (codeTypeManagementFacade.status) {
      case EStatusState.getByIdFulfilled:
        chartOfAccountForm.setFieldsValue({
          code: codeTypeManagementFacade.data?.code,
          title: codeTypeManagementFacade.data?.title,
        });
    }
  }, [codeTypeManagementFacade.status]);

  const handleSubmit = (values: CodeTypeManagement) => {
    const data = {
      ...codeTypeManagementFacade.data,
      ...values,
    };

    if (codeTypeManagementFacade.isEdit === false) {
      data.codeTypeItems = [...(codeTypeManagementFacade.data?.codeTypeItems || []), ...(values.codeTypeItems || [])];
    }

    codeTypeManagementFacade.put({
      ...data,
      code: values?.code,
      title: values?.title,
      id: codeTypeManagementFacade.id,
    });
  };

  return (
    <Modal
      loading={codeTypeManagementFacade.isFormLoading}
      title={codeTypeManagementFacade.isEdit ? 'Chỉnh sửa phân loại' : 'Thêm mới phân loại con'}
      centered
      open={codeTypeManagementFacade.isVisibleFormCOA}
      width={700}
      onCancel={() => codeTypeManagementFacade.set({ isVisibleFormCOA: false })}
      okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
      footer={
        <div className="flex justify-end">
          <Button type="primary" icon={<SaveOutlined />} onClick={chartOfAccountForm.submit}>
            Lưu lại
          </Button>
        </div>
      }
      cancelText={false}
      modalRender={(dom) => (
        <Form
          layout="vertical"
          form={chartOfAccountForm}
          name="form_in_modal"
          initialValues={{ codeTypeItems: [{}] }}
          clearOnDestroy
          onFinish={handleSubmit}
        >
          {dom}
        </Form>
      )}
    >
      <Row gutter={14}>
        <Col xs={8}>
          <Form.Item name="code" label="Mã phân loại cha" rules={[{ required: true, message: 'Vui lòng chọn nhóm' }]}>
            <Input disabled={!codeTypeManagementFacade.isEdit} placeholder="Nhập mã phân loại cha" />
          </Form.Item>
        </Col>
        <Col xs={16}>
          <Form.Item
            name="title"
            label="Tên phân loại cha"
            rules={[{ required: true, message: 'Vui lòng nhập tên phân loại cha' }]}
          >
            <Input disabled={!codeTypeManagementFacade.isEdit} placeholder="Nhập tên phân loại cha" />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left" plain>
        Phân loại con
      </Divider>
      <Form.List name="codeTypeItems">
        {(codeTypeItems, { add, remove }) => (
          <div style={{ display: 'flex', rowGap: 0, flexDirection: 'column' }}>
            {codeTypeItems?.map(({ key, name, ...restField }, index) => (
              <Row gutter={16} key={key}>
                <Col span={8}>
                  <Form.Item
                    {...restField}
                    label={'Mã'}
                    name={[name, 'code']}
                    rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
                  >
                    <Input className="!w-full" placeholder="Nhập mã" />
                  </Form.Item>
                </Col>
                <Col span={codeTypeManagementFacade.isEdit ? 15 : 16}>
                  <Form.Item
                    {...restField}
                    label={'Tên'}
                    name={[name, 'title']}
                    rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                  >
                    <Input className="!w-full" placeholder="Nhập tên" />
                  </Form.Item>
                </Col>
                {/* <Col span={7.5}>
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
                </Col> */}
                {codeTypeManagementFacade.isEdit && (
                  <Col span={1}>
                    <Flex justify="center" align="center" style={{ height: '100%' }}>
                      <Tooltip title={'Xoá'}>
                        <CloseOutlined
                          className="text-[#FF4D4F]"
                          onClick={() => {
                            remove(name);
                          }}
                        />
                      </Tooltip>
                    </Flex>
                  </Col>
                )}
                <Divider className="my-1" />
              </Row>
            ))}
            {codeTypeManagementFacade.isEdit && (
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} className="mt-2 mb-0">
                  Thêm phân loại con
                </Button>
              </Form.Item>
            )}
            {codeTypeManagementFacade.isEdit && <Divider className="mt-[-9px]" />}
          </div>
        )}
      </Form.List>
    </Modal>
  );
}
