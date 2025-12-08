import { GlobalFacade } from '@store';
import { Button, Checkbox, Divider, Form, Image, Input, Modal, Rate } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React, { useEffect } from 'react';
import { FrownOutlined, MehOutlined, SmileOutlined } from '@ant-design/icons';
import { EStatusFeedback, FeedbackCreateModel, FeedbackFacade } from '../../store/feed-back';

const FeedBackScreen = () => {
  const globalFacade = GlobalFacade();
  const feedbackFacade = FeedbackFacade();
  const [commentForm] = Form.useForm();
  const moduleOption = [
    { label: 'Sản phẩm', value: 'product' },
    { label: 'Bán hàng', value: 'sale' },
    { label: 'Mua hàng', value: 'purchase' },
    { label: 'Thu-chi', value: 'cashbook' },
    { label: 'Dự án', value: 'project' },
    { label: 'Đối tác', value: 'partner' },
  ];


  useEffect(() => {
    if (feedbackFacade.status) {
      switch (feedbackFacade.status) {
        case EStatusFeedback.createFeedbackFulfilled:
          console.log(12);
          globalFacade.set({ feedbackSuccess: true });
          break;
      }
    }
  }, [feedbackFacade.status]);

  const onFinish = (values: any) => {
    const data: FeedbackCreateModel = {
      ...values,
      rate: values.rate ? values.rate : 3,
    }
    // feedbackFacade.createFeedback(values);
  };
  const onCancel =() => {
    commentForm.resetFields();
    globalFacade.set({ show: false, feedbackSuccess: false })

};

  return (
    <div>
      <Modal
        centered
        open={globalFacade.show}
        title={globalFacade.feedbackSuccess ? 'Cảm ơn những góp ý của bạn' : 'Góp ý về sản phẩm của chúng tôi'}
        footer={null}
        onCancel={onCancel}
      >
        <div className={'py-2'}>
          {
            globalFacade.feedbackSuccess
              ? (
                <div>
                  <Image src={'/assets/images/bg-feedback.jpg'} preview={false} height={300} className={'w-full object-cover'}/>
                  <div className={'w-full '}>
                    <div className={'font-medium py-2 flex-col text-center text-xl'}>Cảm ơn những góp ý của bạn </div>
                    <div className={'flex-col justify-center text-center'}>Góp ý của bạn sẽ là cơ sở để chúng tôi cải tiến sản phẩm, đem đến trải nghiệm tốt hơn cho bạn và hàng
                      ngàn doanh nghiệp trên Việt Nam.</div>
                  </div>
                  <Button onClick={onCancel} type={'primary'} className={'w-full !mt-6'}>
                    Đóng
                  </Button>
                </div>

              )
              : (
                <Form layout={'vertical'} form={commentForm} onFinish={onFinish}>
                  <Form.Item name={'module'} label={'Chọn tính năng mà bạn muốn góp ý :'}>
                    <Checkbox.Group
                      className={'flex gap-3'}
                      options={moduleOption}
                    />
                  </Form.Item>
                  <Form.Item label={'Trải nghiệm của bạn về sản phẩm của chúng tôi như thế nào ?'} name={'rate'}>
                    <Rate defaultValue={3} allowHalf />
                  </Form.Item>
                  <Form.Item rules={[{ required: true }]} name={'content'} label={'Chi tiết góp ý của bạn'}>
                    <TextArea className={'!h-56'} />
                  </Form.Item>
                  <Form.Item name={'phoneNumber'} label={'Chúng tôi có thể liên hệ với bạn qua số điện thoại nào ?'}>
                    <Input placeholder={'Nhập số điện thoại'} />
                  </Form.Item>
                  <Button onClick={commentForm.submit} type={'primary'} className={'w-full'}>Gửi</Button>
                  <Divider className={'!font-normal'}>Hoặc</Divider>
                  <p className={'flex justify-center'}>Nếu bạn đang cần hỗ trợ gấp hãy liên hệ <strong
                    className={'pl-1'}> +84 934 571 626</strong></p>
                </Form>
              )
          }


        </div>
      </Modal>
    </div>

  );
};
export default FeedBackScreen;
