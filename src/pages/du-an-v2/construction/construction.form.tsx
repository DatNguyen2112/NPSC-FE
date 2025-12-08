import {
  CloseOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  HolderOutlined,
  InfoCircleTwoTone,
  LeftOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  SaveOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { ToolTip } from '@core/tooltip';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { EStatusState } from '@models';
import AddressPicker from '@pages/du-an-v2/construction/addresspicker.modal';
import UserFollowerManyModal from '@pages/du-an-v2/construction/user-follower-many.modal';
import UserParticipantsManyModal from '@pages/du-an-v2/construction/user-participants-many.modal';
import TableTemplateStages from '@pages/project-template/table-template-stages';
import {
  CheckOverloadEmployeeModel,
  CodeTypeFacade,
  ConstructionFacade,
  ConstructionModel,
  EStatusConstruction,
  InvestorFacade,
  InvestorTypeFacade,
  ProjectTemplateFacade,
  RightMapRoleFacade,
  TemplateStage,
  UserFacade,
} from '@store';
import { rightMapCodeConstruction, uuidv4 } from '@utils';
import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Input,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import dayjs from 'dayjs';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { CSS, useEvent } from '@dnd-kit/utilities';
import React from 'react';

interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}
interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

// Component cho từng nhân viên bị quá tải với collapse
const OverloadEmployeeItem: React.FC<{ employee: any }> = ({ employee }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
      <div
        className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div>
            <div className="font-medium text-gray-800">{employee.name}</div>
            <div className="text-sm text-gray-600">
              Đang tham gia {employee.listEmployeeHasOverloads?.length || 0} dự án khác
            </div>
          </div>
        </div>
        <Button
          type="text"
          icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
          className="text-gray-500 hover:text-gray-700"
        />
      </div>

      {isExpanded && (
        <div className="p-3 bg-white border-t border-gray-200">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {employee.listEmployeeHasOverloads?.map((project: any, index: number) => (
              <div key={index} className="border rounded-lg p-3 hover:shadow-sm transition bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 text-sm">{project.nameConstruction}</div>
                    <div className="text-xs text-blue-500 font-mono mt-1">{project.codeConstruction}</div>
                  </div>
                  <Tag color={getStatusColor(project.statusNameConstruction)} className="text-xs">
                    {project.statusNameConstruction}
                  </Tag>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <span>{project.totalTaskInConstruction} công việc</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Hàm lấy màu cho trạng thái
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Đang thiết kế':
      return 'blue';
    case 'Đang thực hiện':
      return 'orange';
    case 'Hoàn thành':
      return 'green';
    default:
      return 'default';
  }
};

const RowContext = React.createContext<RowContextProps>({});

const DragHandle: React.FC = () => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);
  return (
    <Button
      className="!bg-white"
      type="text"
      size="small"
      icon={<HolderOutlined />}
      style={{ cursor: 'move' }}
      ref={setActivatorNodeRef}
      {...listeners}
    />
  );
};

const rowTable: React.FC<RowProps> = (props) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    // transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  const contextValue = useMemo<RowContextProps>(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners],
  );

  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
};

