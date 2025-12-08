import {
  CheckOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  FileProtectOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  LeftOutlined,
  MailOutlined,
  PlusOutlined,
  RedoOutlined,
  ReloadOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { QueryParams, T_Attachment } from '@models';
import EditorCustom from '@pages/du-an-v2/construction-monitor/RichMentions';
import WeekReportModal from '@pages/du-an-v2/construction-monitor/WeekReport';
import {
  CodeTypeFacade,
  ConstructionActivityLogsViewModel,
  ConstructionFacade,
  contractImplementationStatuses,
  ContractModel,
  EStatusConstruction,
  ExecutionTeamsViewModel,
  GlobalFacade,
  PriorityLevelMap,
  TaskFacade,
  TaskStatusMap,
  TemplateStage,
  VehicleRequestFacade,
  vehicleRequestPriority,
  vehicleRequestStatus,
  VehicleRequestViewModel,
  WeekReportFacade,
  WeekReportViewModel,
} from '@store';
import { lang, rightMapCodeConstruction, routerLinks } from '@utils';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Image,
  List,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Steps,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Link, useSearchParams } from 'react-router-dom';
import { customMessage } from 'src';
import { IssueManagementFacade, IssueModel } from 'src/store/issue-management';
import { RightMapRoleFacade } from 'src/store/right-map-role';
import DocumentInfoIcon from '../../../../public/assets/icon/DocumentInfoIcon';
import { DraggableScrollWrapper } from './components/DraggableScrollWrapper';
import { EmptyState } from './components/EmptyState';
import { getStatusColor } from './components/StatusTag';
import Task from './task';
import { UpdateTemplateStagesModal } from './update-templateStages';
import { formatCurrency } from './utils';

let defaultStartDate: string;
let defaultEndDate: string;
dayjs.extend(isoWeek);

