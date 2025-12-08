import { Button, Card, Divider, Flex, Form, InputNumber, Space, Spin } from 'antd';
import React, { useEffect } from 'react';
import { SocialInsuranceFacade, SocialInsuranceModel } from '@store';
import { EStatusState } from '@models';
import { SubHeader } from '@layouts/admin';

const Page: React.FC = () => {
  const socialInsuranceFacade = SocialInsuranceFacade();
  const [form] = Form.useForm();

  useEffect(() => {
    socialInsuranceFacade.getById({ id: '3a1a4a04-6fd1-4d56-8d20-87b1e8a6671c', keyState: '' });
    socialInsuranceFacade.set({ isHidden: true });
  }, []);

  useEffect(() => {
    switch (socialInsuranceFacade.status) {
      case EStatusState.putFulfilled:
        socialInsuranceFacade.getById({
          id: socialInsuranceFacade.data.id ?? '3a1a4a04-6fd1-4d56-8d20-87b1e8a6671c',
          keyState: '',
        });

        socialInsuranceFacade.set({ isHidden: true });
        break;
      case EStatusState.getByIdFulfilled:
        for (const key in socialInsuranceFacade.data) {
          form.setFieldValue(key, socialInsuranceFacade.data[key as keyof SocialInsuranceModel]);
        }
        calculateTotalEmployees();
        calculateTotalEmployers();
        break;
    }
  }, [socialInsuranceFacade.status]);

  const calculateTotalEmployees = () => {
    const bhxhNLD = form.getFieldValue('bhxhNguoiLaoDong') ?? 0;
    const bhytNLD = form.getFieldValue('bhytNguoiLaoDong') ?? 0;
    const bhtnNLD = form.getFieldValue('bhtnNguoiLaoDong') ?? 0;
    return socialInsuranceFacade.set({ totalNLD: bhxhNLD + bhytNLD + bhtnNLD });
  };

  const calculateTotalEmployers = () => {
    const bhxhNSDLD = form.getFieldValue('bhxhNguoiSuDungLaoDong') ?? 0;
    const bhytNSDLD = form.getFieldValue('bhytNguoiSuDungLaoDong') ?? 0;
    const bhtnNSDLD = form.getFieldValue('bhtnNguoiSuDungLaoDong') ?? 0;
    return socialInsuranceFacade.set({ totalNSDL: bhxhNSDLD + bhytNSDLD + bhtnNSDLD });
  };

  const onFinish = (values: SocialInsuranceModel) => {
    socialInsuranceFacade.put({
      ...values,
      id: socialInsuranceFacade.data?.id ?? '3a1a4a04-6fd1-4d56-8d20-87b1e8a6671c',
    });
  };

  const tool = (
    <Space size={'middle'} className={'mx-4'}>
      <Button className="font-medium" disabled={socialInsuranceFacade.isHidden} type={'primary'} onClick={form.submit}>
        Lưu lại
      </Button>
    </Space>
  );

  return (
    <>
      <Spin spinning={socialInsuranceFacade.isFormLoading}>
        <SubHeader tool={tool} />
        <div className="p-5 max-w-3xl mx-auto">
          <Card title={'Thông tin đóng BHXH'}>
            <Form
              form={form}
              layout={'vertical'}
              onValuesChange={() => {
                socialInsuranceFacade.set({ isHidden: false });
              }}
              onFinish={onFinish}
            >
              <Flex justify="space-between" gap={150}>
                <div className="w-full">
                  <span className="font-semibold">Người lao động</span>
                  <div className="pt-3">
                    <Form.Item label={'BHXH'} layout="horizontal" name="bhxhNguoiLaoDong" rules={[{ required: true }]}>
                      <InputNumber
                        type="number"
                        className="w-full"
                        addonAfter={'%'}
                        controls={false}
                        placeholder="Nhập % bảo hiểm xã hội"
                        onChange={() => calculateTotalEmployees()}
                      />
                    </Form.Item>
                    <Form.Item label={'BHYT'} layout="horizontal" name="bhytNguoiLaoDong" rules={[{ required: true }]}>
                      <InputNumber
                        type="number"
                        className="w-full"
                        addonAfter={'%'}
                        controls={false}
                        placeholder="Nhập % bảo hiểm y tế"
                        onChange={() => calculateTotalEmployees()}
                      />
                    </Form.Item>
                    <Form.Item label={'BHTN'} layout="horizontal" name="bhtnNguoiLaoDong" rules={[{ required: true }]}>
                      <InputNumber
                        type="number"
                        className="w-full"
                        addonAfter={'%'}
                        controls={false}
                        placeholder="Nhập % bảo hiểm thất nghiệp"
                        onChange={() => calculateTotalEmployees()}
                      />
                    </Form.Item>
                  </div>
                  <p className="font-semibold text-right">Cộng: {socialInsuranceFacade.totalNLD}%</p>
                </div>
                <div className="w-full">
                  <span className="font-semibold">Người sử dụng lao động</span>
                  <div className="pt-3">
                    <Form.Item
                      label={'BHXH'}
                      layout="horizontal"
                      name="bhxhNguoiSuDungLaoDong"
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        type="number"
                        className="w-full"
                        addonAfter={'%'}
                        controls={false}
                        placeholder="Nhập % bảo hiểm xã hội"
                        onChange={() => calculateTotalEmployers()}
                      />
                    </Form.Item>
                    <Form.Item
                      label={'BHYT'}
                      layout="horizontal"
                      name="bhytNguoiSuDungLaoDong"
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        type="number"
                        className="w-full"
                        addonAfter={'%'}
                        controls={false}
                        placeholder="Nhập % bảo hiểm y tế"
                        onChange={() => calculateTotalEmployers()}
                      />
                    </Form.Item>
                    <Form.Item
                      label={'BHTN'}
                      layout="horizontal"
                      name="bhtnNguoiSuDungLaoDong"
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        type="number"
                        className="w-full"
                        addonAfter={'%'}
                        controls={false}
                        placeholder="Nhập % bảo hiểm thất nghiệp"
                        onChange={() => calculateTotalEmployers()}
                      />
                    </Form.Item>
                  </div>
                  <p className="font-semibold text-right">Cộng: {socialInsuranceFacade.totalNSDL}%</p>
                </div>
              </Flex>
              <Divider />
              <Flex justify="end">
                <Flex className="font-semibold" align="center" gap={20}>
                  <p className="uppercase">Tổng:</p>
                  <span>{(socialInsuranceFacade.totalNLD ?? 0) + (socialInsuranceFacade.totalNSDL ?? 0)}%</span>
                </Flex>
              </Flex>
            </Form>
          </Card>
        </div>
      </Spin>
    </>
  );
};

export default Page;
