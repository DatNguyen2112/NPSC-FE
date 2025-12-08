import React from 'react';
import { EStatusParameter, Parameter, ParameterFacade } from '@store';
import { Button, Card, Col, Form, Input, Row, Spin } from 'antd';
import { useEffect } from 'react';
import SunEditor from 'suneditor-react';

const Page: React.FC = () => {
  const parameterFacade = ParameterFacade();
  useEffect(() => {
    parameterFacade.getAll();
  }, []);

  useEffect(() => {
    switch (parameterFacade.status) {
      case EStatusParameter.getAllFulfilled:
        parameterFacade?.tree?.forEach((item: Parameter) => {
          form.setFieldValue(item.name, item.value);
        });
        break;
    }
  }, [parameterFacade.status]);
  const [form] = Form.useForm();
  const onFinish = (value: Parameter) => {
    let listValue: any[] = [];
    for (const key in value) {
      let id: string = '';
      parameterFacade?.tree?.forEach((item: Parameter) => {
        if (item.name === key) {
          id = item.id ?? '';
        }
      });
      listValue.push({ id: id, value: value[key as keyof Parameter] ?? '' });
    }

    const putAllPayload: any = {
      list: listValue,
    };
    parameterFacade.putAll(putAllPayload);
  };
  return (
    <>
      <Spin spinning={parameterFacade.isFormLoading}>
        <div className="max-w-2xl mx-auto p-2">
          <Form form={form} onFinish={onFinish}>
            <Row gutter={[12, 12]}>
              <Col span={24}>
                <Card size="small" title={'Thuế GTGT'} bordered={false}>
                  <Form.Item name={'VAT'} rules={[{ required: true, message: 'Vui lòng nhập thuế GTGT' }]}>
                    <Input type="number" className={'w-full'} placeholder="Nhập thuế GTGT" />
                  </Form.Item>
                </Card>
              </Col>
              <Col span={24}>
                <Card size="small" title={'Ghi chú Báo giá'} bordered={false}>
                  <Form.Item
                    valuePropName={'setContents'}
                    name={'GHICHU'}
                    rules={[{ required: true, message: 'Vui lòng nhập ghi chú Báo giá' }]}
                  >
                    <SunEditor
                      setOptions={{
                        width: 'auto',
                        height: '250px',
                        fontSize: [11, 13, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96, 128],
                        buttonList: [
                          // ['bold', 'underline', 'italic', 'strike'],
                          // ['fontColor'],
                          // ['list', 'lineHeight'],
                          // ['fullScreen'],

                          ['undo', 'redo'],
                          ['font', 'fontSize', 'formatBlock'],
                          ['paragraphStyle', 'blockquote', 'bold', 'underline', 'italic', 'strike', 'subscript'],
                          ['superscript'],
                          ['fontColor', 'hiliteColor', 'textStyle'],
                          ['removeFormat'],
                          // '/', // Line break
                          ['outdent', 'indent'],
                          ['align', 'horizontalRule', 'list', 'lineHeight'],
                          ['table', 'link' /** ,'math' */], // You must add the 'katex' library at options to use the 'math' plugin.
                          /** ['imageGallery'] */ // You must add the "imageGalleryUrl".
                          ['fullScreen', 'showBlocks'],
                          // ['preview', 'print'],
                          // ['save', 'template'],
                          /** ['dir', 'dir_ltr', 'dir_rtl'] */ // "dir": Toggle text direction, "dir_ltr": Right to Left, "dir_rtl": Left to Right
                        ],
                      }}
                      placeholder={'Nhập ghi chú Báo giá'}
                    />
                  </Form.Item>
                </Card>
              </Col>
              <Col span={24}>
                <Card size="small" title={'Tên công ty bảng chấm công/bảng lương'} bordered={false}>
                  <Form.Item
                    name={'NAMECHAMCONG'}
                    rules={[{ required: true, message: 'Vui lòng nhập tên công ty bảng chấm công/bảng lương' }]}
                  >
                    <Input className={'w-full'} placeholder="Nhập tên công ty bảng chấm công/bảng lương" />
                  </Form.Item>
                </Card>
              </Col>
              <Col span={24}>
                <Card size="small" title={'Địa chỉ công ty bảng chấm công/bảng lương'} bordered={false}>
                  <Form.Item
                    name={'ADDRESSCHAMCONG'}
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ công ty bảng chấm công/bảng lương' }]}
                  >
                    <Input className={'w-full'} placeholder="Nhập địa chỉ công ty bảng chấm công/bảng lương" />
                  </Form.Item>
                </Card>
              </Col>
              <Col span={24}>
                <Card size="small" title={'Mã số thuế bảng chấm công/bảng lương'} bordered={false}>
                  <Form.Item
                    name={'MASOTHUE'}
                    rules={[{ required: true, message: 'Vui lòng nhập mã số thuế bảng chấm công/bảng lương' }]}
                  >
                    <Input className={'w-full'} placeholder="Nhập mã số thuế bảng chấm công/bảng lương" />
                  </Form.Item>
                </Card>
              </Col>
              <Col span={24}>
                <div className="flex items-center justify-center">
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Lưu lại
                    </Button>
                  </Form.Item>
                </div>
              </Col>
            </Row>
          </Form>
        </div>
      </Spin>
    </>
  );
};
export default Page;
