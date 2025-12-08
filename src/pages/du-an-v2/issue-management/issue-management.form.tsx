import { Button, Card, Col, DatePicker, Form, Image, Input, Radio, Row, Select, Space, Tooltip } from 'antd';
import { DeleteOutlined, LeftOutlined, SaveOutlined } from '@ant-design/icons';
import React, { useEffect } from 'react';
import {useLocation, useNavigate, useParams} from 'react-router';
import { ConstructionFacade, GlobalFacade, QuanLyNguoiDungFacade } from '@store';
import { IssueFormModel, IssueManagementFacade, IssueModel } from '../../../store/issue-management';
import { EStatusState } from '@models';
import dayjs from 'dayjs';
import { Upload } from '@pages/du-an-v2/issue-management/UploadImages';
import { RightMapRoleFacade } from '../../../store/right-map-role';
import { rightMapCodeConstruction } from '@utils';

const IssueManagementForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const issueManagementFacade = IssueManagementFacade();
  const globalFacade = GlobalFacade();
  const rightMapRoleFacade = RightMapRoleFacade()
  const userFacade = QuanLyNguoiDungFacade();
  const constructionFacade = ConstructionFacade();
  let data: IssueModel;
  const {id} = useParams();
  useEffect(() => {
    if (id){
      issueManagementFacade.getById({id: id})
      rightMapRoleFacade.getRightMapByListCode(rightMapCodeConstruction)
    }

    if (location.state) {
      form.setFieldsValue(location.state)
    }
  }, [id]);

  useEffect(() => {
    switch (issueManagementFacade.status) {
      case EStatusState.putFulfilled:
      case EStatusState.postFulfilled:
        onCancel();
        break;
      case EStatusState.getByIdFulfilled:

        data = {
          ...issueManagementFacade.data,
          constructionId: issueManagementFacade.data.construction.id,
          userId : issueManagementFacade.data.user.id,
          responsibleDepartment: issueManagementFacade.data.user.phongBan.title,
          position: issueManagementFacade.data.user.chucVu.tenChucVu,
          description: issueManagementFacade.data.description,
          expiryDate: issueManagementFacade.data.expiryDate
            ? dayjs(issueManagementFacade.data.expiryDate)
            : null,
          lastModifiedOnDate: issueManagementFacade.data.lastModifiedOnDate
            ? dayjs(issueManagementFacade.data.lastModifiedOnDate)
            : null,
        };
        for (const key in data) {
          form.setFieldValue(key, data[key as keyof IssueModel]);
        }
        break;
    }
  }, [issueManagementFacade.status]);
  useEffect(() => {
    constructionFacade.get({ size: -1 });
    globalFacade.profile();
    userFacade.get({ size: -1 });
  }, []);

  const onFinish = (value: IssueFormModel) => {
    const data = {
      ...value,
      priorityLevel: value.priorityLevel ? value.priorityLevel : 'MEDIUM',
      expiryDate: value.expiryDate ? dayjs(value.expiryDate).format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined,
      attachments: value.attachments ? value.attachments : undefined,
    }
    if (id){
      issueManagementFacade.put({ ...data, id });
    } else issueManagementFacade.post(data);

  };
  const onCancel = () => {
    navigate(-1);
  };


  return (
    <>
      <div className={'bg-white w-full flex justify-between h-12 items-center sticky top-0 z-20 shadow-header'}>
        <Button type={'link'} icon={<LeftOutlined />} className={'!text-gray-600 hover:!text-blue-500 font-medium'} onClick={onCancel}>
          Quay lại
        </Button>
        <Space className={'pr-4'}>
          {
            rightMapRoleFacade?.rightDatas
            && rightMapRoleFacade?.rightDatas?.length > 0
            && rightMapRoleFacade?.rightDatas[0]?.rightCodes?.includes('ADDISSUE')
            ? <Button icon={<SaveOutlined />} type={'primary'} className={'font-medium'} onClick={form.submit}>
                Lưu lại
              </Button>
              : <Tooltip trigger={'hover'} title={'Bạn không có quyền thực hiện chức năng này'}>
                <Button disabled icon={<SaveOutlined />} type={'primary'} className={'font-medium'} onClick={form.submit}>
                  Lưu lại
                </Button>
              </Tooltip>
          }

        </Space>
      </div>
      <div className={'p-4'}>
        <Form
          layout={'vertical'}
          form={form}
          onFinish={onFinish}
          fields={[
            {
              name: 'createdByUserName',
              value: globalFacade.data?.userModel?.name,
            },
            {
              name: 'phongBan',
              value: globalFacade.data?.userModel?.phongBan?.title,
            },
            {
              name: 'chucVu',
              value: globalFacade.data?.userModel?.chucVu?.tenChucVu,
            },
          ]}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Card title={'Thông tin chung'} className={'h-56'} size={'small'}>
                <Row>
                  <Col span={24}>
                    <Form.Item label={'Dự án'} name={'constructionId'} rules={[{ required: true }]}>
                      <Select
                        placeholder={'Chọn dự án'}
                        showSearch
                        allowClear
                        optionFilterProp={'label'}
                        options={constructionFacade.pagination?.content.map((item) => ({
                          label: item.name,
                          value: item.id,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item label={'Hạn xử lý'} name={'expiryDate'} rules={[{ required: true }]}>
                      <DatePicker
                        rootClassName={'w-full'}
                        format={'DD/MM/YYYY'}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label={'Độ ưu tiên'} name={'priorityLevel'}>
                      <Radio.Group defaultValue={'MEDIUM'} className={'font-semibold'}>
                          <Radio value="HIGH"><p className={'text-red-600'}>Cao</p></Radio>
                          <Radio value="MEDIUM"><p className={'text-orange-300'}>Trung bình</p></Radio>
                          <Radio value="LOW"><p className={'text-green-400'}>Thấp</p></Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>

              </Card>
            </Col>
            <Col span={8}>
              <Card title={'File đính kèm'} className={'h-56 overflow-hidden'} size={'small'}>
                <div className={'h-48 overflow-auto'}>
                  <Form.Item name={'attachments'}>
                    <Upload
                      renderContent={(file, handleDeleteFile) => (
                        <div className={'flex gap-2 items-center text-center'}>
                          <div className={'flex items-center'}>
                            <Image
                              src={
                                (file?.fileName?.endsWith('docx') && '/assets/svgs/word.svg') ||
                                (file?.fileType === 'IMAGE' && '/assets/svgs/photo-image.svg') ||
                                (file?.fileName?.endsWith('.pdf') && '/assets/svgs/pdf.svg') ||
                                ''
                              }
                              alt={'img'}
                              width={20}
                              height={20}
                            />
                          </div>
                          <a rel="noopener noreferrer" target={'_blank'}  href={file?.fileUrl ? file?.fileUrl : ''} className={'text-base'}>
                            {file?.fileName}
                          </a>
                          <Button
                            type={'text'}
                            icon={<DeleteOutlined className={'text-red-500'} />}
                            onClick={() => (handleDeleteFile && file ? handleDeleteFile(file) : {})}
                          />
                        </div>
                      )}
                      showBtnDelete={() => false}
                      accept={'/*'}
                      multiple={true}
                      action={'attach'}
                    />
                  </Form.Item>
                </div>
              </Card>
            </Col>
          </Row>
          <Row gutter={12} className={'pt-4'}>
            <Col span={24}>
              <Card title={'Thông tin chi tiết'} size={'small'}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label={'Người tạo'} name={'createdByUserName'}>
                      <Input disabled />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label={'Phòng ban'} name={'phongBan'}>
                      <Input disabled />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label={'Chức vụ'} name={'chucVu'}>
                      <Input disabled />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label={'Người chịu trách nghiệm'} name={'userId'} rules={[{ required: true }]}>
                      <Select
                        showSearch
                        allowClear
                        placeholder="Chọn người chịu trách nhiệm"
                        optionFilterProp="label"
                        optionLabelProp="label"
                        onChange={(value, option) => {
                          const responsibleDepartment = userFacade.pagination?.content.find(x => x.id === value);
                          form.setFieldValue('responsibleDepartment', responsibleDepartment?.phongBan?.title);
                          form.setFieldValue('position', responsibleDepartment?.chucVu?.tenChucVu);
                        }}
                      >
                        {userFacade.pagination?.content.map(item => (
                          <Select.Option
                            key={item.id}
                            value={item.id}
                            label={item.name}
                          >
                            <div className="grid gap-1.5">
                              <p className="font-semibold">{item.name}</p>
                              <p className="text-xs text-gray-600 italic">{item.phongBan?.title}</p>
                              <p>{item.chucVu?.tenChucVu}</p>
                            </div>
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={'Phòng ban chịu trách nhiệm'}
                      rules={[{ required: true }]}
                      name={'responsibleDepartment'}
                    >
                      <Input placeholder={'Nhập phòng ban chịu trách nhiệm'} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name={'position'} label={'Chức vụ'}>
                      <Input placeholder={'Nhập chức vụ'}/>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item label={'Nội dung chính'} name={'content'} rules={[{ required: true }]}>
                      <Input placeholder={'Nhập nội dung chính'} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label={'Mô tả'} name={'description'}>
                      <Input.TextArea placeholder={'Nhập mô tả'} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </>

  );
};
export default IssueManagementForm;
