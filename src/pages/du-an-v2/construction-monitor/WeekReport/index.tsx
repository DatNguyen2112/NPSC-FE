import { DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { Upload } from '@core/upload';
import { EStatusState } from '@models';
import { ConstructionFacade, WeekReportFacade, WeekReportViewModel } from '@store';
import { API, keyToken, linkApi } from '@utils';
import { Button, Col, DatePicker, Form, Image, Input, Modal, Row, Select } from 'antd';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useEffect, useRef } from 'react';
import SunEditor from 'suneditor-react';

let defaultStartDate: string | any;
let defaultEndDate: string | any;

dayjs.extend(isoWeek); // Kích hoạt plugin

const { RangePicker } = DatePicker;

function WeekReportModal({ constructionId, weekReportId }: { constructionId: string; weekReportId: string }) {
  const [formWeekReport] = Form.useForm();
  const editorRef = useRef<any>(null);
  const [modalApi, contextModalApi] = Modal.useModal();
  const constructionFacade = ConstructionFacade();
  const weekReportFacade = WeekReportFacade();

  const dateRange = Form.useWatch('dateRange', formWeekReport);

  useEffect(() => {
    const defaultEndDate = dayjs(); // Hôm nay
    const defaultStartDate = dayjs().subtract(7, 'day'); // Lùi lại 7 ngày
    const dateRange = [defaultStartDate, defaultEndDate];

    const baseDate = dateRange[0];

    const currentWeek = baseDate.isoWeek();

    formWeekReport.setFieldsValue({
      title: `Báo cáo công việc tuần ${currentWeek} tạo ngày ${dayjs().format('DD/MM/YYYY')}`,
      statusCode: 'RIGHT_ON_PLAN',
      dateRange,
    });
  }, []);

  useEffect(() => {
    if (dateRange) {
      const baseDate = dateRange[0]; // Ngày bắt đầu để làm chuẩn

      const currentWeek = baseDate.isoWeek();

      formWeekReport.setFieldsValue({
        title: `Báo cáo công việc tuần ${currentWeek} tạo ngày ${dayjs().format('DD/MM/YYYY')}`,
      });
    }
  }, [dateRange]);

  useEffect(() => {
    switch (weekReportFacade.status) {
      case EStatusState.postFulfilled:
      case EStatusState.deleteFulfilled:
      case EStatusState.putFulfilled:
        weekReportFacade.get({
          size: -1,
          filter: JSON.stringify({
            constructionId: constructionId,
          }),
        });
        constructionFacade.getById({ id: constructionId });

        handleCancel();
        break;
      case EStatusState.getByIdFulfilled:
        if (weekReportId != undefined) {
          formWeekReport.setFieldsValue({
            title: weekReportFacade.data?.title,
            statusCode: weekReportFacade.data?.statusCode,
            dateRange: [dayjs(weekReportFacade.data?.startDate), dayjs(weekReportFacade.data?.endDate)],
            lastWeekPlan: weekReportFacade.data?.lastWeekPlan,
            processResult: weekReportFacade.data?.processResult,
            nextWeekPlan: weekReportFacade.data?.nextWeekPlan,
            fileAttachments: weekReportFacade.data?.fileAttachments,
          });
        }
        break;
    }
  }, [weekReportFacade.status]);

  useEffect(() => {
    if (weekReportId) {
      weekReportFacade.getById({
        id: weekReportId,
      });
    }
  }, [weekReportId]);

  const onSubmit = (values: WeekReportViewModel) => {
    const data = {
      ...values,
      constructionId: constructionId,
      startDate: dayjs(dateRange[0]).format('YYYY-MM-DDTHH:mm:ss'),
      endDate: dayjs(dateRange[1]).format('YYYY-MM-DDTHH:mm:ss'),
    };

    if (!weekReportId) {
      weekReportFacade.post(data);
    } else {
      weekReportFacade.put({
        ...data,
        id: weekReportId,
      });
    }
  };

  const handleCancel = () => {
    constructionFacade.set({
      isOpenWeekReport: false,
      weekReportId: undefined,
    });
    formWeekReport.resetFields(['lastWeekPlan', 'processResult', 'nextWeekPlan', 'fileAttachments']);
  };

  const handleDelete = (id: string) => {
    modalApi.confirm({
      width: 600,
      title: `Bạn có chắc chắn muốn xóa báo cáo công việc này?`,
      content: 'Báo cáo công việc này sẽ bị xóa vĩnh viễn, thao tác này không thể khôi phục.',
      onOk: () => {
        id && weekReportFacade.delete(id);
      },
      onCancel: () => {},
      okText: 'Xác nhận',
      okButtonProps: { type: 'primary', danger: true },
      cancelText: 'Thoát',
      cancelButtonProps: { type: 'default', danger: true },
      closable: true,
    });
  };

  return (
    <>
      <Modal
        width={600}
        title={weekReportId ? 'Chỉnh sửa báo cáo công việc tuần' : 'Báo cáo công việc tuần'}
        open={constructionFacade?.isOpenWeekReport}
        onCancel={handleCancel}
        footer={
          !weekReportId ? (
            <div className={'flex justify-end'}>
              <Button type={'primary'} icon={<SaveOutlined />} onClick={formWeekReport.submit}>
                Lưu lại
              </Button>
            </div>
          ) : (
            <div className={'flex justify-end gap-2'}>
              <Button
                variant="outlined"
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  handleDelete(weekReportId);
                }}
              >
                Xoá báo cáo
              </Button>
              <Button type={'primary'} icon={<SaveOutlined />} onClick={formWeekReport.submit}>
                Lưu lại
              </Button>
            </div>
          )
        }
      >
        <div className={'mt-2 h-[436px] overflow-y-auto miniScroll'}>
          <Form className={'mr-4'} form={formWeekReport} layout={'vertical'} onFinish={onSubmit}>
            <Row gutter={[16, 8]}>
              <Col xs={24}>
                <Form.Item
                  name={'title'}
                  label={'Tiêu đề'}
                  rules={[
                    {
                      required: true,
                      message: <span className={'text-sm'}>Vui lòng nhập tiêu đề</span>,
                    },
                  ]}
                >
                  <Input placeholder={'Nhập tiêu đề'} />
                </Form.Item>
              </Col>
              <Col xs={16}>
                <Form.Item
                  name={'dateRange'}
                  label={'Tuần báo cáo'}
                  rules={[
                    {
                      required: true,
                      message: <span className={'text-sm'}>Vui lòng nhập tiêu đề</span>,
                    },
                  ]}
                >
                  <RangePicker format={'DD/MM/YYYY'} className={'w-full'} />
                </Form.Item>
              </Col>
              <Col xs={8}>
                <Form.Item
                  name={'statusCode'}
                  label={'Trạng thái'}
                  rules={[
                    {
                      required: true,
                      message: <span className={'text-sm'}>Vui lòng nhập tiêu đề</span>,
                    },
                  ]}
                >
                  <Select
                    allowClear
                    showSearch
                    optionFilterProp={'label'}
                    placeholder={'Nhập tiêu đề'}
                    options={[
                      {
                        label: 'Đúng kế hoạch',
                        value: 'RIGHT_ON_PLAN',
                      },
                      {
                        label: 'Chậm kế hoạch',
                        value: 'BEHIND_SCHEDULE',
                      },
                      {
                        label: 'Vượt kế hoạch',
                        value: 'OVER_SCHEDULE',
                      },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name={'lastWeekPlan'}
                  label="Kế hoạch tuần trước"
                  rules={[
                    {
                      required: true,
                      message: <span className={'text-sm'}>Vui lòng nhập kế hoạch tuần trước</span>,
                    },
                  ]}
                  valuePropName={'setContents'}
                >
                  <SunEditor
                    getSunEditorInstance={(editor) => (editorRef.current = editor)}
                    setOptions={{
                      width: '150px',
                      height: '100px',
                      fontSize: [11, 13, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96, 128],
                      buttonList: [
                        ['font', 'fontSize'],
                        ['blockquote'],
                        ['bold', 'italic'],
                        ['fontColor', 'hiliteColor', 'textStyle'],
                        ['removeFormat'],
                        // '/', // Line break
                        ['link', 'image'], // You must add the 'katex' library at options to use the 'math' plugin.
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
                    // onKeyDown={onKeyDown}
                    // onChange={onChange}
                    // placeholder={placeholder}
                    // disable={disabled}
                    placeholder={'Nhập nội dung'}
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name={'processResult'}
                  label="Kết quả thực hiện"
                  rules={[
                    {
                      required: true,
                      message: <span className={'text-sm'}>Vui lòng nhập kết quả thực hiện</span>,
                    },
                  ]}
                  valuePropName={'setContents'}
                >
                  <SunEditor
                    getSunEditorInstance={(editor) => (editorRef.current = editor)}
                    setOptions={{
                      width: 'auto',
                      height: '100px',
                      fontSize: [11, 13, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96, 128],
                      buttonList: [
                        ['font', 'fontSize'],
                        ['blockquote'],
                        ['bold', 'italic'],
                        ['fontColor', 'hiliteColor', 'textStyle'],
                        ['removeFormat'],
                        // '/', // Line break
                        ['link', 'image'], // You must add the 'katex' library at options to use the 'math' plugin.
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
                    // onKeyDown={onKeyDown}
                    // onChange={onChange}
                    // placeholder={placeholder}
                    // disable={disabled}
                    placeholder={'Nhập nội dung'}
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name={'nextWeekPlan'}
                  label="Kế hoạch tuần sau"
                  rules={[
                    {
                      required: true,
                      message: <span className={'text-sm'}>Vui lòng nhập kế hoạch tuần sau</span>,
                    },
                  ]}
                  valuePropName={'setContents'}
                >
                  <SunEditor
                    getSunEditorInstance={(editor) => (editorRef.current = editor)}
                    setOptions={{
                      width: '200px',
                      height: '100px',
                      fontSize: [11, 13, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96, 128],
                      buttonList: [
                        ['font', 'fontSize'],
                        ['blockquote'],
                        ['bold', 'italic'],
                        ['fontColor', 'hiliteColor', 'textStyle'],
                        ['removeFormat'],
                        // '/', // Line break
                        ['link', 'image'], // You must add the 'katex' library at options to use the 'math' plugin.
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
                    // onKeyDown={onKeyDown}
                    // onChange={onChange}
                    // placeholder={placeholder}
                    // disable={disabled}
                    placeholder={'Nhập nội dung'}
                  />
                </Form.Item>
              </Col>

              <Col xs={6}>
                <Form.Item name={'fileAttachments'}>
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
                        <a
                          className={'text-base'}
                          target="_blank"
                          rel="noreferrer"
                          href={file?.fileUrl ? file?.fileUrl : ''}
                        >
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
                    text={'Tải lên file đính kèm'}
                    multiple={true}
                    action={'attach'}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>
      {contextModalApi}
    </>
  );
}

export default WeekReportModal;