function ConstructionCreateForm() {
  const [form] = Form.useForm();
  // const constructionAttachments = Form.useWatch('constructionAttachments', form) || [];;
  const navigate = useNavigate();
  const constructionFacade = ConstructionFacade();
  const rightMapRoleFacade = RightMapRoleFacade();
  const projectTemplateFacade = ProjectTemplateFacade();
  const userFacade = UserFacade();
  const codeTypeFacade = CodeTypeFacade();
  const investorFacade = InvestorFacade();
  const investorTypeFacade = InvestorTypeFacade();
  const { modal } = App.useApp();

  const formRef = useRef<FormInstance | undefined>(undefined);
  const { id } = useParams();

  const [showDetails, setShowDetails] = useState(false);
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());

  // const templateStages = Form.useWatch('templateStages', form);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      // setDataSource((prevState) => {
      //   const activeIndex = prevState.findIndex((record) => record.key === active?.id);
      //   const overIndex = prevState.findIndex((record) => record.key === over?.id);
      //   return arrayMove(prevState, activeIndex, overIndex);
      // });
      form.setFieldsValue({
        templateStages: arrayMove(
          form.getFieldValue('templateStages'),
          form.getFieldValue('templateStages').findIndex((stage: any, index: number) => index === active?.id),
          form.getFieldValue('templateStages').findIndex((stage: any, index: number) => index === over?.id),
        ),
      });
    }
  };

  useEffect(() => {
    userFacade.get({ size: -1 });
    projectTemplateFacade.get({ size: -1 });
    rightMapRoleFacade.getRightMapByListCode(rightMapCodeConstruction);

    constructionFacade.set({
      listParticipantsArr: [],
      listPresentArr: [],
      listPresent: [],
      listParticipants: [],
      checkedListParticipants: [],
      checkedListPresent: [],
      isEditTemplateStages: false,
    });

    investorFacade.get({ size: -1 });
    investorTypeFacade.get({ size: -1 });

    // code type
    codeTypeFacade.getVoltageType({ size: -1 });
    codeTypeFacade.getOwnerType({ size: -1 });
    codeTypeFacade.getInvestor({ size: -1 });
  }, []);

  useEffect(() => {
    switch (constructionFacade.status) {
      case EStatusState.postFulfilled:
      case EStatusState.putFulfilled:
        navigate(-1);
        break;
      case EStatusState.getByIdFulfilled:
        form.setFieldsValue({
          constructionAttachments: constructionFacade.data?.constructionAttachments,
          code: constructionFacade.data?.code,
          name: constructionFacade.data?.name,
          statusCode: constructionFacade.data?.statusCode,
          constructionTemplateId: constructionFacade.data.constructionTemplateId,
          templateStages: constructionFacade.data?.templateStages?.map((item: TemplateStage) => ({
            ...item,
            expiredDate: dayjs(item?.expiredDate) ? dayjs(item?.expiredDate) : dayjs,
          })),
          voltageTypeCode: constructionFacade.data.voltage?.code,
          investorId: constructionFacade.data?.investorId,
          ownerTypeCode: constructionFacade.data.ownerTypeCode,
          deliveryDate: dayjs(constructionFacade.data?.deliveryDate),
          priorityCode: constructionFacade.data?.priorityCode,
          documentStatusCode: constructionFacade.data.documentStatusCode,
          executionStatusCode: constructionFacade.data.executionStatusCode,
          completionByInvestor: constructionFacade.data.completionByInvestor,
          completionByCompany: constructionFacade.data.completionByCompany,
          note: constructionFacade.data.note,
        });

        if (constructionFacade?.data?.constructionTemplateId) {
          constructionFacade.set({ isEditTemplateStages: true });
        }

        constructionFacade.set({
          listItems: investorTypeFacade.pagination?.content?.find(
            (item) => item?.code === constructionFacade.data?.ownerTypeCode,
          )?.investor,
        });

        constructionFacade.set({
          listPresentArr: constructionFacade?.data?.executionTeams?.filter((x: any) => x.userType === 'follower'),
          listParticipantsArr: constructionFacade?.data?.executionTeams?.filter(
            (x: any) => x.userType === 'participants',
          ),
        });
        break;
    }
  }, [constructionFacade.status]);

  // Xử lý response từ checkOverloadEmployee
  useEffect(() => {
    if (constructionFacade.status === EStatusConstruction.checkOverloadEmployeeFulfilled) {
      if (constructionFacade.overloadData?.isOverload) {
        // Hiển thị modal nếu có quá tải
        constructionFacade.set({ isShowOverloadDetailModel: true });
        // Reset expanded state khi mở modal mới
        setExpandedEmployees(new Set());
      } else {
        // Ẩn modal và submit luôn nếu không quá tải
        constructionFacade.set({ isShowOverloadDetailModel: false });

        // Gọi onFinish trực tiếp với payload đã lưu
        if (constructionFacade.payloadOnSubmit) {
          if (id) {
            constructionFacade.put(constructionFacade.payloadOnSubmit);
          } else {
            constructionFacade.post(constructionFacade.payloadOnSubmit);
          }
        }
      }
    }
  }, [constructionFacade.status, constructionFacade.overloadData]);

  useEffect(() => {
    switch (projectTemplateFacade.status) {
      case EStatusState.getByIdFulfilled:
        form.setFieldsValue({
          templateStages: projectTemplateFacade.data?.templateStages,
        });

        constructionFacade.set({
          isEditTemplateStages: true,
        });
        break;
    }
  }, [projectTemplateFacade.status]);

  // useEffect(() => {
  //   if (templateStages?.length === 0) {
  //     constructionFacade.set({
  //       isEditTemplateStages: false,
  //     });

  //     // form.setFieldValue('constructionTemplateId', null);
  //   }
  // }, [templateStages]);

  useEffect(() => {
    if (id) {
      constructionFacade.getById({ id: id });
    }
  }, [id]);

  const onCancel = () => {
    navigate(-1);
    form.resetFields();
    constructionFacade.set({
      listParticipantsArr: [],
      listPresentArr: [],
      listPresent: [],
      listParticipants: [],
      checkedListParticipants: [],
      checkedListPresent: [],
    });
  };

  const toggleEmployeeExpanded = (employeeId: string) => {
    setExpandedEmployees((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  const onCheckOverloadWarning = (values: ConstructionModel) => {
    const payload = {
      ...values,
      code: values?.code != '' ? values?.code : null,
      ...(id && { id: id }),
      executionTeams: id
        ? constructionFacade?.listPresentArr?.length > 0 && constructionFacade.listParticipantsArr?.length > 0
          ? [...(constructionFacade?.listPresentArr ?? []), ...constructionFacade.listParticipantsArr]
          : []
        : constructionFacade?.listPresent?.length > 0 && constructionFacade.listParticipants?.length > 0
          ? [...(constructionFacade?.listPresent ?? []), ...constructionFacade.listParticipants]
          : [],
      priorityCode: values?.priorityCode != null ? values?.priorityCode : '2',
      statusCode: values?.statusCode != null ? values?.statusCode : 'IS_DESIGNING',
      executionStatusCode: values?.executionStatusCode != null ? values?.executionStatusCode : 'IN_PROGRESS',
      documentStatusCode: values?.documentStatusCode != null ? values?.documentStatusCode : 'NOT_APPROVE',
      deliveryDate: dayjs(values?.deliveryDate).format('YYYY-MM-DDTHH:mm:ss[Z]'),
      templateStages: values.templateStages
        ? values.templateStages?.map((item: TemplateStage, index: number) => ({
            ...item,
            stepOrder: index + 1,
            id: item?.id || uuidv4(),
            expiredDate: dayjs(item?.expiredDate).format('YYYY-MM-DDTHH:mm:ss[Z]'),
          }))
        : [],
    };

    // Lưu payload để sử dụng sau này nếu cần
    constructionFacade.set({
      payloadOnSubmit: payload,
    });

    // Gọi API kiểm tra quá tải
    constructionFacade.checkOverloadEmployee({
      ...(id && { projectId: id }),
      payloadEmployee: payload,
    });
  };

  const onFinish = (values: ConstructionModel) => {
    const data = {
      ...values,
      executionTeams:
        constructionFacade?.listPresent?.length > 0 && constructionFacade.listParticipants?.length > 0
          ? [...(constructionFacade?.listPresent ?? []), ...constructionFacade.listParticipants]
          : [],
      priorityCode: values?.priorityCode != null ? values?.priorityCode : '2',
      statusCode: values?.statusCode != null ? values?.statusCode : 'IS_DESIGNING',
      executionStatusCode: values?.executionStatusCode != null ? values?.executionStatusCode : 'IN_PROGRESS',
      documentStatusCode: values?.documentStatusCode != null ? values?.documentStatusCode : 'NOT_APPROVE',
      deliveryDate: dayjs(values?.deliveryDate).format('YYYY-MM-DDTHH:mm:ss[Z]'),
      templateStages: values.templateStages
        ? values.templateStages?.map((item: TemplateStage, index: number) => ({
            ...item,
            stepOrder: index + 1,
            id: item?.id || uuidv4(),
            expiredDate: dayjs(item?.expiredDate).format('YYYY-MM-DDTHH:mm:ss[Z]'),
          }))
        : [],
    };

    if (id) {
      constructionFacade.put({
        ...values,
        code: values?.code != '' ? values?.code : null,
        id: id,
        executionTeams:
          constructionFacade?.listPresentArr?.length > 0 && constructionFacade.listParticipantsArr?.length > 0
            ? [...(constructionFacade?.listPresentArr ?? []), ...constructionFacade.listParticipantsArr]
            : [],
        priorityCode: values?.priorityCode != null ? values?.priorityCode : '2',
        statusCode: values?.statusCode != null ? values?.statusCode : 'IS_DESIGNING',
        executionStatusCode: values?.executionStatusCode != null ? values?.executionStatusCode : 'IN_PROGRESS',
        documentStatusCode: values?.documentStatusCode != null ? values?.documentStatusCode : 'NOT_APPROVE',
        deliveryDate: dayjs(values?.deliveryDate).format('YYYY-MM-DDTHH:mm:ss[Z]'),
        templateStages: values.templateStages
          ? values.templateStages?.map((item: TemplateStage, index: number) => ({
              ...item,
              stepOrder: index + 1,
              id: item?.id || uuidv4(),
              expiredDate: dayjs(item?.expiredDate).format('YYYY-MM-DDTHH:mm:ss[Z]'),
            }))
          : [],
      });
    } else {
      constructionFacade.post(data);
    }
  };

  return (
    <>
      {/* Modal overload detail */}
      {/* Modal overload detail */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ExclamationCircleOutlined className="text-yellow-500 text-xl" />
            <span className="font-semibold text-gray-800">Cảnh báo quá tải nhân sự</span>
          </div>
        }
        open={constructionFacade.isShowOverloadDetailModel}
        footer={null}
        onCancel={() => constructionFacade.set({ isShowOverloadDetailModel: false })}
        centered
        width={700}
      >
        <div className="mb-4">
          <p className="text-gray-700 mb-4">Các nhân sự sau đây có thể bị quá tải khi tham gia thêm dự án này:</p>

          <div className="max-h-96 overflow-y-auto">
            {constructionFacade.overloadData?.listEmployeeHasOverloads?.map((employee: any, index: number) => (
              <OverloadEmployeeItem key={employee.employeeId || index} employee={employee} />
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-gray-700 mb-4 font-medium">Bạn có muốn tiếp tục thêm các nhân sự này vào dự án?</p>
          <div className="flex justify-end gap-2">
            <Button onClick={() => constructionFacade.set({ isShowOverloadDetailModel: false })}>Hủy bỏ</Button>
            <Button
              type="primary"
              onClick={() => {
                constructionFacade.set({ isShowOverloadDetailModel: false });
                if (constructionFacade.payloadOnSubmit) {
                  if (id) {
                    constructionFacade.put(constructionFacade.payloadOnSubmit);
                  } else {
                    constructionFacade.post(constructionFacade.payloadOnSubmit);
                  }
                }
              }}
            >
              Tiếp tục
            </Button>
          </div>
        </div>
      </Modal>

      <Spin spinning={constructionFacade.isFormLoading}>
        <div className="h-12 bg-white shadow-header px-4 flex justify-between items-center">
          <Button
            variant="link"
            size="middle"
            onClick={onCancel}
            className="text-neutral-500 p-0 h-fit border-none shadow-none"
            icon={<LeftOutlined />}
          >
            Quay lại
          </Button>
          <Button
            disabled={
              !rightMapRoleFacade.rightDatas?.[0]?.rightCodes?.includes('ADD') ||
              !rightMapRoleFacade.rightDatas?.[0]?.rightCodes?.includes('UPDATE')
            }
            icon={<SaveOutlined />}
            type={'primary'}
            onClick={() => {
              if (
                id &&
                form.getFieldValue('constructionTemplateId') !== constructionFacade.data?.constructionTemplateId
              )
                modal.confirm({
                  title: 'Xác nhận thay đổi template dự án',
                  content:
                    'Bạn có chắc chắn muốn thay đổi template dự án? Điều này đồng nghĩa với việc dữ liệu công việc cũ sẽ bị xóa và thay bằng dữ liệu công việc trong template mới. Thao tác này không thể khôi phục.',
                  okText: 'Xác nhận',
                  cancelText: 'Hủy bỏ',
                  onOk() {
                    form.submit();
                  },
                });
              else form.submit();
            }}
          >
            Lưu lại
          </Button>
        </div>

        <Form form={form} layout={'vertical'} onFinish={onCheckOverloadWarning}>
          <Row gutter={[12, 12]} className={'p-4'}>
            <Col span={24}>
              <Card title={'Thông tin công trình/dự án'} className={'h-full'}>
                <Row gutter={[24, 4]}>
                  <Col xs={8}>
                    <Form.Item
                      name={'code'}
                      label={'Mã công trình/dự án'}
                      tooltip={{
                        title: (
                          <div className="text-[12px] text-center text-black">
                            Mã công trình không trùng lặp. Nếu để trống mã phiếu tự sinh với tiền tố <strong>PN</strong>
                          </div>
                        ),
                        icon: <InfoCircleTwoTone />,
                        color: 'white',
                      }}
                    >
                      <Input placeholder={'Nhập mã công trình/dự án'} />
                    </Form.Item>
                  </Col>
                  <Col xs={16}>
                    <Form.Item
                      name={'name'}
                      label={'Tên công trình/dự án'}
                      rules={[
                        {
                          required: true,
                          message: <span className={'text-sm'}>Tên công trình/dự án không được để trống</span>,
                        },
                      ]}
                    >
                      <Input placeholder={'Nhập mã công trình/dự án'} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={'Loại cấp điện áp'}
                      name={'voltageTypeCode'}
                      rules={[
                        {
                          required: true,
                          message: <span className={'text-sm'}>Loai cấp điện áp không được để trống</span>,
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        optionFilterProp={'label'}
                        placeholder={'Chọn loại cấp điện áp'}
                        options={codeTypeFacade.voltageTypeData?.content?.map((item) => ({
                          value: item.code,
                          label: item.title,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={'Loại chủ đầu tư'}
                      name={'ownerTypeCode'}
                      rules={[
                        {
                          required: true,
                          message: <span className={'text-sm'}>Loại chủ đầu tư không được để trống</span>,
                        },
                      ]}
                    >
                      <Select
                        onChange={(value) => {
                          if (value) {
                            const listItems = investorTypeFacade.pagination?.content?.find(
                              (item) => item?.code === value,
                            )?.investor;

                            constructionFacade.set({
                              listItems: listItems,
                            });

                            form.setFieldsValue({
                              investorId: null,
                            });
                          } else {
                            constructionFacade.set({
                              listItems: [],
                            });

                            form.setFieldsValue({
                              investorId: null,
                            });
                          }
                        }}
                        allowClear
                        showSearch
                        optionFilterProp={'label'}
                        placeholder={'Chọn loại chủ đầu tư'}
                        options={investorTypeFacade.pagination?.content?.map((item) => ({
                          value: item.code,
                          label: item.name,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={'CĐT/BQLDA'}
                      name={'investorId'}
                      rules={[
                        {
                          required: true,
                          message: <span className={'text-sm'}>CĐT/BQLDA không được để trống</span>,
                        },
                      ]}
                    >
                      <Select
                        allowClear
                        disabled={form.getFieldValue('ownerTypeCode') == null}
                        showSearch
                        optionFilterProp={'label'}
                        placeholder={'Chọn CĐT/BQLDA'}
                        options={constructionFacade.listItems?.map((item: any) => ({
                          value: item.id,
                          label: item.name,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={'Người theo dõi'}
                      name={'followers'}
                      rules={[
                        {
                          required: true,
                          validator: (_, value) => {
                            if (constructionFacade?.listPresentArr && constructionFacade?.listPresentArr?.length > 0) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Người theo dõi không được để trống!'));
                          },
                        },
                      ]}
                    >
                      <div className={'flex gap-4'}>
                        {constructionFacade?.listPresentArr?.length > 0 && (
                          <Avatar.Group
                            className={'cursor-pointer'}
                            max={{
                              count: 3,
                              style: { color: '#f56a00', backgroundColor: '#fde3cf' },
                            }}
                          >
                            {constructionFacade?.listPresentArr?.map((item: any) => {
                              return (
                                <Tooltip title={item?.employeeName} placement="top" key={item?.employeeId}>
                                  <Avatar src={item?.employeeAvatarUrl} />
                                </Tooltip>
                              );
                            })}
                          </Avatar.Group>
                        )}

                        <PlusCircleOutlined
                          className={'text-[24px] ml-2 cursor-pointer hover:text-[#1890FF]'}
                          onClick={() =>
                            constructionFacade.set({
                              isChooseUserManyPresentModal: true,
                            })
                          }
                        />
                      </div>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={'Nhân sự tham gia'}
                      name={'participants'}
                      rules={[
                        {
                          required: true,
                          validator: (_, value) => {
                            if (
                              constructionFacade?.listParticipantsArr?.length &&
                              constructionFacade?.listParticipantsArr?.length > 0
                            ) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Nhân sự tham gia không được để trống!'));
                          },
                        },
                      ]}
                    >
                      <div className={'flex gap-4'}>
                        {constructionFacade?.listParticipantsArr?.length > 0 && (
                          <Avatar.Group
                            className={'cursor-pointer'}
                            max={{
                              count: 3,
                              style: { color: '#f56a00', backgroundColor: '#fde3cf' },
                            }}
                          >
                            {constructionFacade?.listParticipantsArr?.map((item: any) => {
                              return (
                                <Tooltip title={item?.employeeName} placement="top" key={item?.employeeId}>
                                  <Avatar src={item?.employeeAvatarUrl} />
                                </Tooltip>
                              );
                            })}
                          </Avatar.Group>
                        )}

                        <PlusCircleOutlined
                          className={'text-[24px] ml-2 cursor-pointer hover:text-[#1890FF]'}
                          onClick={() =>
                            constructionFacade.set({
                              isChooseUserManyParticipantsModal: true,
                            })
                          }
                        />
                      </div>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={'deliveryDate'}
                      label={'Ngày giao A'}
                      rules={[
                        {
                          required: true,
                          message: <span className={'text-sm'}>Ngày giao A không được để trống</span>,
                        },
                      ]}
                    >
                      <DatePicker className={'w-full'} placeholder={'Chọn ngày giao A'} format={'DD/MM/YYYY'} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label={'Độ ưu tiên'} name={'priorityCode'}>
                      <Radio.Group
                        options={[
                          { label: <p className="text-[#FF4D4F] font-semibold">Cấp 1</p>, value: '1' },
                          { label: <p className="text-[#FAAD14] font-semibold">Cấp 2</p>, value: '2' },
                          { label: <p className="text-[#52C41A] font-semibold">Cấp 3</p>, value: '3' },
                        ]}
                        defaultValue="2"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={16}>
              <Card title={'Template dự án'} className="min-h-[375px]">
                <Form.Item name={'constructionTemplateId'} label={'Template dự án'}>
                  <Select
                    onChange={(value) => {
                      if (value) {
                        constructionFacade.set({ isEditTemplateStages: true });

                        if (value != constructionFacade?.data?.constructionTemplateId) {
                          projectTemplateFacade.getById({ id: value });
                        } else {
                          form.setFieldsValue({
                            templateStages: constructionFacade.data?.templateStages?.map((item: TemplateStage) => ({
                              ...item,
                              expiredDate: dayjs(item?.expiredDate) ? dayjs(item?.expiredDate) : dayjs,
                            })),
                          });
                        }
                      } else {
                        constructionFacade.set({ isEditTemplateStages: false });
                      }
                    }}
                    allowClear
                    showSearch
                    optionFilterProp={'label'}
                    placeholder={'Chọn template dự án'}
                    options={projectTemplateFacade.pagination?.content?.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                  />
                </Form.Item>

                {constructionFacade?.isEditTemplateStages && (
                  <Form.List name={'templateStages'}>
                    {(templateStages, { add, remove }) => (
                      <>
                        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
                          <SortableContext
                            items={templateStages.map((i) => i.key)}
                            strategy={verticalListSortingStrategy}
                          >
                            <Table
                              components={{ body: { row: rowTable } }}
                              footer={() => (
                                <Button className="w-full" icon={<PlusOutlined />} onClick={() => add()}>
                                  Thêm giai đoạn
                                </Button>
                              )}
                              dataSource={templateStages}
                              // scroll={{ x: 100, y: 55 * 5 }}
                              pagination={false}
                            >
                              <Table.Column
                                className="!p-0.5"
                                align={'center'}
                                width={28}
                                render={() => <DragHandle />}
                              />
                              <Table.Column
                                className="!p-0.5"
                                title={'STT'}
                                dataIndex={'stepOrder'}
                                align={'center'}
                                width={28}
                                render={(_, __, index) => <p>{index + 1}</p>}
                              />
                              <Table.Column
                                className="!p-2"
                                title="Tên giai đoạn"
                                dataIndex={'name'}
                                width={150}
                                render={(value, record, index) => (
                                  <Form.Item
                                    className="!mb-0"
                                    name={[index, 'name']}
                                    rules={[{ required: true, message: 'Tên giai đoạn là bắt buộc!' }]}
                                  >
                                    <Input autoFocus className="w-full" placeholder="Nhập tên giai đoạn" />
                                  </Form.Item>
                                )}
                              />
                              <Table.Column
                                className="!p-2"
                                title="Mô tả"
                                dataIndex={'description'}
                                width={150}
                                render={(value, record, index) => (
                                  <Form.Item className="!mb-0" name={[index, 'description']}>
                                    <Input className="w-full" placeholder="Nhập mô tả" />
                                  </Form.Item>
                                )}
                              />
                              <Table.Column
                                className="!p-2"
                                title="Hạn dự kiến hoàn thành"
                                dataIndex={'expiredDate'}
                                width={150}
                                render={(value, record, index) => (
                                  <Form.Item
                                    className="!mb-0"
                                    name={[index, 'expiredDate']}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Vui lòng nhập hạn xử lý hoàn thành',
                                      },
                                    ]}
                                  >
                                    <DatePicker
                                      defaultValue={null}
                                      format={'DD/MM/YYYY'}
                                      className="w-full"
                                      placeholder="Chọn hạn dự kiến hoàn thành"
                                    />
                                  </Form.Item>
                                )}
                              />
                              <Table.Column
                                className="!p-2"
                                align="center"
                                dataIndex={'isDone'}
                                width={60}
                                fixed="right"
                                render={(value, record, index) => (
                                  <Space>
                                    {form.getFieldValue('templateStages')[index]?.isDone ? (
                                      <Button
                                        type="link"
                                        disabled
                                        icon={<CloseOutlined className={'cursor-default'} />}
                                      />
                                    ) : (
                                      <ToolTip title={'Xóa'}>
                                        <Button
                                          type="link"
                                          danger
                                          icon={<CloseOutlined />}
                                          onClick={() => {
                                            remove(index);

                                            if (form.getFieldValue('templateStages')?.length === 0) {
                                              constructionFacade.set({
                                                isEditTemplateStages: false,
                                              });
                                              form.setFieldValue('constructionTemplateId', null);
                                            }
                                          }}
                                        />
                                      </ToolTip>
                                    )}
                                  </Space>
                                )}
                              />
                            </Table>
                          </SortableContext>
                        </DndContext>
                      </>
                    )}
                  </Form.List>
                )}
              </Card>
            </Col>
            <Col span={8}>
              <Card title={'Thông tin bổ sung'}>
                <Form.Item name={'statusCode'} label={'Tình trạng dự án'}>
                  <Select
                    defaultValue={'IS_DESIGNING'}
                    optionFilterProp={'label'}
                    showSearch
                    allowClear
                    options={[
                      {
                        value: 'IS_DESIGNING',
                        label: 'Đang thiết kế',
                      },
                      {
                        value: 'AUTHOR_SUPERVISOR',
                        label: 'Giám sát tác giả',
                      },
                    ]}
                    placeholder={'Chọn tình trạng dự án'}
                  />
                </Form.Item>

                <Form.Item name={'executionStatusCode'} label={'Tình hình thực hiện'}>
                  <Select
                    defaultValue={'IN_PROGRESS'}
                    optionFilterProp={'label'}
                    showSearch
                    allowClear
                    options={[
                      {
                        value: 'APPROVED',
                        label: 'Đã phê duyệt',
                      },
                      {
                        value: 'IN_PROGRESS',
                        label: 'Đang thực hiện',
                      },
                    ]}
                    placeholder={'Chọn tình hình thực hiện'}
                  />
                </Form.Item>

                <Form.Item name={'documentStatusCode'} label={'Tình trạng hồ sơ'}>
                  <Select
                    defaultValue={'NOT_APPROVE'}
                    optionFilterProp={'label'}
                    showSearch
                    allowClear
                    options={[
                      {
                        value: 'NOT_APPROVE',
                        label: 'Chưa phê duyệt',
                      },
                      {
                        value: 'APPROVED',
                        label: 'Đã phê duyệt',
                      },
                    ]}
                    placeholder={'Chọn tình trạng hồ sơ'}
                  />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Form>
      </Spin>
      {constructionFacade.isOpenQuickAddressPicker && <AddressPicker form={form} />}
      {constructionFacade.isChooseUserManyParticipantsModal && (
        <UserParticipantsManyModal title={'Chọn nhân sự tham gia'} data={constructionFacade?.listParticipantsArr} />
      )}
      {constructionFacade.isChooseUserManyPresentModal && (
        <UserFollowerManyModal title={'Chọn người theo dõi'} data={constructionFacade?.listPresentArr} />
      )}
    </>
  );
}

export default ConstructionCreateForm;