function ConstructionMonitor() {
  const constructionFacade = ConstructionFacade();
  const constructionWeekReportFacade = WeekReportFacade();
  const codeTypeFacade = CodeTypeFacade();
  const weekReportFacade = WeekReportFacade();
  const issueManagementFacade = IssueManagementFacade();
  const taskFacade = TaskFacade();
  const rightMapRoleFacade = RightMapRoleFacade();
  const vehicleRequestFacade = VehicleRequestFacade();

  const { user } = GlobalFacade();

  const location = useLocation();

  const navigate = useNavigate();
  const { id } = useParams();
  const [modalApi, contextModalApi] = Modal.useModal();

  const [searchParams] = useSearchParams();

  const [formFilter] = Form.useForm();
  const [formDialogMessage] = Form.useForm();

  const {
    page,
    size,
    filter = '{}',
    sort = '',
    monitorTabIndex = 0,
  } = {
    ...Object.fromEntries(searchParams),
    page: Number(searchParams.get('page') || 1),
    size: Number(searchParams.get('size') || 20),
  };

  const parsedFilter = JSON.parse(filter);

  useEffect(() => {
    rightMapRoleFacade.getRightMapByListCode(rightMapCodeConstruction);
    constructionFacade.set({
      // activeStep: parsedFilter?.monitorTabIndex || Number(location.state?.indexTemplateStage || 0),
      isOpenWeekReport: false,
    });

    if (location.state) {
      constructionFacade.set({
        activeTab: location.state.isTaskTab ? 'task' : 'monitor',
      });
    } else {
      if (parsedFilter != null) {
        constructionFacade.set({
          activeTab: parsedFilter?.activeTab ?? 'monitor',
        });
      }
    }

    constructionFacade.set({
      activeIssueTab: 'all',
      activeWeekReportTab: 'all',
      activeContractTab: 'all',
      activeVehicleRequest: 'all',
    });

    codeTypeFacade.getOrganizationStructure({ size: -1 });

    // GET API EACH MODULE
    formFilter.setFieldsValue({
      maPhongBan: 'DESIGN_TEAM_PARENT',
    });

    constructionFacade.getExecutionTeamsInConstruction({
      size: -1,
      filter: JSON.stringify({
        constructionId: id,
        maPhongBan: 'DESIGN_TEAM_PARENT',
      }),
    });

    weekReportFacade.get({
      size: -1,
      filter: JSON.stringify({
        constructionId: id,
      }),
    });

    vehicleRequestFacade.get({
      size: -1,
      filter: JSON.stringify({
        projectId: id,
      }),
    });

    issueManagementFacade.get({
      size: -1,
      filter: JSON.stringify({
        constructionId: id,
      }),
    });
    constructionFacade.getTemplateStages(id!);
    return () => {
      constructionFacade.set({ activeTab: undefined });
    };
  }, []);

  useEffect(() => {
    switch (constructionFacade.status) {
      case EStatusConstruction.putDoneStageFulfilled:
        constructionFacade.getById({ id: id });
        break;
    }
  }, [constructionFacade.status]);

  useEffect(() => {
    if (id) {
      constructionFacade.getById({ id: id });
    }
  }, [id]);

  useEffect(() => {
    if (constructionFacade?.data?.templateStages) {
      const getMinStepOrderIndex = (arr: any[]) => {
        return arr?.reduce((minIdx, curr, idx, array) => {
          if (!curr.isDone && (minIdx === -1 || curr.stepOrder < array[minIdx].stepOrder)) {
            return idx;
          }
          return minIdx;
        }, -1);
      };

      const indexTemplate = getMinStepOrderIndex(constructionFacade?.data?.templateStages);

      constructionFacade.set({
        activeStep: indexTemplate,
      });
    }
  }, [constructionFacade?.data?.templateStages]);

  useEffect(() => {
    if (constructionFacade.data?.templateStages && constructionFacade.activeTab !== 'task') {
      onChangeDataTable({
        query: {
          filter: JSON.stringify({
            idTemplateStage: constructionFacade.data?.templateStages?.[constructionFacade.activeStep as number]?.id,
            monitorTabIndex: constructionFacade?.minIndex
              ? constructionFacade?.minIndex
              : (constructionFacade.activeStep ?? 0),
            activeTab: constructionFacade.activeTab ?? 'monitor',
          }),
        },
      });
    }
  }, [constructionFacade.data]);

  const onChangeDataTable = (props: { query?: QueryParams; setKeyState?: object }) => {
    if (!props.query) {
      props.query = {
        page,
        size,
        filter,
        sort,
        monitorTabIndex,
      };
    }
    const fillQuery: QueryParams = { ...taskFacade.query, ...props.query };
    for (const key in fillQuery) {
      if (!fillQuery[key as keyof QueryParams]) delete fillQuery[key as keyof QueryParams];
    }
    taskFacade.getTaskConstruction(fillQuery, id!);
    navigate(
      { search: new URLSearchParams(fillQuery as unknown as Record<string, string>).toString() },
      { replace: true },
    );
    taskFacade.set({ query: props.query, ...props.setKeyState });
  };

  const renderEmptyState = (message: string) => <EmptyState message={message} />;

  const relativeTime = (dateString: string, statusCode: string) => {
    const result = getRelativeTime(dateString, statusCode);
    if (!result) return null;

    return (
      <div className="flex gap-2">
        <Tooltip title={<p>{result.message}</p>}>
          <ExclamationCircleFilled className={`text-${result.type === 'warning' ? 'yellow' : 'red'}-500`} />
        </Tooltip>
      </div>
    );
  };

  const warningRequest = useMemo(() => {
    const today = dayjs().startOf('day');
    return (
      taskFacade.paginationTask?.content
        ?.filter((x) => x.status !== TaskStatusMap.Passed.value && x.status !== TaskStatusMap.Failed.value)
        .reduce(
          (acc, curr) => {
            acc[curr.id] = dayjs(curr.endDateTime).startOf('day').diff(today, 'day');
            return acc;
          },
          {} as Record<string, number>,
        ) ?? {}
    );
  }, [taskFacade.paginationTask?.content]);

  const warningRequestVehicleRequest = useMemo(() => {
    const today = dayjs().startOf('day');
    return (
      vehicleRequestFacade.pagination?.content.reduce(
        (acc, curr) => {
          acc[curr.id] = dayjs(curr.endDateTime).startOf('day').diff(today, 'day');
          return acc;
        },
        {} as Record<string, number>,
      ) ?? {}
    );
  }, [vehicleRequestFacade.pagination?.content]);

  const getRelativeTime = (dateString: string, statusCode: string) => {
    const now = new Date();
    const date = new Date(dateString);

    // Đặt lại giờ, phút, giây về 00:00:00
    now.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // Sắp đến hạn (còn 3 ngày)
    if (diffInDays === 3 || diffInDays === 1 || (diffInDays === 2 && statusCode !== 'COMPLETED')) {
      return {
        message: 'Sắp đến hạn',
        type: 'warning',
      };
    }

    // Đến hạn (hôm nay)
    if (diffInDays === 0 && statusCode !== 'COMPLETED') {
      return {
        message: 'Đến hạn',
        type: 'warning',
      };
    }

    // Quá hạn (đã trễ X ngày)
    if (diffInDays < 0 && statusCode !== 'COMPLETED') {
      return {
        message: `Quá hạn ${Math.abs(diffInDays)} ngày`,
        type: 'warning',
      };
    }

    return null;
  };

  const handleExportFile = () => {
    const filter = JSON.stringify({
      constructionId: id,
    });

    constructionWeekReportFacade.exportListToExcel({
      size: -1,
      filter: JSON.parse(filter),
    });
  };

  const getBeforeWeekNumber = (dateRange: string[] | any) => {
    const baseDate = dayjs(dateRange[0]); // Ngày bắt đầu để làm chuẩn
    return <span>{baseDate.subtract(1, 'week').isoWeek()}</span>;
  };

  const getAfterWeekNumber = (dateRange: string[] | any) => {
    const baseDate = dayjs(dateRange[0]); // Ngày bắt đầu để làm chuẩn
    return <span>{baseDate.add(1, 'week').isoWeek()}</span>;
  };

  const handleDelete = (id: string) => {
    modalApi.confirm({
      width: 600,
      title: `Bạn chắc chắn muốn xóa công trình/dự án này?`,
      content: 'Thao tác này sẽ xóa công trình/dự án bạn đã chọn. Thao tác này không thể khôi phục.',
      onOk: () => {
        id && constructionFacade.delete(id);
      },
      onCancel: () => {},
      okText: 'Xác nhận',
      okButtonProps: { type: 'primary', danger: true },
      cancelText: 'Thoát',
      cancelButtonProps: { type: 'default', danger: true },
      closable: true,
    });
  };

  const renderPriorityText = (statusCode: string) => {
    switch (statusCode) {
      case 'MEDIUM':
        return 'Trung bình';
      case 'LOW':
        return 'Thấp';
      case 'HIGH':
        return 'Cao';
    }
  };

  const renderPriorityColor = (statusCode: string) => {
    switch (statusCode) {
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      case 'HIGH':
        return 'error';
    }
  };

  const renderColorPriority = (priorityCode: string) => {
    switch (priorityCode) {
      case '1':
        return '#FF4D4F';
      case '2':
        return '#FAAD14';
      case '3':
        return '#52C41A';
    }
  };

  const groupByDepartment = (executionTeams: any) => {
    const result: any = {};

    executionTeams
      ?.filter((x: any) => x.toThucHien !== null)
      .forEach((member: any) => {
        const teamTitle = member.toThucHien?.title || null;
        const position = member.chucVu?.tenChucVu || 'Other position';

        if (!result[teamTitle]) {
          result[teamTitle] = {
            teams: [],
          };
        }

        // Belongs to a team
        if (!result[teamTitle].teams) {
          result[teamTitle].teams = [];
        }
        result[teamTitle].teams?.push({
          ...member,
          position,
        });
      });

    return result;
  };

  // Hàm so sánh ngày hiện tại với ngày tạo
  const getRelativeTimeReference = (dateString: string) => {
    const now: any = new Date(); // Ngày hiện tại
    const date: any = new Date(dateString); // Chuyển chuỗi thành Date

    // Đặt lại giờ, phút, giây về 00:00:00
    now.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    // Tính số mili giây giữa hai ngày
    const diffInMs = now.getTime() - date.getTime();

    // Chuyển đổi mili giây sang số ngày
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return (
        <Badge
          count={
            <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-[1px] rounded-full leading-none">
              TODAY
            </span>
          }
        />
      );
    }

    return <div />;
  };

  const renderStatusColor = (statusCode: string) => {
    switch (statusCode) {
      case 'RIGHT_ON_PLAN':
        return 'success';
      case 'BEHIND_SCHEDULE':
        return 'error';
      case 'OVER_SCHEDULE':
        return 'cyan';
    }
  };

  const stripPTags = (html: string) => html?.replace(/^<p>/, '').replace(/<\/p>$/, '');

  const navigateLink = (actionType: string, orderId: string) => {
    switch (actionType) {
      case 'CONTRACT':
        return `/${lang}${routerLinks('Contract')}/${orderId}`;
      case 'ISSUE_MANAGEMENT':
        return `/${lang}${routerLinks('IssueManagement')}/${orderId}/detail`;
      case 'TASK':
        return `/${lang}${routerLinks('Task')}/${id}/edit-view/${orderId}`;
    }
  };

  return (
    <Spin spinning={constructionFacade.isFormLoading}>
      {contextModalApi}
      <div className="h-12 bg-white shadow-header px-4 flex justify-between items-center">
        <Button
          variant="link"
          size="middle"
          onClick={() => {
            if (location.key === 'default') navigate(`/${lang}${routerLinks('Construction')}`);
            else navigate(-1);
          }}
          className="text-neutral-500 p-0 h-fit border-none shadow-none"
          icon={<LeftOutlined />}
        >
          Quay lại
        </Button>
      </div>

      <div className={'py-3 px-6'}>
        <div className={'flex justify-between'}>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                constructionFacade.set({ activeTab: 'monitor' });
                onChangeDataTable({
                  query: {
                    page: 1,
                    filter: JSON.stringify({
                      idTemplateStage:
                        constructionFacade.data?.templateStages?.[constructionFacade?.activeStep as number]?.id,
                      activeTab: 'monitor',
                      monitorTabIndex: constructionFacade?.activeStep ?? 0,
                    }),
                  },
                });
              }}
              className={`px-4 py-2 rounded border-none ${
                constructionFacade?.activeTab === 'monitor' ? 'bg-white text-[#1890FF] font-semibold' : 'text-gray-600'
              }`}
            >
              Monitor
            </Button>
            <Button
              onClick={() => {
                constructionFacade.set({ activeTab: 'task' });
              }}
              className={`px-4 py-2 rounded border-none ${
                constructionFacade?.activeTab === 'task' ? 'bg-white text-[#1890FF] font-semibold' : 'text-gray-600'
              }`}
            >
              Công việc
            </Button>
          </div>
          <div className={'flex gap-2'}>
            {constructionFacade?.activeTab === 'task' && (
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  constructionFacade.set({ isUpdateTemplateStagesModal: true });
                }}
              >
                Chỉnh sửa giai đoạn
              </Button>
            )}
            {/* nChange={(priorityLevel) => {
                onChangeDataTable({
                  query: {
                    page: 1,
                    size,
                    filter: JSON.stringify({ ...JSON.parse(filter), priorityLevel }),
                  },
                }); */}
            <Button
              icon={<ReloadOutlined />}
              loading={constructionFacade.isFormLoading}
              onClick={() => {
                if (constructionFacade.activeTab === 'task')
                  taskFacade.getTaskConstruction({ page, size, filter }, id!);
                else
                  constructionFacade.getById({
                    id,
                  });
              }}
            >
              Tải lại
            </Button>
            {constructionFacade?.activeTab !== 'task' &&
              (!rightMapRoleFacade?.rightDatas?.[0]?.rightCodes?.includes('DELETE') ? (
                <Tooltip title="Bạn không có quyền thực hiện thao tác này">
                  <Button
                    disabled={true}
                    onClick={() => {
                      handleDelete(id as string);
                    }}
                    icon={<DeleteOutlined />}
                    variant={'outlined'}
                    danger
                  >
                    Xoá công trình/dự án
                  </Button>
                </Tooltip>
              ) : (
                <Button
                  onClick={() => {
                    handleDelete(id as string);
                  }}
                  icon={<DeleteOutlined />}
                  variant={'outlined'}
                  danger
                >
                  Xoá công trình/dự án
                </Button>
              ))}
          </div>
        </div>

        <div className={classNames('flex justify-between mt-4', { hidden: constructionFacade?.activeTab === 'task' })}>
          <div>
            <div className="flex gap-3 items-center">
              <Typography.Title
                className="line-clamp-2 overflow-hidden text-ellipsis whitespace-normal max-w-[700px]"
                level={2}
                style={{ margin: 4 }}
              >
                {constructionFacade.data?.name}
              </Typography.Title>

              <Tag className="rounded-full mx-0" color={getStatusColor(constructionFacade?.data?.statusCode || '')}>
                {constructionFacade?.data?.statusName}
              </Tag>
            </div>

            <div className={'flex gap-1 items-center'}>
              <Typography.Title level={5} style={{ margin: 4 }}>
                {constructionFacade.data?.code}{' '}
              </Typography.Title>
              <Tag className="rounded-full mx-0" color={constructionFacade.data?.voltage?.description}>
                {constructionFacade.data?.voltage?.title}
              </Tag>
              {''}

              <Tag className="rounded-full mx-0" color={renderColorPriority(constructionFacade.data?.priorityCode)}>
                {constructionFacade.data?.priorityName}
              </Tag>
            </div>

            <div className={'flex gap-1 items-center'}>
              <Typography.Title level={4} style={{ margin: 4, color: '#1890FF' }}>
                {constructionFacade.data?.investor?.name}
              </Typography.Title>
              <Typography.Title level={5} style={{ margin: 4, color: 'rgba(0, 0, 0, 0.45)' }}>
                {constructionFacade.data?.investor?.investorType?.name}
              </Typography.Title>
            </div>
          </div>

          <div className={'space-x-3.5'}>
            {constructionFacade.data?.constructionAttachments?.map((item: T_Attachment) => (
              <Image
                className={'shadow-[3px_3px_6px_rgb(168,168,168)] rounded'}
                width={100}
                height={100}
                key={item.id}
                src={item.fileUrl}
                fallback={'/assets/images/no-image.png'}
              />
            ))}
          </div>
        </div>
        {constructionFacade?.activeTab === 'monitor' && (
          <Row gutter={[8, 8]} className={'mt-4'}>
            <Col xs={16}>
              <Row gutter={[8, 8]}>
                <Col xs={24}>
                  <Card
                    bodyStyle={{ padding: '16px' }}
                    className={'w-full'}
                    title={
                      <div className={'flex justify-between items-center'}>
                        <div className="flex gap-4 items-center">
                          <InfoCircleOutlined className={'text-[24px]'} />
                          <p className={'text-[14px]'}>Thông tin chung</p>
                        </div>
                        {!rightMapRoleFacade.rightDatas?.[0]?.rightCodes?.includes('UPDATE') ? (
                          <Tooltip title="Bạn không có quyền thực hiện thao tác này">
                            <Button
                              disabled={true}
                              color={'primary'}
                              variant={'outlined'}
                              icon={<EditOutlined />}
                              onClick={() => {
                                navigate(`/${lang}${routerLinks('Construction')}/${constructionFacade.data?.id}/edit`);
                                constructionFacade.set({
                                  listParticipantsArr: [],
                                  listPresentArr: [],
                                  listPresent: [],
                                  listParticipants: [],
                                  checkedListParticipants: [],
                                  checkedListPresent: [],
                                });
                              }}
                            >
                              Cập nhật
                            </Button>
                          </Tooltip>
                        ) : (
                          <Button
                            color={'primary'}
                            variant={'outlined'}
                            icon={<EditOutlined />}
                            onClick={() => {
                              navigate(`/${lang}${routerLinks('Construction')}/${constructionFacade.data?.id}/edit`);
                              constructionFacade.set({
                                listParticipantsArr: [],
                                listPresentArr: [],
                                listPresent: [],
                                listParticipants: [],
                                checkedListParticipants: [],
                                checkedListPresent: [],
                              });
                            }}
                          >
                            Cập nhật
                          </Button>
                        )}
                      </div>
                    }
                  >
                    <Descriptions
                      column={2}
                      colon={false}
                      size="small"
                      contentStyle={{ display: 'flex', alignItems: 'center' }}
                      labelStyle={{ width: '180px', paddingRight: '8px', color: 'rgba(0, 0, 0, 0.45)' }}
                    >
                      <Descriptions.Item label="Ngày giao A">
                        <span>
                          : {''} {dayjs(constructionFacade.data?.deliveryDate).format('DD/MM/YYYY') ?? '---'}
                        </span>
                      </Descriptions.Item>

                      <Descriptions.Item label="Tình hình thực hiện">
                        <span>
                          :{'  '}
                          {constructionFacade.data?.executionStatusCode ? (
                            <Tag
                              className="rounded-full mx-0"
                              color={getStatusColor(constructionFacade.data.executionStatusCode || '')}
                            >
                              {constructionFacade.data.executionStatusName}
                            </Tag>
                          ) : (
                            <Typography.Text>-</Typography.Text>
                          )}
                        </span>
                      </Descriptions.Item>

                      <Descriptions.Item label={<span className="pt-1">Người theo dõi</span>}>
                        <div className="flex items-start gap-1">
                          <span className="pt-1">:</span>
                          <Avatar.Group
                            className="cursor-pointer"
                            max={{
                              count: 3,
                              style: { color: '#f56a00', backgroundColor: '#fde3cf' },
                            }}
                          >
                            {constructionFacade?.data?.executionTeams
                              ?.filter((x: ExecutionTeamsViewModel) => x.userType === 'follower')
                              ?.map((item: ExecutionTeamsViewModel) => (
                                <Tooltip title={item?.employeeName} placement="top" key={item?.employeeId}>
                                  <Avatar src={item?.employeeAvatarUrl} />
                                </Tooltip>
                              ))}
                          </Avatar.Group>
                        </div>
                      </Descriptions.Item>

                      <Descriptions.Item label="TT vướng mắc">
                        <span>
                          :{'  '}
                          {constructionFacade?.data?.isHasIssue ? (
                            <Tag className="rounded-full mx-0" color="red">
                              Có vướng mắc
                            </Tag>
                          ) : (
                            <Tag className="rounded-full mx-0" color="green">
                              Không vướng mắc
                            </Tag>
                          )}
                        </span>
                      </Descriptions.Item>

                      <Descriptions.Item label={<span className="pt-1">Nhân sự tham gia</span>}>
                        <div className="flex items-start gap-1">
                          <span className="pt-1">:</span>
                          <Avatar.Group
                            className="cursor-pointer"
                            max={{
                              count: 3,
                              style: { color: '#f56a00', backgroundColor: '#fde3cf' },
                            }}
                          >
                            {constructionFacade?.data?.executionTeams
                              ?.filter((x: ExecutionTeamsViewModel) => x.userType === 'participants')
                              ?.map((item: ExecutionTeamsViewModel) => (
                                <Tooltip title={item?.employeeName} placement="top" key={item?.employeeId}>
                                  <Avatar src={item?.employeeAvatarUrl} />
                                </Tooltip>
                              ))}
                          </Avatar.Group>
                        </div>
                      </Descriptions.Item>

                      <Descriptions.Item label="Tình trạng hồ sơ">
                        <span>
                          :{'  '}
                          {constructionFacade?.data?.documentStatusCode ? (
                            <Tag
                              className="rounded-full mx-0"
                              color={getStatusColor(constructionFacade?.data?.documentStatusCode || '')}
                            >
                              {constructionFacade?.data?.documentStatusName}
                            </Tag>
                          ) : (
                            <Typography.Text>-</Typography.Text>
                          )}
                        </span>
                      </Descriptions.Item>

                      {/* <Descriptions.Item label="Tiến độ HT theo CĐT">
                        <span className="truncate">: {constructionFacade.data?.completionByInvestor ?? '---'}</span>
                      </Descriptions.Item>

                      <Descriptions.Item label="Tiến độ HT theo XNTV">
                        <span className="truncate">: {constructionFacade.data?.completionByCompany ?? '---'}</span>
                      </Descriptions.Item> */}
                    </Descriptions>
                  </Card>
                </Col>
                <Col xs={24}>
                  <Card
                    bodyStyle={{ padding: '10px' }}
                    className={'h-[580px]'}
                    title={
                      <div className={'flex justify-between items-center'}>
                        <div className="flex gap-4 items-center">
                          <ToolOutlined className={'text-[24px]'} />
                          <p className={'text-[14px]'}>Công việc</p>
                        </div>
                        <div className="flex items-center gap-4">
                          {constructionFacade.data?.templateStages?.[constructionFacade.activeStep || 0]
                            ?.expiredDate && (
                            <p className="text-[#FF4D4F] text-[14px]">
                              Hạn thực hiện:{' '}
                              {dayjs(
                                constructionFacade.data?.templateStages?.[constructionFacade.activeStep || 0]
                                  ?.expiredDate,
                              ).format('DD/MM/YYYY')}
                            </p>
                          )}

                          {!rightMapRoleFacade.rightDatas?.[0]?.rightCodes?.includes('UPDATETASK') ? (
                            <Tooltip title="Bạn không có quyền thực hiện thao tác này">
                              <Button
                                disabled={
                                  Number(constructionFacade.data?.templateStages?.length) === 0 ||
                                  !rightMapRoleFacade.rightData?.rightCodes?.includes('UPDATETASK')
                                }
                                icon={
                                  constructionFacade.data?.templateStages?.[constructionFacade.activeStep || 0]
                                    ?.isDone ? (
                                    <RedoOutlined />
                                  ) : (
                                    <CheckOutlined />
                                  )
                                }
                                type={
                                  constructionFacade.data?.templateStages?.[constructionFacade.activeStep || 0]?.isDone
                                    ? 'default'
                                    : 'primary'
                                }
                                className="my-1.5"
                                onClick={() => {
                                  constructionFacade.putDoneStage(
                                    id!,
                                    constructionFacade.data?.templateStages?.[constructionFacade.activeStep || 0]?.id ||
                                      '',
                                  );
                                }}
                              >
                                <p>
                                  Hạn thực hiện:{' '}
                                  {
                                    constructionFacade.data?.templateStages?.[constructionFacade.activeStep || 0]
                                      ?.expiredDate
                                  }
                                </p>
                                {constructionFacade.data?.templateStages?.[constructionFacade.activeStep || 0]?.isDone
                                  ? 'Đánh dấu chưa hoàn thành'
                                  : 'Đánh dấu hoàn thành'}
                              </Button>
                            </Tooltip>
                          ) : (
                            <Button
                              disabled={Number(constructionFacade.data?.templateStages?.length) === 0}
                              icon={
                                constructionFacade.data?.templateStages?.[constructionFacade.activeStep || 0]
                                  ?.isDone ? (
                                  <RedoOutlined />
                                ) : (
                                  <CheckOutlined />
                                )
                              }
                              type={
                                constructionFacade.data?.templateStages?.[constructionFacade.activeStep || 0]?.isDone
                                  ? 'default'
                                  : 'primary'
                              }
                              className="my-1.5"
                              onClick={() => {
                                constructionFacade.putDoneStage(
                                  id!,
                                  constructionFacade.data?.templateStages?.[constructionFacade.activeStep || 0]?.id ||
                                    '',
                                );
                              }}
                            >
                              {constructionFacade.data?.templateStages?.[constructionFacade.activeStep || 0]?.isDone
                                ? 'Đánh dấu chưa hoàn thành'
                                : 'Đánh dấu hoàn thành'}
                            </Button>
                          )}
                        </div>
                      </div>
                    }
                  >
                    <DraggableScrollWrapper>
                      <Steps
                        type="navigation"
                        onChange={(index) => {
                          constructionFacade.set({ activeStep: index });
                          onChangeDataTable({
                            query: {
                              page: 1,
                              filter: JSON.stringify({
                                idTemplateStage: constructionFacade.data?.templateStages?.[index]?.id,
                                monitorTabIndex: index,
                              }),
                            },
                          });
                        }}
                        current={constructionFacade?.activeStep == undefined ? -1 : constructionFacade?.activeStep}
                        items={constructionFacade.data?.templateStages?.map((item: TemplateStage, index: number) => ({
                          title: item.name,
                          status: item?.isDone
                            ? 'finish'
                            : constructionFacade?.activeStep == index
                              ? 'process'
                              : 'wait',
                          className: 'px-4 py-2 ml-1 mr-4',
                        }))}
                        style={{ width: 'max-content', padding: '0 5px' }}
                      />
                    </DraggableScrollWrapper>

                    {(taskFacade.paginationTask?.content?.length as number) > 0 ? (
                      <>
                        <div className="h-[430px] overflow-y-auto miniScroll">
                          {taskFacade.paginationTask?.content?.map((item, index) => (
                            <Card
                              onClick={() => navigate(`/${lang}${routerLinks('Task')}/${id}/edit-view/${item.id}`)}
                              key={index}
                              bodyStyle={{ padding: '10px' }}
                              size="small"
                              className="mb-4 shadow-md rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <p className="truncate">{item?.name}</p>
                                <Tag className="rounded-full mx-0" color={TaskStatusMap[item?.status]?.color}>
                                  {TaskStatusMap[item.status]?.label}
                                </Tag>
                              </div>

                              <div className="flex justify-between items-center mb-2">
                                <Link
                                  className="hover:underline"
                                  to={`/${lang}${routerLinks('Task')}/${id}/edit-view/${item.id}`}
                                >
                                  {item?.code}
                                </Link>

                                {item?.startDateTime && item?.endDateTime ? (
                                  <div className="flex gap-2">
                                    {warningRequest[item.id] != null && warningRequest[item.id] <= 3 && (
                                      <Tooltip
                                        title={
                                          warningRequest[item.id] > 0
                                            ? 'Công việc sắp đến hạn thực hiện'
                                            : warningRequest[item.id] === 0
                                              ? 'Công việc đã đến hạn thực hiện'
                                              : `Công việc đã quá hạn thực hiện ${warningRequest[item.id] * -1} ngày`
                                        }
                                      >
                                        <ExclamationCircleFilled
                                          className={warningRequest[item.id] > 0 ? 'text-yellow-500' : 'text-red-500'}
                                        />
                                      </Tooltip>
                                    )}
                                    <p>{`${dayjs(item?.startDateTime).format('DD/MM/YYYY')} - ${dayjs(item?.endDateTime).format('DD/MM/YYYY')}`}</p>
                                  </div>
                                ) : (
                                  <p>---</p>
                                )}
                              </div>

                              <div className="flex justify-between items-center mb-2">
                                <div className="flex gap-2">
                                  <div>
                                    {(item?.approvers?.length as number) > 0 ? (
                                      <Avatar.Group
                                        className={'cursor-pointer'}
                                        max={{
                                          count: 3,
                                          style: { color: '#f56a00', backgroundColor: '#fde3cf' },
                                        }}
                                      >
                                        {item?.approvers?.map((items) => (
                                          <Tooltip title={items?.idm_User?.name} placement="top" key={items?.id}>
                                            <Avatar src={items?.idm_User?.avatarUrl} />
                                          </Tooltip>
                                        ))}
                                      </Avatar.Group>
                                    ) : (
                                      <p>---</p>
                                    )}
                                  </div>

                                  <div>
                                    {(item?.executors?.length as number) > 0 ? (
                                      <Avatar.Group
                                        className={'cursor-pointer'}
                                        max={{
                                          count: 3,
                                          style: { color: '#f56a00', backgroundColor: '#fde3cf' },
                                        }}
                                      >
                                        {item?.executors?.map((items) => (
                                          <Tooltip title={items?.idm_User?.name} placement="top" key={items?.id}>
                                            <Avatar src={items?.idm_User?.avatarUrl} />
                                          </Tooltip>
                                        ))}
                                      </Avatar.Group>
                                    ) : (
                                      <p>---</p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex gap-2 items-center">
                                  <Badge
                                    color={PriorityLevelMap[item?.priorityLevel as string]?.color}
                                    text={PriorityLevelMap[item?.priorityLevel as string]?.label}
                                  />

                                  {`(${item?.subTasks?.filter((task) => task.isCompleted)?.length}/${item?.subTasks?.length})`}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </>
                    ) : (
                      renderEmptyState('Chưa có công việc')
                    )}
                  </Card>
                </Col>
                <Col xs={24}>
                  <Card
                    bodyStyle={{ padding: '16px' }}
                    className={'h-[800px]'}
                    title={
                      <div className={'flex justify-between items-center'}>
                        <div className="flex gap-4 items-center">
                          <DocumentInfoIcon />
                          <p className={'text-[14px]'}>Báo cáo công việc</p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            icon={<DownloadOutlined />}
                            onClick={handleExportFile}
                            variant={'outlined'}
                            color={'primary'}
                          >
                            Xuất file
                          </Button>
                          <Button
                            type={'primary'}
                            icon={<PlusOutlined />}
                            onClick={() =>
                              constructionFacade.set({
                                isOpenWeekReport: true,
                                weekReportId: undefined,
                              })
                            }
                          >
                            Thêm mới
                          </Button>
                        </div>
                      </div>
                    }
                  >
                    <div className="inline-flex space-x-2 mb-2">
                      <Button
                        className={`rounded-full border ${
                          constructionFacade?.activeWeekReportTab === 'all'
                            ? 'bg-sky-100 text-[#1890FF] border-[#1890FF]'
                            : 'bg-white text-black '
                        }`}
                        shape="round"
                        onClick={() => {
                          constructionFacade.set({ activeWeekReportTab: 'all' });
                          weekReportFacade.get({
                            size: -1,
                            filter: JSON.stringify({
                              constructionId: id,
                            }),
                          });
                        }}
                      >
                        <p className={'text-[12px]'}>Tất cả</p>
                      </Button>
                      <Button
                        className={`rounded-full border ${
                          constructionFacade?.activeWeekReportTab === 'today'
                            ? 'bg-sky-100 text-[#1890FF] border-[#1890FF]'
                            : 'bg-white text-black '
                        }`}
                        shape="round"
                        onClick={() => {
                          defaultStartDate = dayjs().startOf('isoWeek').format('YYYY-MM-DD');
                          defaultEndDate = dayjs().endOf('isoWeek').format('YYYY-MM-DD');

                          constructionFacade.set({ activeWeekReportTab: 'today' });

                          weekReportFacade.get({
                            size: -1,
                            filter: JSON.stringify({
                              constructionId: id,
                              dateRange: [defaultStartDate, defaultEndDate],
                            }),
                          });
                        }}
                      >
                        <p className={'text-[12px]'}>Tuần này</p>
                      </Button>
                    </div>

                    <div className={'h-[650px] overflow-y-auto miniScroll'}>
                      {weekReportFacade.pagination?.content?.length
                        ? weekReportFacade.pagination?.content?.map((item: WeekReportViewModel, index: number) => (
                            <div
                              key={index}
                              className={
                                'mt-2 mr-4 mb-4 shadow-md rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer'
                              }
                            >
                              <Card
                                onClick={() => {
                                  constructionFacade.set({
                                    isOpenWeekReport: true,
                                    weekReportId: item?.id,
                                  });
                                }}
                              >
                                <div className={'flex justify-between items-center'}>
                                  <p className={'font-[500] text-[18px]'}>{item?.title}</p>
                                  <Tag
                                    className="rounded-full px-3.5 py-0.5 mr-0"
                                    color={renderStatusColor(item?.statusCode as string)}
                                  >
                                    {item?.statusName}
                                  </Tag>
                                </div>
                                <div className={'flex justify-between items-center mt-2'}>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Link className={'font-[500] text-[14px]'} to={''}>
                                      {item?.code}
                                    </Link>{' '}
                                    {getRelativeTimeReference(item?.createdOnDate)}
                                  </div>

                                  {item?.startDate && item?.endDate && (
                                    <p>{`${dayjs(item?.startDate).format('DD/MM/YYYY')} - ${dayjs(item?.endDate).format('DD/MM/YYYY')}`}</p>
                                  )}
                                </div>

                                <Space direction={'vertical'} className={'mt-4'}>
                                  <p className={'font-bold text-[14px]'}>
                                    Kế hoạch tuần {getBeforeWeekNumber([item?.startDate, item?.endDate])}:
                                  </p>
                                  <p dangerouslySetInnerHTML={{ __html: item?.lastWeekPlan as string }} />
                                  <p className={'font-bold text-[14px]'}>Kết quả thực hiện:</p>
                                  <p dangerouslySetInnerHTML={{ __html: item?.processResult as string }} />
                                  <p className={'font-bold text-[14px]'}>
                                    Kế hoạch tuần {getAfterWeekNumber([item?.startDate, item?.endDate])}:
                                  </p>
                                  <p dangerouslySetInnerHTML={{ __html: item?.nextWeekPlan as string }} />
                                </Space>

                                {(item?.fileAttachments?.length as number) > 0 && (
                                  <div className={'mt-2'}>
                                    <p className={'font-bold text-[14px]'}>File đính kèm:</p>
                                    {item?.fileAttachments?.map((file: any) => (
                                      <div className={'flex gap-2 items-center text-center mt-2'} key={file?.id}>
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
                                          onClick={(e) => {
                                            e.stopPropagation();
                                          }}
                                          className={'text-base'}
                                          target="_blank"
                                          rel="noreferrer"
                                          href={file?.fileUrl ? file?.fileUrl : ''}
                                        >
                                          {file?.fileName}
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </Card>
                            </div>
                          ))
                        : renderEmptyState('Chưa có báo cáo công việc')}
                    </div>
                  </Card>
                </Col>
                <Col xs={12}>
                  <Card
                    bodyStyle={{ padding: '16px' }}
                    className={'h-full'}
                    title={
                      <div className="flex gap-4">
                        <InfoCircleOutlined className={'text-[24px]'} />
                        <p className={'text-[14px]'}>Vướng mắc</p>
                      </div>
                    }
                    extra={
                      !rightMapRoleFacade.rightDatas?.[0]?.rightCodes?.includes('ADDISSUE') ? (
                        <Tooltip title="Bạn không có quyền thực hiện thao tác này">
                          <Button
                            disabled={true}
                            type={'primary'}
                            icon={<PlusOutlined />}
                            href={`#/${lang}${routerLinks('IssueManagement')}/create`}
                            onClick={() =>
                              navigate(`/${lang}${routerLinks('IssueManagement')}/create`, {
                                state: {
                                  constructionId: id,
                                },
                              })
                            }
                          >
                            Thêm mới
                          </Button>
                        </Tooltip>
                      ) : (
                        <Button
                          type={'primary'}
                          icon={<PlusOutlined />}
                          href={`#/${lang}${routerLinks('IssueManagement')}/create`}
                          onClick={() =>
                            navigate(`/${lang}${routerLinks('IssueManagement')}/create`, {
                              state: {
                                constructionId: id,
                              },
                            })
                          }
                        >
                          Thêm mới
                        </Button>
                      )
                    }
                  >
                    <div className="inline-flex space-x-2">
                      <Button
                        className={`rounded-full border ${
                          constructionFacade?.activeIssueTab === 'all'
                            ? 'bg-sky-100 text-[#1890FF] border-[#1890FF]'
                            : 'bg-white text-black '
                        }`}
                        shape="round"
                        onClick={() => {
                          constructionFacade.set({ activeIssueTab: 'all' });
                          issueManagementFacade.get({
                            size: -1,
                            filter: JSON.stringify({
                              constructionId: id,
                            }),
                          });
                        }}
                      >
                        <p className={'text-[12px]'}>Tất cả</p>
                      </Button>
                      <Button
                        className={`rounded-full border ${
                          constructionFacade?.activeIssueTab === 'today'
                            ? 'bg-sky-100 text-[#1890FF] border-[#1890FF]'
                            : 'bg-white text-black '
                        }`}
                        shape="round"
                        onClick={() => {
                          defaultStartDate = dayjs().startOf('isoWeek').format('YYYY-MM-DD');
                          defaultEndDate = dayjs().endOf('isoWeek').format('YYYY-MM-DD');

                          constructionFacade.set({ activeIssueTab: 'today' });

                          issueManagementFacade.get({
                            size: -1,
                            filter: JSON.stringify({
                              constructionId: id,
                              dateRange: [defaultStartDate, defaultEndDate],
                            }),
                          });
                        }}
                      >
                        <p className={'text-[12px]'}>Tuần này</p>
                      </Button>
                    </div>

                    <div className={'mt-4 h-[520px] overflow-y-auto miniScroll'}>
                      {issueManagementFacade?.pagination?.content?.length
                        ? issueManagementFacade?.pagination?.content.map((item: IssueModel, index: number) => (
                            <Card
                              onClick={() => navigate(`/${lang}${routerLinks('IssueManagement')}/${item?.id}/detail`)}
                              key={index}
                              size="small"
                              className="mb-4 shadow-md rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer"
                            >
                              <div className={'flex justify-between items-center'}>
                                <p className={'font-[500] w-44 truncate'}>{item?.content}</p>
                                <div className="flex gap-1">
                                  <Tag
                                    className="rounded-full px-3.5 py-0.5 mr-0"
                                    color={getStatusColor(item?.status || '')}
                                  >
                                    {(item.status === 'COMPLETED' && 'Đã xử lý') ||
                                      (item.status === 'WAIT_PROCESSING' && 'Chờ xử lý') ||
                                      (item.status === 'CANCELED' && 'Đã huỷ')}
                                  </Tag>
                                </div>
                              </div>
                              <div className={'flex justify-between items-center mt-4'}>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Link to={`/${lang}${routerLinks('ChiPhi')}/${item?.id}/edit`}>
                                    {item?.code ? (
                                      <Typography.Text>
                                        {
                                          <Link to={`/${lang}${routerLinks('Contract')}/${item?.id}/detail`}>
                                            {item?.code}
                                          </Link>
                                        }
                                      </Typography.Text>
                                    ) : (
                                      <Typography.Text>{'-'}</Typography.Text>
                                    )}
                                  </Link>{' '}
                                  {getRelativeTimeReference(item?.createdOnDate)}
                                </div>

                                <div className={'flex gap-2'}>
                                  {relativeTime(item?.expiryDate as string, item?.statusCode as string)}
                                  {dayjs(item?.expiryDate).format('DD/MM/YYYY')}
                                </div>
                              </div>
                              <div className={'flex justify-between items-center mt-4'}>
                                <p className="line-clamp-2 max-w-[200px]">
                                  {item?.user?.name} - {item?.user?.phongBan?.title}
                                </p>
                                {item?.priorityLevel ? (
                                  <Badge
                                    status={renderPriorityColor(item?.priorityLevel as string)}
                                    text={renderPriorityText(item?.priorityLevel as string)}
                                  />
                                ) : (
                                  <Typography.Text>{'-'}</Typography.Text>
                                )}
                              </div>
                            </Card>
                          ))
                        : renderEmptyState('Chưa có vướng mắc')}
                    </div>
                  </Card>
                </Col>
                <Col xs={12}>
                  <Card
                    bodyStyle={{ padding: '16px' }}
                    className={'h-full'}
                    title={
                      <div className="flex gap-4">
                        <FileProtectOutlined className={'text-[24px]'} />
                        <p className={'text-[14px]'}>Hợp đồng</p>
                      </div>
                    }
                    extra={
                      !user?.rights?.includes('CONTRACT.ADD') ? (
                        <Tooltip title="Bạn không có quyền thực hiện thao tác này">
                          <Button
                            disabled={true}
                            type={'primary'}
                            icon={<PlusOutlined />}
                            href={`#/${lang}${routerLinks('Contract')}/create`}
                            onClick={() =>
                              navigate(`/${lang}${routerLinks('Contract')}/create`, {
                                state: {
                                  constructionId: id,
                                },
                              })
                            }
                          >
                            Thêm mới
                          </Button>
                        </Tooltip>
                      ) : (
                        <Button
                          type={'primary'}
                          icon={<PlusOutlined />}
                          href={`#/${lang}${routerLinks('Contract')}/create`}
                          onClick={() =>
                            navigate(`/${lang}${routerLinks('Contract')}/create`, {
                              state: {
                                constructionId: id,
                              },
                            })
                          }
                        >
                          Thêm mới
                        </Button>
                      )
                    }
                  >
                    <div className={'mt-4 h-[520px] overflow-y-auto miniScroll'}>
                      {constructionFacade.data?.contracts?.length && user?.rights?.includes('CONTRACT.VIEW')
                        ? constructionFacade.data?.contracts?.map((item: ContractModel, index: number) => (
                            <Card
                              onClick={() => navigate(`/${lang}${routerLinks('Contract')}/${item?.id}`)}
                              key={index}
                              className="mb-4 shadow-md rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer"
                              size="small"
                            >
                              <div className={'flex justify-between items-center'}>
                                <p className={'font-[500] truncate'}>{formatCurrency(item?.valueBeforeVatAmount)}</p>
                                <div className="flex gap-1">
                                  {item?.implementationStatus &&
                                  contractImplementationStatuses[
                                    item.implementationStatus as keyof typeof contractImplementationStatuses
                                  ] ? (
                                    <Tag
                                      className="rounded-full mx-0"
                                      color={
                                        contractImplementationStatuses[
                                          item.implementationStatus as keyof typeof contractImplementationStatuses
                                        ].color
                                      }
                                    >
                                      {
                                        contractImplementationStatuses[
                                          item.implementationStatus as keyof typeof contractImplementationStatuses
                                        ].label
                                      }
                                    </Tag>
                                  ) : (
                                    <Typography.Text>{'-'}</Typography.Text>
                                  )}
                                </div>
                              </div>
                              <div className={'flex justify-between items-center mt-4'}>
                                <div>
                                  <Link to={`/${lang}${routerLinks('Contract')}/${item?.id}/detail`}>
                                    {item?.code}
                                  </Link>{' '}
                                </div>

                                <div>
                                  {item?.approvalDate ? (
                                    <Typography.Text>{dayjs(item?.approvalDate).format('DD/MM/YYYY')}</Typography.Text>
                                  ) : (
                                    <Typography.Text>{'-'}</Typography.Text>
                                  )}
                                </div>
                              </div>
                              <div className={'flex justify-between items-center mt-4'}>
                                {item?.consultingService ? (
                                  <Tag
                                    className="rounded-full mx-0"
                                    color={item?.consultingService?.description || undefined}
                                  >
                                    {item?.consultingService?.title}
                                  </Tag>
                                ) : (
                                  <Typography.Text>{'-'}</Typography.Text>
                                )}
                                {item?.appendices ? (
                                  <Typography.Text>{item?.appendices?.length} phụ lục</Typography.Text>
                                ) : (
                                  <Typography.Text>{'-'}</Typography.Text>
                                )}
                              </div>
                            </Card>
                          ))
                        : renderEmptyState('Chưa có hợp đồng')}
                    </div>
                  </Card>
                </Col>
              </Row>
            </Col>
            <Col xs={8}>
              <Row gutter={[8, 8]}>
                <Col xs={24}>
                  <Card
                    bodyStyle={{ padding: '16px' }}
                    className={'h-[400px]'}
                    title={
                      <div className="flex gap-4">
                        <HistoryOutlined className={'text-[24px]'} />
                        <p className={'text-[14px]'}>Lịch sử hoạt động</p>
                      </div>
                    }
                  >
                    <div className={'h-[300px] overflow-y-auto miniScroll'}>
                      {constructionFacade.data?.activityLogs?.length ? (
                        <>
                          <List
                            className="mr-4"
                            itemLayout="horizontal"
                            dataSource={constructionFacade.data?.activityLogs}
                            renderItem={(item: ConstructionActivityLogsViewModel, index) => (
                              <List.Item>
                                <List.Item.Meta
                                  avatar={<Avatar className="min-w-[35px]" src={item?.avatarUrl} />}
                                  title={
                                    <p>
                                      <span className={'font-semibold'}>{item?.createdByUserName}</span>{' '}
                                      <span>
                                        {!item?.description?.includes('bình luận') ? (
                                          <span>
                                            {item?.description}{' '}
                                            {item?.description?.includes('đã cập nhật trạng thái giai đoạn') ? (
                                              <a
                                                onClick={() => {
                                                  constructionFacade.set({ activeTab: 'task' });
                                                  navigate(
                                                    `/${lang}${routerLinks('Construction')}/${id}/construction-monitor`,
                                                    {
                                                      state: {
                                                        templateStateIndex: item?.stepOrder,
                                                      },
                                                    },
                                                  );
                                                }}
                                              >
                                                <span
                                                  dangerouslySetInnerHTML={{
                                                    __html: item?.codeLinkDescription as string,
                                                  }}
                                                />
                                              </a>
                                            ) : item?.description?.includes('đã chỉnh sửa báo cáo tuần') ||
                                              item?.description?.includes('đã thêm mới báo cáo tuần') ? (
                                              <Link
                                                onClick={() => {
                                                  if (item?.actionType === 'WEEK_REPORT') {
                                                    constructionFacade.set({
                                                      isOpenWeekReport: true,
                                                      weekReportId: item?.orderId,
                                                    });
                                                  }
                                                }}
                                                to={
                                                  user?.rights?.includes('CONTRACT.VIEW')
                                                    ? (navigateLink(
                                                        item?.actionType as string,
                                                        item?.orderId as string,
                                                      ) as string)
                                                    : ''
                                                }
                                              >
                                                <span
                                                  dangerouslySetInnerHTML={{
                                                    __html: item?.codeLinkDescription as string,
                                                  }}
                                                />
                                              </Link>
                                            ) : (
                                              <Link
                                                onClick={() => {
                                                  if (!user?.rights?.includes('CONTRACT.VIEW')) {
                                                    return customMessage.error('Bạn không quyền xem hợp đồng');
                                                  }
                                                }}
                                                to={
                                                  user?.rights?.includes('CONTRACT.VIEW')
                                                    ? (navigateLink(
                                                        item?.actionType as string,
                                                        item?.orderId as string,
                                                      ) as string)
                                                    : ''
                                                }
                                              >
                                                <span
                                                  dangerouslySetInnerHTML={{
                                                    __html: item?.codeLinkDescription as string,
                                                  }}
                                                />
                                              </Link>
                                            )}
                                          </span>
                                        ) : (
                                          <span
                                            dangerouslySetInnerHTML={{
                                              __html: `${item?.description ?? ''} ${stripPTags(item?.codeLinkDescription ?? '')}`,
                                            }}
                                          />
                                        )}
                                      </span>
                                    </p>
                                  }
                                  description={
                                    <>
                                      <p className={'text-gray-400 text-[12px]'}>
                                        {dayjs(item?.createdOnDate).format('DD/MM/YYYY HH:mm')}
                                      </p>
                                    </>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        </>
                      ) : (
                        renderEmptyState('Chưa có lịch sử hoạt động')
                      )}
                    </div>
                  </Card>
                </Col>

                <Col xs={24}>
                  <Card
                    bodyStyle={{ padding: '16px' }}
                    className={'h-[770px]'}
                    title={
                      <div className="flex gap-4">
                        <MailOutlined className={'text-[24px]'} />
                        <p className={'text-[14px]'}>Trao đổi</p>
                      </div>
                    }
                  >
                    <Form form={formDialogMessage}>
                      <div className={'relative'}>
                        <Form.Item name={'content'}>
                          <EditorCustom constructionId={id} />
                        </Form.Item>
                      </div>
                    </Form>
                  </Card>
                </Col>

                <Col xs={24}>
                  <Card
                    bodyStyle={{ padding: '16px' }}
                    className={'h-[409px]'}
                    title={
                      <div className="flex gap-4">
                        <UserOutlined className={'text-[24px]'} />
                        <p className={'text-[14px]'}>Tổ thực hiện</p>
                      </div>
                    }
                    extra={
                      !rightMapRoleFacade.rightDatas?.[0]?.rightCodes?.includes('UPDATE') ? (
                        <Tooltip title="Bạn không có quyền thực hiện thao tác này">
                          <Button
                            disabled={true}
                            color={'primary'}
                            variant={'outlined'}
                            icon={<EditOutlined />}
                            onClick={() => {
                              navigate(`/${lang}${routerLinks('Construction')}/${constructionFacade.data?.id}/edit`);
                              constructionFacade.set({
                                listParticipantsArr: [],
                                listPresentArr: [],
                                listPresent: [],
                                listParticipants: [],
                                checkedListParticipants: [],
                                checkedListPresent: [],
                              });
                            }}
                          >
                            Cập nhật
                          </Button>
                        </Tooltip>
                      ) : (
                        <Button
                          color={'primary'}
                          variant={'outlined'}
                          icon={<EditOutlined />}
                          onClick={() => {
                            navigate(`/${lang}${routerLinks('Construction')}/${constructionFacade.data?.id}/edit`);
                            constructionFacade.set({
                              listParticipantsArr: [],
                              listPresentArr: [],
                              listPresent: [],
                              listParticipants: [],
                              checkedListParticipants: [],
                              checkedListPresent: [],
                            });
                          }}
                        >
                          Cập nhật
                        </Button>
                      )
                    }
                  >
                    <Form form={formFilter}>
                      <Form.Item name={'maPhongBan'}>
                        <Select
                          onChange={(value) => {
                            if (value) {
                              constructionFacade.getExecutionTeamsInConstruction({
                                size: -1,
                                filter: JSON.stringify({
                                  constructionId: id,
                                  maPhongBan: value,
                                }),
                              });
                            }
                          }}
                          showSearch
                          optionFilterProp={'label'}
                          placeholder={'Chọn phòng ban'}
                          options={codeTypeFacade.organizationData?.content
                            ?.filter((x) => x.code !== 'DIRECTORS')
                            ?.map((item) => ({
                              value: item.code,
                              label: item.title,
                            }))}
                        />
                      </Form.Item>

                      <div className={'h-[270px] overflow-y-auto overflow-x-hidden miniScroll'}>
                        {Object.keys(groupByDepartment(constructionFacade.executionTeamsData?.content)).length > 0
                          ? Object.entries(groupByDepartment(constructionFacade.executionTeamsData?.content))?.map(
                              ([key, value]: any) => {
                                return (
                                  <div key={key}>
                                    <>
                                      <p className="font-bold">{key}</p>
                                      {value?.teams?.filter(
                                        (x: ExecutionTeamsViewModel) => x.userType === 'participants',
                                      )?.length > 0 ? (
                                        <Row gutter={[12, 12]} wrap={true} className={'mt-4 mb-4'}>
                                          {value?.teams
                                            ?.filter((x: ExecutionTeamsViewModel) => x.userType === 'participants')
                                            ?.map((item: ExecutionTeamsViewModel, index: number) => (
                                              <Col key={index} xs={12}>
                                                <div className={'flex gap-2 items-center'}>
                                                  <Avatar
                                                    className={'min-w-[40px] min-h-[41px] object-cover'}
                                                    src={item?.employeeAvatarUrl}
                                                  />
                                                  <p className={'font-semibold'}>{item?.employeeName}</p>
                                                </div>
                                              </Col>
                                            ))}
                                        </Row>
                                      ) : (
                                        <p className="text-center mt-2 mb-2">Chưa có nhân sự</p>
                                      )}
                                    </>
                                  </div>
                                );
                              },
                            )
                          : renderEmptyState('Chưa có tổ thực hiện')}
                      </div>
                    </Form>
                  </Card>
                </Col>

                <Col xs={24}>
                  <Card
                    bodyStyle={{ padding: '16px' }}
                    className={'h-full'}
                    title={
                      <div className="flex gap-4">
                        <InfoCircleOutlined className={'text-[24px]'} />
                        <p className={'text-[14px]'}>Xin xe</p>
                      </div>
                    }
                    extra={
                      !rightMapRoleFacade.rightDatas?.[0]?.rightCodes?.includes('ADDISSUE') ? (
                        <Tooltip title="Bạn không có quyền thực hiện thao tác này">
                          <Button
                            disabled={true}
                            type={'primary'}
                            icon={<PlusOutlined />}
                            href={`#/${lang}${routerLinks('VehicleRequest')}/create`}
                            onClick={() =>
                              navigate(`/${lang}${routerLinks('VehicleRequest')}/create`, {
                                state: {
                                  constructionId: id,
                                },
                              })
                            }
                          >
                            Thêm mới
                          </Button>
                        </Tooltip>
                      ) : (
                        <Button
                          type={'primary'}
                          icon={<PlusOutlined />}
                          href={`#/${lang}${routerLinks('VehicleRequest')}/create`}
                          onClick={() =>
                            navigate(`/${lang}${routerLinks('VehicleRequest')}/create`, {
                              state: {
                                constructionId: id,
                              },
                            })
                          }
                        >
                          Thêm mới
                        </Button>
                      )
                    }
                  >
                    <div className="inline-flex space-x-2">
                      <Button
                        className={`rounded-full border ${
                          constructionFacade?.activeVehicleRequest === 'all'
                            ? 'bg-sky-100 text-[#1890FF] border-[#1890FF]'
                            : 'bg-white text-black '
                        }`}
                        shape="round"
                        onClick={() => {
                          constructionFacade.set({ activeVehicleRequest: 'all' });
                          vehicleRequestFacade.get({
                            size: -1,
                            filter: JSON.stringify({
                              projectId: id,
                            }),
                          });
                        }}
                      >
                        <p className={'text-[12px]'}>Tất cả</p>
                      </Button>
                      <Button
                        className={`rounded-full border ${
                          constructionFacade?.activeVehicleRequest === 'today'
                            ? 'bg-sky-100 text-[#1890FF] border-[#1890FF]'
                            : 'bg-white text-black '
                        }`}
                        shape="round"
                        onClick={() => {
                          defaultStartDate = dayjs().startOf('isoWeek').format('YYYY-MM-DD');
                          defaultEndDate = dayjs().endOf('isoWeek').format('YYYY-MM-DD');

                          constructionFacade.set({ activeVehicleRequest: 'today' });

                          vehicleRequestFacade.get({
                            size: -1,
                            filter: JSON.stringify({
                              projectId: id,
                              usageDateRange: [defaultStartDate, defaultEndDate],
                            }),
                          });
                        }}
                      >
                        <p className={'text-[12px]'}>Tuần này</p>
                      </Button>
                    </div>

                    <div className={'mt-4 h-[520px] overflow-y-auto miniScroll'}>
                      {vehicleRequestFacade?.pagination?.content?.length
                        ? vehicleRequestFacade?.pagination?.content.map(
                            (item: VehicleRequestViewModel, index: number) => (
                              <Card
                                onClick={() => navigate(`/${lang}${routerLinks('VehicleRequest')}/${item?.id}`)}
                                key={index}
                                size="small"
                                className="mb-4 shadow-md rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer"
                              >
                                <div className={'flex justify-between items-center'}>
                                  <p className={'font-[500] w-44 truncate'}>{item?.purpose}</p>
                                  <div className="flex gap-1">
                                    <Tag color={vehicleRequestStatus[item.status].color} className="rounded-full ml-2">
                                      {vehicleRequestStatus[item.status].label || item.status}
                                    </Tag>
                                  </div>
                                </div>
                                <div className={'flex justify-between items-center mt-4'}>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Link to={`/${lang}${routerLinks('ChiPhi')}/${item?.id}/edit`}>
                                      {item?.requestCode ? (
                                        <Typography.Text>
                                          {
                                            <Link to={`/${lang}${routerLinks('VehicleRequest')}/${item?.id}`}>
                                              {item?.requestCode}
                                            </Link>
                                          }
                                        </Typography.Text>
                                      ) : (
                                        <Typography.Text>{'-'}</Typography.Text>
                                      )}
                                    </Link>{' '}
                                    {getRelativeTimeReference(item?.createdOnDate as string)}
                                  </div>

                                  <div className={'flex gap-2'}>
                                    {warningRequestVehicleRequest[item.id] != null &&
                                      warningRequestVehicleRequest[item.id] <= 3 && (
                                        <Tooltip
                                          title={
                                            warningRequestVehicleRequest[item.id] > 0
                                              ? 'Sắp đến hạn'
                                              : warningRequestVehicleRequest[item.id] === 0
                                                ? 'Đã đến hạn'
                                                : `Đã quá hạn thực hiện ${warningRequestVehicleRequest[item.id] * -1} ngày`
                                          }
                                        >
                                          <ExclamationCircleFilled
                                            className={
                                              warningRequestVehicleRequest[item.id] > 0
                                                ? 'text-yellow-500'
                                                : 'text-red-500'
                                            }
                                          />
                                        </Tooltip>
                                      )}
                                    {dayjs(item?.startDateTime).format('DD/MM/YYYY')} -{' '}
                                    {dayjs(item?.endDateTime).format('DD/MM/YYYY')}
                                  </div>
                                </div>
                                <div className={'flex justify-between items-center mt-4'}>
                                  <p className="line-clamp-2 max-w-[200px]">
                                    {item?.user?.name} - {item?.user?.phongBan?.title}
                                  </p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <div
                                      style={{ backgroundColor: vehicleRequestPriority[item.priority].color }}
                                      className="size-1.5 rounded-full"
                                    ></div>
                                    <span className="text-xs">{vehicleRequestPriority[item.priority].label}</span>
                                  </div>
                                </div>
                              </Card>
                            ),
                          )
                        : renderEmptyState('Chưa có vướng mắc')}
                    </div>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        )}
        {constructionFacade?.activeTab === 'task' && <Task />}
      </div>

      {constructionFacade.isOpenWeekReport && (
        <WeekReportModal constructionId={id as string} weekReportId={constructionFacade.weekReportId as string} />
      )}
      {constructionFacade.isUpdateTemplateStagesModal && <UpdateTemplateStagesModal />}
    </Spin>
  );
}

export default ConstructionMonitor;
