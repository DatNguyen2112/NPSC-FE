import {
  Badge,
  Button,
  Card,
  Col, Descriptions, DescriptionsProps, Divider,
  Empty,
  Flex,
  Form,
  Image,
  Input,
  Modal,
  Row,
  Space,
  Tag,
  Timeline, Tooltip,
  Typography,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  LeftOutlined,
  ReloadOutlined, SaveOutlined,
} from '@ant-design/icons';
import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { IssueManagementFacade, IssueStatus } from '../../../store/issue-management';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { routerLinks } from '../../../router-links';
import { API, formatDayjsDate, keyToken, lang, linkApi, rightMapCodeConstruction } from '@utils';
import { GlobalFacade } from '@store';
import { Upload } from '@pages/du-an-v2/issue-management/UploadImages';
import { EStatusState } from '@models';
import SunEditor from 'suneditor-react';
import { RightMapRoleFacade } from '../../../store/right-map-role';

const IssueManagementDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const issueManagementFacade = IssueManagementFacade();
  const globalFacade = GlobalFacade();
  const [cancelForm] = Form.useForm();
  const [reopenForm] = Form.useForm();
  const [resolveForm] = Form.useForm();
  const [cancelViewForm] = Form.useForm();
  const [reopenViewForm] = Form.useForm();
  const [resolveViewForm] = Form.useForm();
  const [modalApi, contextModalApi] = Modal.useModal();
  const editorRef = useRef<any>(null);
  const rightMapRoleFacade = RightMapRoleFacade();

  useEffect(() => {
    if (id) {
      issueManagementFacade.getById({ id: id });
      issueManagementFacade.getActivityLogIssue({ id: id });
      globalFacade.profile();
      rightMapRoleFacade.getRightMapByListCode(rightMapCodeConstruction);
    }
  }, [id]);
  useEffect(() => {
    switch (issueManagementFacade.status) {
      case EStatusState.putFulfilled:
      case EStatusState.postFulfilled:
        onCancel();
        break;
    }
  }, [issueManagementFacade.status]);
  const handleDelete = () => {
    modalApi.confirm({
      width: 600,
      title: `Bạn chắc chắn muốn xóa vướng mắc này?`,
      content: 'Thao tác này sẽ xóa vướng mắc bạn đã chọn. Thao tác này không thể khôi phục.',
      onOk: () => {
        id && issueManagementFacade.delete(id);
      },
      onCancel: () => {
      },
      okText: 'Xác nhận',
      okButtonProps: { type: 'primary', danger: true },
      cancelText: 'Thoát',
      cancelButtonProps: { type: 'default', danger: true },
      closable: true,
    });
  };

  useEffect(() => {
    if (issueManagementFacade.status && id) {
      switch (issueManagementFacade.status) {
        case IssueStatus.reopenIssueFulfilled:
          issueManagementFacade.set({ isShowReopenModel: false });
          reopenForm.resetFields();
          issueManagementFacade.getById({ id: id });
          issueManagementFacade.getActivityLogIssue({ id: id });
          break;
        case IssueStatus.resolveIssueFulfilled:
          issueManagementFacade.set({ isShowResolveModel: false });
          resolveForm.resetFields();
          issueManagementFacade.getById({ id: id });
          issueManagementFacade.getActivityLogIssue({ id: id });
          break;
        case IssueStatus.cancelIssueFulfilled:
          issueManagementFacade.set({ isShowCancelModel: false });
          cancelForm.resetFields();
          issueManagementFacade.getById({ id: id });
          issueManagementFacade.getActivityLogIssue({ id: id });
          break;
      }
    }
  }, [issueManagementFacade.status]);

  const onCancel = () => {
    navigate(-1);
  };
  const onKeyDown = (e: any) => {
    if (e.key === '@') {
      issueManagementFacade.set({ keyboardName: e.key });
    }
  };
  const items: DescriptionsProps['items'] = [
    {
      key: 'code',
      label: 'Mã vướng mắc',
      span: 1,
      children: ` : ${issueManagementFacade.data?.code ?? '---'}`,
    },
    {
      key: 'createdOnDate',
      label: 'Ngày tạo',
      span: 1,
      children: `: ${issueManagementFacade.data?.createdOnDate ? dayjs(issueManagementFacade.data?.createdOnDate).format('DD/MM/YYYY') : '---'}`,
    },
    {
      key: 'construction',
      label: 'Dự án',
      span: 1,
      children: <div className={'flex gap-1'}>: <Link
        to={`/${lang}${routerLinks('Construction')}/${issueManagementFacade.data?.construction?.id}/construction-monitor`}>{issueManagementFacade.data?.construction?.name}</Link>
      </div>,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      span: 1,
      children: <div className={'flex gap-1'}>
        :
        <Tag
          className={'rounded-[10px]'}
          color={
            issueManagementFacade.data?.status === 'COMPLETED' && 'green'
            || issueManagementFacade.data?.status === 'WAIT_PROCESSING' && 'orange'
            || issueManagementFacade.data?.status === 'CANCELED' && 'red'
            || 'default'
          }>
          {
            issueManagementFacade.data?.status === 'COMPLETED' && 'Đã xử lý'
            || issueManagementFacade.data?.status === 'WAIT_PROCESSING' && 'Chờ xử lý'
            || issueManagementFacade.data?.status === 'CANCELED' && 'Đã huỷ'
          }
        </Tag>
      </div>,
    },
    {
      key: 'exexpiryDate',
      label: 'Hạn xử lý',
      span: 1,
      children: `: ${issueManagementFacade.data?.expiryDate ? dayjs(issueManagementFacade.data?.expiryDate).format('DD/MM/YYYY') : '---'}`,
    },
    {
      key: 'priorityLevel',
      label: 'Mức độ ưu tiên',
      span: 1,
      children: <Badge
        status={
          issueManagementFacade.data?.priorityLevel == 'HIGH' && 'error'
          || issueManagementFacade.data?.priorityLevel === 'MEDIUM' && 'warning'
          || issueManagementFacade.data?.priorityLevel === 'LOW' && 'success'
          || 'default'
        }
        text={
          issueManagementFacade.data?.priorityLevel === 'HIGH' && 'Cao'
          || issueManagementFacade.data?.priorityLevel === 'MEDIUM' && 'Trung bình'
          || issueManagementFacade.data?.priorityLevel === 'LOW' && 'Thấp'
        }
      />,
    },
  ];

  return (
    <div>
      {contextModalApi}
      <div className={'bg-white w-full flex justify-between h-12 items-center sticky top-0 z-20 shadow-header'}>
        <Button variant="link" className="text-neutral-500 p-0 h-fit border-none shadow-none" icon={<LeftOutlined />}
                onClick={onCancel}>
          Quay lại
        </Button>
        <Space className={'pr-4'}>
          {
            issueManagementFacade.data?.status === 'WAIT_PROCESSING' &&
            <div className={'flex gap-3'}>
              {
                rightMapRoleFacade?.rightDatas
                && rightMapRoleFacade?.rightDatas?.length > 0
                && rightMapRoleFacade?.rightDatas[0]?.rightCodes?.includes('PROCESSISSUE')
                  ? (
                    <Button
                      type={'primary'}
                      danger
                      icon={<CloseOutlined />}
                      onClick={() => issueManagementFacade.set({ isShowCancelModel: true })}
                    >
                      Hủy vướng mắc
                    </Button>
                  )
                  : (
                    <Tooltip title={'Bạn không có quyền sử dụng chức năng này'} trigger={'hover'}>
                      <Button
                        disabled
                        type={'primary'}
                        danger
                        icon={<CloseOutlined />}
                      >
                        Hủy vướng mắc
                      </Button>
                    </Tooltip>
                  )

              }
              {
                rightMapRoleFacade?.rightDatas
                && rightMapRoleFacade?.rightDatas?.length > 0
                && rightMapRoleFacade?.rightDatas[0]?.rightCodes?.includes('PROCESSISSUE')
                  ? <Button
                    type={'primary'}
                    icon={<CheckOutlined />}
                    onClick={() => issueManagementFacade.set({ isShowResolveModel: true })}
                  >
                    Xử lý & đóng vướng mắc
                  </Button>
                  : (
                    <Tooltip title={'Bạn không có quyền sử dụng chức năng này'} trigger={'hover'}>
                      <Button
                        disabled
                        type={'primary'}
                        icon={<CheckOutlined />}
                      >
                        Xử lý & đóng vướng mắc
                      </Button>
                    </Tooltip>
                  )
              }
              {
                rightMapRoleFacade?.rightDatas
                && rightMapRoleFacade?.rightDatas?.length > 0
                && rightMapRoleFacade?.rightDatas[0]?.rightCodes?.includes('UPDATEISSUE')
                  ? (
                    <Button
                      color={'primary'}
                      variant={'outlined'}
                      icon={<EditOutlined />}
                      onClick={() => navigate(`/${lang}${routerLinks('IssueManagement')}/${id}/edit`)}
                    >
                      Sửa vướng mắc
                    </Button>
                  )
                  : (
                    <Tooltip title={'Bạn không có quyền sử dụng chức năng này'} trigger={'hover'}>
                      <Button
                        color={'primary'}
                        variant={'outlined'}
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/${lang}${routerLinks('IssueManagement')}/${id}/edit`)}
                      >
                        Sửa vướng mắc
                      </Button>
                    </Tooltip>
                  )
              }
            </div>
          }
          {
            (issueManagementFacade.data?.status === 'COMPLETED' || issueManagementFacade.data?.status === 'CANCELED')
            &&
            <div className={'flex gap-3'}>
              {
                rightMapRoleFacade?.rightDatas
                && rightMapRoleFacade?.rightDatas?.length > 0
                && rightMapRoleFacade?.rightDatas[0]?.rightCodes?.includes('REOPENISSUE')
                  ?
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => issueManagementFacade.set({ isShowReopenModel: true })}
                  >
                    Mở lại vướng mắc
                  </Button>
                  : (
                    <Tooltip title={'Bạn không có quyền sử dụng chức năng này'} trigger={'hover'}>
                      <Button
                        icon={<ReloadOutlined />}
                        disabled={true}
                      >
                        Mở lại vướng mắc
                      </Button>
                    </Tooltip>
                  )
              }
              {
                rightMapRoleFacade?.rightDatas
                && rightMapRoleFacade?.rightDatas?.length > 0
                && rightMapRoleFacade?.rightDatas[0]?.rightCodes?.includes('DELETEISSUE')
                  ? (
                    <Button
                      color={'red'}
                      variant={'outlined'}
                      icon={<DeleteOutlined />}
                      onClick={handleDelete}
                    >
                      Xoá vướng mắc
                    </Button>
                  )
                  : <Tooltip title={'Bạn không có quyền sử dụng chức năng này'} trigger={'hover'}>
                    <Button
                      color={'red'}
                      variant={'outlined'}
                      icon={<DeleteOutlined />}
                      onClick={handleDelete}
                    >
                      Xoá vướng mắc
                    </Button>
                  </Tooltip>
              }

            </div>
          }
        </Space>
      </div>
      <div className={'p-4 flex flex-col gap-4'}>
        <Row gutter={16}>
          <Col span={16}>
            <Card title={'Thông tin chung'} className={'h-48'} size={'small'}>
              <Descriptions colon={false} column={2} size={'middle'} labelStyle={{ width: '160px' }}>
                <Descriptions.Item
                  label="Mã vướng mắc">: {issueManagementFacade.data?.code ?? '---'}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <div className={'flex gap-1'}>
                    :
                    <Tag
                      className={'rounded-[10px]'}
                      color={
                        issueManagementFacade.data?.status === 'COMPLETED' && 'green'
                        || issueManagementFacade.data?.status === 'WAIT_PROCESSING' && 'orange'
                        || issueManagementFacade.data?.status === 'CANCELED' && 'red'
                        || 'default'
                      }>
                      {
                        issueManagementFacade.data?.status === 'COMPLETED' && 'Đã xử lý'
                        || issueManagementFacade.data?.status === 'WAIT_PROCESSING' && 'Chờ xử lý'
                        || issueManagementFacade.data?.status === 'CANCELED' && 'Đã huỷ'
                      }
                    </Tag>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item
                  label="Ngày tạo">: {issueManagementFacade.data?.createdOnDate ? dayjs(issueManagementFacade.data?.createdOnDate).format('DD/MM/YYYY') : '---'}</Descriptions.Item>
                <Descriptions.Item label="Hạn xử lý">
                  : {issueManagementFacade.data?.expiryDate ? dayjs(issueManagementFacade.data?.expiryDate).format('DD/MM/YYYY') : '---'}
                </Descriptions.Item>
                <Descriptions.Item label="Dự án">
                  <div className={'flex gap-1'}>: <Link
                    to={`/${lang}${routerLinks('Construction')}/${issueManagementFacade.data?.construction?.id}/construction-monitor`}>{issueManagementFacade.data?.construction?.name}</Link>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Mức độ ưu tiên">
                  <div className={'flex gap-1'}>
                    :
                    <Badge
                      status={issueManagementFacade.data?.priorityLevel == 'HIGH' && 'error'
                        || issueManagementFacade.data?.priorityLevel === 'MEDIUM' && 'warning'
                        || issueManagementFacade.data?.priorityLevel === 'LOW' && 'success'
                        || 'default'}
                      text={
                        issueManagementFacade.data?.priorityLevel === 'HIGH' && 'Cao'
                        || issueManagementFacade.data?.priorityLevel === 'MEDIUM' && 'Trung bình'
                        || issueManagementFacade.data?.priorityLevel === 'LOW' && 'Thấp'
                      }
                    />
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col span={8}>
            <Card title={'File đính kèm'} className={'h-48'} size={'small'}>
              <div className={'flex flex-col gap-3'}>
                {issueManagementFacade.data?.attachments?.map((file: any, index: number) =>
                  (
                    <div key={index} className={'flex gap-2 items-center text-center'}>
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
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        className={'text-base'}
                        href={file?.fileUrl ? file?.fileUrl : ''}
                      >
                        {file?.fileName}
                      </a>
                    </div>
                  ))}
              </div>

            </Card>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={16}>
            <Card title={'Thông tin chi tiết'} size={'small'} className={'h-80'}>
              <Descriptions colon={false} column={2} size={'middle'} labelStyle={{ width: '160px' }}>
                <Descriptions.Item span={'filled'}
                                   label="Nội dung chính">: {issueManagementFacade.data?.content ? issueManagementFacade.data.content : '---'}</Descriptions.Item>
                <Descriptions.Item span={'filled'}
                                   label="Mô tả">: {issueManagementFacade.data?.description ? issueManagementFacade.data.description : '---'}</Descriptions.Item>
                <Descriptions.Item
                  label="Người tạo">: {issueManagementFacade.data?.createdByUserName ?? '---'}</Descriptions.Item>
                <Descriptions.Item
                  label="Phòng ban">: {globalFacade.data?.userModel?.phongBan?.title ? globalFacade.data?.userModel?.phongBan?.title : '---'}</Descriptions.Item>
                <Descriptions.Item
                  label="Chức vụ">: {globalFacade.data?.userModel?.chucVu?.tenChucVu ? globalFacade.data?.userModel?.chucVu?.tenChucVu : '---'}</Descriptions.Item>
                <Descriptions.Item
                  label="Số điện thoại">: {globalFacade.data?.userModel?.phoneNumber ? globalFacade.data?.userModel?.phoneNumber : '---'}</Descriptions.Item>
                <Descriptions.Item
                  label="Người chịu trách nhiệm">: {issueManagementFacade.data?.user?.name ? issueManagementFacade.data?.user?.name : '---'}</Descriptions.Item>
                <Descriptions.Item
                  label="Phòng ban chịu TN">: {issueManagementFacade.data?.user?.phongBan?.title ? issueManagementFacade.data?.user?.phongBan?.title : '---'}</Descriptions.Item>
                <Descriptions.Item
                  label="Chức vụ">: {issueManagementFacade.data?.user?.chucVu?.tenChucVu ? issueManagementFacade.data?.user?.chucVu?.tenChucVu : '---'}</Descriptions.Item>
                <Descriptions.Item
                  label="Số điện thoại">: {issueManagementFacade.data?.user?.phoneNumber ? issueManagementFacade.data?.user?.phoneNumber : '---'}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col span={8}>
            <Card title={'Lịch sử xử lý'} size={'small'} className={'h-80'}>
              <div className="!h-64 !p-2 !overflow-auto miniScroll ">
                {issueManagementFacade?.activityLogs?.content != undefined &&
                issueManagementFacade?.activityLogs?.content?.length > 0 ? (
                  <Timeline
                    items={issueManagementFacade?.activityLogs?.content?.map((item: any) => ({
                      key: item?.id,
                      children: (
                        <Flex gap={1} vertical>
                          <Typography.Text>
                            <b className="font-semibold">{item?.createdByUserName}</b> {item?.description}
                          </Typography.Text>
                          {
                            item.description == 'đã mở lại vướng mắc' &&
                            <div
                              className={'flex justify-start text-blue-500 cursor-pointer'}
                              onClick={() => {
                                issueManagementFacade.set({ isViewReopenModel: true });
                                reopenViewForm.setFieldValue('reasonReOpen', item.reasonReopen);
                              }}
                            >Xem lý do mở lại</div>
                          }
                          {
                            item.description == 'đã huỷ vướng mắc' &&
                            <div
                              className={'flex justify-start text-blue-500 cursor-pointer'}
                              onClick={() => {
                                issueManagementFacade.set({ isViewCancelModel: true });
                                cancelViewForm.setFieldValue('reasonCancel', item.reasonCancel);
                              }}
                            >
                              Xem lý do huỷ
                            </div>
                          }
                          {
                            item.description == 'đã xử lý thông tin vướng mắc' &&
                            <div
                              className={'flex justify-start text-blue-500 cursor-pointer'}
                              onClick={() => {
                                issueManagementFacade.set({ isViewResolveModel: true });
                                resolveViewForm.setFieldValue('contentResolve', item.contentResovle);
                                resolveViewForm.setFieldValue('attachmentsResolve', item.attachmentsResolve);
                              }}
                            >Xem nội dung xử lý</div>
                          }
                          <Typography.Text type="secondary">
                            {formatDayjsDate(item.createdOnDate, undefined, true)}
                          </Typography.Text>
                        </Flex>
                      ),
                    }))}
                  />
                ) : (
                  <Empty description={'Chưa có lịch sử xử lý'} />
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
      {
        issueManagementFacade.isShowCancelModel &&
        <Modal
          title={'Hủy vướng mắc'}
          onCancel={() => {
            cancelForm.resetFields();
            issueManagementFacade.set({ isShowCancelModel: false });
          }}
          open={issueManagementFacade.isShowCancelModel}
          footer={<Button icon={<SaveOutlined />} type={'primary'} onClick={cancelForm.submit}>Lưu</Button>}>
          <Form
            form={cancelForm}
            layout={'vertical'}
            onFinish={(values: any) =>
              issueManagementFacade.cancelIssue({ id: id ? id : '', reasonCancel: values.reasonCancel })
            }>
            <Form.Item label={'Lý do hủy'} name={'reasonCancel'} rules={[{ required: true }]}>
              <Input.TextArea placeholder={'Nhập lý do huỷ'} />
            </Form.Item>
          </Form>
        </Modal>
      }
      {
        issueManagementFacade.isShowResolveModel &&
        <Modal
          title={'Xử lý vướng mắc'}
          onCancel={() => {
            resolveForm.resetFields();
            issueManagementFacade.set({ isShowResolveModel: false });
          }}
          open={issueManagementFacade.isShowResolveModel}
          footer={<Button icon={<SaveOutlined />} type={'primary'} onClick={resolveForm.submit}>Lưu</Button>}>
          <Form form={resolveForm} layout={'vertical'} onFinish={(value) => {
            const data = {
              contentResolve: value.contentResolve,
              attachmentsResolve: value.attachmentsResolve,
            };
            if (id) {
              issueManagementFacade.resolveIssue({ id: id, resolveModel: data });
            }
          }}>
            <Form.Item label={'Nội dung'} name={'contentResolve'} valuePropName={'setContents'}
                       rules={[{ required: true }]}>
              <SunEditor
                getSunEditorInstance={(editor) => (editorRef.current = editor)}
                setOptions={{
                  width: 'auto',
                  height: '150px',
                  fontSize: [11, 13, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96, 128],
                  buttonList: [
                    ['undo', 'redo'],
                    ['font', 'fontSize', 'formatBlock'],
                    ['paragraphStyle', 'blockquote'],
                    ['bold', 'italic'],
                    ['fontColor', 'hiliteColor', 'textStyle'],
                    ['removeFormat'],
                    // '/', // Line break
                    ['link', 'image', 'video', 'audio' /** ,'math' */], // You must add the 'katex' library at options to use the 'math' plugin.
                    /** ['imageGallery'] */ // You must add the "imageGalleryUrl".
                  ],
                }}
                onImageUploadBefore={(files, info, uploadHandler) => {
                  const bodyFormData = new FormData();
                  bodyFormData.append('file', files[0]);
                  API.responsible(
                    linkApi + `/upload/blob/attach`,
                    {},
                    {
                      ...API.init(),
                      method: 'post',
                      body: bodyFormData,
                      headers: {
                        authorization: localStorage.getItem(keyToken)
                          ? 'Bearer ' + localStorage.getItem(keyToken)
                          : '',
                        'Accept-Language': localStorage.getItem('i18nextLng') || '',
                      },
                    },
                  ).then(({ data }: any) => {
                    uploadHandler({
                      result: [
                        {
                          url: data.fileUrl,
                          name: data.fileName,
                          size: data.fileSize,
                        },
                      ],
                    });
                  });
                  return false;
                }}
                onKeyDown={onKeyDown}
                // setContents={newsFacade.data?.htmlContent}
                // onChange={onChange}
                // placeholder={placeholder}
                // disable={disabled}
                placeholder={'Nhập nội dung xử lý'}
              />
            </Form.Item>
            <Form.Item name={'attachmentsResolve'}>
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
                    <Link className={'text-base'} to={file?.fileUrl ? file?.fileUrl : ''}>
                      {file?.fileName}
                    </Link>
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
          </Form>
        </Modal>
      }
      {
        issueManagementFacade.isShowReopenModel &&
        <Modal
          title={'Mở lại vướng mắc'}
          onCancel={() => {
            reopenForm.resetFields();
            issueManagementFacade.set({ isShowReopenModel: false });
          }}
          open={issueManagementFacade.isShowReopenModel}
          footer={<Button icon={<SaveOutlined />} type={'primary'} onClick={reopenForm.submit}>Lưu</Button>}>
          <Form form={reopenForm} layout={'vertical'} onFinish={(values) => {
            issueManagementFacade.reopenIssue({ id: id ? id : '', reasonOpen: values.reasonOpen });
          }}>
            <Form.Item label={'Lý do mở lại'} name={'reasonOpen'} rules={[{ required: true }]}>
              <Input.TextArea placeholder={'Nhập lý do mở lại'} />
            </Form.Item>
          </Form>
        </Modal>
      }

      {/*Modal View*/}
      {
        issueManagementFacade.isViewCancelModel &&
        <Modal
          title={'Hủy vướng mắc'}
          onCancel={() => {
            cancelViewForm.resetFields();
            issueManagementFacade.set({ isViewCancelModel: false });
          }}
          open={issueManagementFacade.isViewCancelModel}
          footer={null}>
          <Form
            form={cancelViewForm}
            layout={'vertical'}
            className={'flex flex-col gap-2'}
          >
            <div className={'font-semibold'}>Lý do huỷ</div>
            <Form.Item name={'reasonCancel'} noStyle>
              <div>{cancelViewForm.getFieldValue('reasonCancel')}</div>
            </Form.Item>

          </Form>
        </Modal>
      }
      {
        issueManagementFacade.isViewResolveModel &&
        <Modal
          title={'Xử lý vướng mắc'}
          onCancel={() => {
            resolveForm.resetFields();
            issueManagementFacade.set({ isViewResolveModel: false });
          }}
          open={issueManagementFacade.isViewResolveModel}
          footer={null}>
          <Form form={resolveViewForm} layout={'vertical'}>
            <Form.Item label={<div className={'font-semibold'}>Nội dung</div>} name={'contentResolve'}>
              <Divider className={'!py-2 m-0'} />
              <div dangerouslySetInnerHTML={{ __html: resolveViewForm.getFieldValue('contentResolve') }}></div>
            </Form.Item>
            <Form.Item name={'attachmentsResolve'} label={<div className={'font-semibold'}>File đính kèm</div>}>
              <Divider className={'!py-2 m-0'} />
              {resolveViewForm.getFieldValue('attachmentsResolve')?.map((file: any, index: number) =>
                (
                  <div key={index} className={'flex gap-2 items-center text-center'}>
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
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className={'text-base'}
                      href={file?.fileUrl ? file?.fileUrl : ''}
                    >
                      {file?.fileName}
                    </a>
                  </div>
                ))}
            </Form.Item>
          </Form>
        </Modal>
      }
      {
        issueManagementFacade.isViewReopenModel &&
        <Modal
          title={'Mở lại vướng mắc'}
          onCancel={() => {
            reopenForm.resetFields();
            issueManagementFacade.set({ isViewReopenModel: false });
          }}
          open={issueManagementFacade.isViewReopenModel}
          footer={null}>
          <Form form={reopenViewForm} layout={'vertical'} className={'flex flex-col gap-2'}>
            <div className={'font-semibold'}>Lý do mở lại</div>
            <Form.Item name={'reasonReOpen'} noStyle>
              {reopenViewForm.getFieldValue('reasonReOpen')}
            </Form.Item>
          </Form>
        </Modal>
      }
    </div>
  );
};
export default IssueManagementDetails;
