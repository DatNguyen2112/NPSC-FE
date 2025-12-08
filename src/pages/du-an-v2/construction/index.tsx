import {
  CloseOutlined,
  DownloadOutlined,
  ExclamationCircleFilled,
  FilterOutlined,
  MoreOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { SubHeader } from '@layouts/admin';
import { EStatusState, QueryParams } from '@models';
import ExportFileModal from '@pages/du-an-v2/construction/ExportFileModal';
import GlossaryTable from '@pages/du-an-v2/construction/glossary-table';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import {
  ConstructionFacade,
  ConstructionModel,
  EStatusConstruction,
  GlobalFacade,
  InvestorFacade,
  TemplateStage,
} from '@store';
import { lang, rightMapCodeConstruction, routerLinks, scrollLeftWhenChanging, scrollTopWhenChanging } from '@utils';
import {
  Avatar,
  Button,
  DatePicker,
  Drawer,
  Dropdown,
  Flex,
  Form,
  FormInstance,
  List,
  Modal,
  Pagination,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { ItemType } from 'antd/es/menu/interface';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Link, useSearchParams } from 'react-router-dom';
import { RightMapRoleFacade } from 'src/store/right-map-role';
import ImportFileModal from './ImportFileModal';

interface DataType extends ConstructionModel {
  key: string;
}

let fillQuery: QueryParams;
let currentFilter: any;
let defaultStartDate: string;
let defaultEndDate: string;

const ConstructionPage = () => {
  const formRef = useRef<FormInstance | undefined>(undefined);
  const [formFilter] = Form.useForm();
  const navigate = useNavigate();
  const { user } = GlobalFacade();
  const constructionFacade = ConstructionFacade();
  const investorFacade = InvestorFacade();
  const rightMapRoleFacade = RightMapRoleFacade();
  const [searchParams] = useSearchParams();
  const [modalApi, contextModalApi] = Modal.useModal();

  const {
    page,
    size,
    filter = '{}',
    sort = '',
  } = {
    ...Object.fromEntries(searchParams),
    page: Number(searchParams.get('page') || 1),
    size: Number(searchParams.get('size') || 20),
  };

  const parsedFilter = JSON.parse(filter);

  useEffect(() => {
    if (parsedFilter) {
      constructionFacade.set({
        investorId: parsedFilter?.InvestorId,
        createdOnDate: parsedFilter?.createdOnDate,
      });

      formFilter.setFieldsValue({
        statusCode: parsedFilter?.statusCode,
        executionStatusCode: parsedFilter?.executionStatusCode,
        documentStatusCode: parsedFilter?.documentStatusCode,
        deliveryDate: parsedFilter?.deliveryDate ? dayjs(parsedFilter?.deliveryDate) : null,
      });
    }
  }, [parsedFilter]);

  useEffect(() => {
    investorFacade.get({ size: -1 });
    rightMapRoleFacade.getRightMapByListCode(rightMapCodeConstruction);
  }, []);

  useEffect(() => {
    if (rightMapRoleFacade?.rightDatas) {
      rightMapRoleFacade.set({
        rightDataByPermission: rightMapRoleFacade?.rightDatas?.[0]?.rightCodes
          ?.filter((x) => x == 'VIEWALL' || x == 'VIEWBYINDIVIDUAL' || x == 'VIEWBYDEPARTMENT' || x == 'VIEWBYTEAM')
          .map((item) => ({
            rightCode: item,
            level: generateLevel(item),
          })),
      });
    }
  }, [rightMapRoleFacade?.rightDatas]);

  useEffect(() => {
    if (rightMapRoleFacade?.rightDataByPermission) {
      const dataByLevel = rightMapRoleFacade?.rightDataByPermission?.map((item: any) => item?.level);
      const maxIndex = findMaxIndex(dataByLevel);

      if (maxIndex != -1) {
        onChangeDataTable({
          query: {
            size: size,
            page: page,
            filter: JSON.stringify({
              ...JSON.parse(searchParams.get('filter') || '{}'),
              permissionCode: rightMapRoleFacade?.rightDataByPermission[maxIndex]?.rightCode,
            }),
          },
        });
      }
    }
  }, [rightMapRoleFacade?.rightDataByPermission]);

  useEffect(() => {
    switch (constructionFacade.status) {
      case EStatusState.deleteFulfilled:
      case EStatusConstruction.importExcelFulfilled:
        constructionFacade.get({});
        break;
    }
  }, [constructionFacade.status]);

  const generateLevel = (rightCode: string) => {
    switch (rightCode) {
      case 'VIEWALL':
        return 4;
      case 'VIEWBYDEPARTMENT':
        return 3;
      case 'VIEWBYTEAM':
        return 2;
      case 'VIEWBYINDIVIDUAL':
        return 1;
    }
  };

  const findMaxIndex = (arr: any) => {
    if (!arr || arr.length === 0) return -1;

    let maxIndex = 0;
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] > arr[maxIndex]) {
        maxIndex = i;
      }
    }
    return maxIndex;
  };

  const dataSource =
    constructionFacade.pagination?.content?.map((item: ConstructionModel, index: number) => ({
      ...item,
      stt:
        (Number(constructionFacade.pagination?.page ?? 0) - 1) * Number(constructionFacade.pagination?.size ?? 0) +
        index +
        1,
      index: index + 1,
    })) ?? [];

  const onChangeDataTable = (props: { query?: QueryParams; setKeyState?: object }) => {
    // eslint-disable-next-line react/prop-types
    if (!props.query) {
      props.query = {
        page: Number(page),
        size: Number(size),
        filter: filter ?? '',
        sort: sort ?? '',
      };
    }
    // eslint-disable-next-line react/prop-types
    fillQuery = { ...constructionFacade.query, ...props.query };
    for (const key in fillQuery) {
      if (!fillQuery[key as keyof QueryParams]) delete fillQuery[key as keyof QueryParams];
    }
    constructionFacade.get(fillQuery);
    navigate(
      { search: new URLSearchParams(fillQuery as unknown as Record<string, string>).toString() },
      { replace: true },
    );
    // eslint-disable-next-line react/prop-types
    constructionFacade.set({ query: props.query, ...props.setKeyState });
  };

  const renderColor = (statusCode: string) => {
    switch (statusCode) {
      case 'APPROVED':
        return 'success';
      case 'AUTHOR_SUPERVISOR':
        return 'geekblue';
      case 'IS_DESIGNING':
        return 'volcano';
      case 'NOT_APPROVE':
        return 'warning';
      case 'IN_PROGRESS':
        return 'processing';
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

  const handleSelectedCreateOnDateButtonClick = (value: string) => {
    currentFilter = JSON.parse(searchParams.get('filter') || '{}');
    switch (value) {
      case 'today':
        defaultStartDate = dayjs().startOf('day').format('YYYY-MM-DD');
        defaultEndDate = dayjs().endOf('day').format('YYYY-MM-DD');
        break;
      case 'yesterday':
        defaultStartDate = dayjs().subtract(1, 'day').startOf('day').format('YYYY-MM-DD');
        defaultEndDate = dayjs().subtract(1, 'day').endOf('day').format('YYYY-MM-DD');
        break;
      case 'last_week':
        defaultStartDate = dayjs().subtract(1, 'week').startOf('isoWeek').format('YYYY-MM-DD');
        defaultEndDate = dayjs().subtract(1, 'week').endOf('isoWeek').format('YYYY-MM-DD');
        break;
      case 'this_week':
        defaultStartDate = dayjs().startOf('isoWeek').format('YYYY-MM-DD');
        defaultEndDate = dayjs().endOf('isoWeek').format('YYYY-MM-DD');
        break;
      case 'last_month':
        defaultStartDate = dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
        defaultEndDate = dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
        break;
      case 'this_month':
        defaultStartDate = dayjs().startOf('month').format('YYYY-MM-DD');
        defaultEndDate = dayjs().endOf('month').format('YYYY-MM-DD');
        break;
      default:
        defaultStartDate = '';
        defaultEndDate = '';
        break;
    }
    currentFilter = {
      ...currentFilter,
      dateRange: [defaultStartDate, defaultEndDate],
    };
    const query: QueryParams = {
      page: page ? Number(page) : 1,
      size: size ? Number(size) : 20,
      filter: JSON.stringify(currentFilter),
    };
    onChangeDataTable({ query });
  };

  const handleSelectedOwnerType = (value: string) => {
    currentFilter = JSON.parse(searchParams.get('filter') || '{}');
    currentFilter.InvestorId = value;

    const query: QueryParams = {
      page: page ? Number(page) : 1,
      size: size ? Number(size) : 20,
      filter: JSON.stringify(currentFilter),
    };
    onChangeDataTable({ query });
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
      cancelText: 'Huỷ',
      cancelButtonProps: { type: 'default' },
    });
  };

  const onChangeSearch = (value: string) => {
    if (value) {
      parsedFilter.fullTextSearch = value;
    } else {
      delete parsedFilter.fullTextSearch;
    }
    onChangeDataTable({
      query: {
        page: 1,
        size,
        filter: JSON.stringify({ ...parsedFilter }),
      },
    });
  };

  const handleOpenExportFileModal = () => {
    constructionFacade.set({ isExportFileModal: true });
  };

  const onFilter = (values: any) => {
    const currentFilter = JSON.parse(filter);
    Object.keys(values).forEach((key) => {
      if (values[key]) {
        if (['startDate', 'endDate'].includes(key)) {
          currentFilter[key] = dayjs(values[key]).format('YYYY-MM-DDTHH:mm:ss[Z]');
        } else {
          currentFilter[key] = values[key];
        }
      } else {
        delete currentFilter[key];
      }
    });
    onChangeDataTable({
      query: {
        page: 1,
        size,
        filter: JSON.stringify({ ...currentFilter }),
      },
    });

    constructionFacade.set({ isFilterVisible: false });
  };

  const getRelativeTimeConstructionPage = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);

    const isSameDay =
      now.getFullYear() === date.getFullYear() &&
      now.getMonth() === date.getMonth() &&
      now.getDate() === date.getDate();

    if (isSameDay) {
      const diffInMs = now.getTime() - date.getTime();
      const diffInSeconds = Math.floor(diffInMs / 1000);
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

      let message = '';
      if (diffInSeconds < 60) {
        message = `Cập nhật lần cuối ${diffInSeconds} giây trước`;
      } else if (diffInMinutes < 60) {
        message = `Cập nhật lần cuối ${diffInMinutes} phút trước`;
      } else {
        message = `Cập nhật lần cuối ${diffInHours} giờ trước`;
      }

      return <p className="text-gray-400 text-[12px] mt-2 italic">{message}</p>;
    }

    // Đặt giờ về 00:00 để tính số ngày
    const nowDay = new Date(now);
    const dateDay = new Date(date);
    nowDay.setHours(0, 0, 0, 0);
    dateDay.setHours(0, 0, 0, 0);

    const diffInDays = Math.floor((nowDay.getTime() - dateDay.getTime()) / (1000 * 60 * 60 * 24));

    let dayText = '';
    if (diffInDays === 1) {
      dayText = 'Cập nhật lần cuối hôm qua';
    } else {
      dayText = `Cập nhật lần cuối ${diffInDays} ngày trước`;
    }

    return <p className="text-gray-400 text-[12px] italic">{dayText}</p>;
  };

  const column: ColumnsType<DataType> = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      align: 'center',
      width: 60,
    },
    {
      title: 'Tên công trình/dự án',
      dataIndex: 'name',
      key: 'name',
      width: 270,
      render: (value, record) => {
        // const templateStagesDone = record?.templateStages?.filter((item, index) => !item?.isDone);
        // const templateOrderStepArr: any = templateStagesDone?.map((item) => item.stepOrder);

        // const findMaxIndex = (arr: any) => {
        //   if (!arr || arr.length === 0) return -1;

        //   let maxIndex = 0;
        //   for (let i = 1; i < arr.length; i++) {
        //     if (arr[i] > arr[maxIndex]) {
        //       maxIndex = i;
        //     }
        //   }
        //   return maxIndex;
        // };

        // const indexTemplate = findMaxIndex(templateOrderStepArr);

        return (
          <div className="space-y-2">
            <p className={'truncate text-sm font-semibold'}>{record?.name}</p>

            <div className="flex gap-2">
              <Link
                className="hover:underline"
                to={`/${lang}${routerLinks('Construction')}/${record?.id}/construction-monitor`}
              >
                {record?.code}
              </Link>

              {/* <p className="text-gray-500/90 truncate max-w-[130px]">
                {
                  templateStagesDone?.find(
                    (item: TemplateStage) => item?.stepOrder === templateOrderStepArr[indexTemplate],
                  )?.name
                }
              </p> */}
            </div>

            <div className={'flex gap-1 mt-1'}>
              <Tag className="rounded-full mx-0" color={record?.voltage?.description}>
                {record?.voltage?.title}
              </Tag>
              <Tag className="rounded-full mx-0" color={renderColorPriority(record?.priorityCode)}>
                {record?.priorityName}
              </Tag>
              {record?.isHasIssue ? (
                <Tag className="rounded-full mx-0" color={'red'}>
                  Có vướng mắc
                </Tag>
              ) : (
                <Tag className="rounded-full mx-0" color={'green'}>
                  Không vướng mắc
                </Tag>
              )}
            </div>
            {getRelativeTimeConstructionPage(record?.lastModifiedOnDate as string)}
          </div>
        );
      },
    },
    {
      title: 'CĐT/BQLDA',
      dataIndex: 'investor',
      key: 'investor',
      width: 140,
      render: (value, record) => {
        return (
          <>
            <p className={'text-[14px]'}>{record?.investor?.name}</p>
            <p className={'text-[12px] text-gray-500'}>{record?.investor?.investorType?.name}</p>
          </>
        );
      },
    },
    {
      title: 'Giai đoạn',
      dataIndex: 'templateStages',
      key: 'templateStages',
      width: 140,
      render: (value, record) => {
        const templateNotDoneArr = record?.templateStages as any[];

        const getMinStepOrderIndex = (arr: any[]) => {
          return arr?.reduce((minIdx, curr, idx, array) => {
            if (!curr.isDone && (minIdx === -1 || curr.stepOrder < array[minIdx].stepOrder)) {
              return idx;
            }
            return minIdx;
          }, -1);
        };

        const indexTemplate = getMinStepOrderIndex(templateNotDoneArr);

        const getRelativeTime = (dateString: string) => {
          const now = new Date();
          const date = new Date(dateString);

          // Đặt lại giờ, phút, giây về 00:00:00
          now.setHours(0, 0, 0, 0);
          date.setHours(0, 0, 0, 0);

          const diffInMs = date.getTime() - now.getTime();
          const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

          // Sắp đến hạn (còn 3 ngày)
          if (diffInDays === 3 || diffInDays === 1 || diffInDays === 2) {
            return {
              message: 'Giai đoạn này của dự án sắp đến hạn',
              type: 'danger',
            };
          }

          // Đến hạn (hôm nay)
          if (diffInDays === 0) {
            return {
              message: 'Giai đoạn này của dự án đã đến hạn',
              type: 'warning',
            };
          }

          // Quá hạn (đã trễ X ngày)
          if (diffInDays < 0) {
            return {
              message: `Giai đoạn này của dự án đã quá hạn ${Math.abs(diffInDays)} ngày`,
              type: 'danger',
            };
          }

          return null;
        };

        const relativeTime = (dateString: string) => {
          const result = getRelativeTime(dateString);
          if (!result) return null;

          return (
            <div className="flex gap-2">
              <Tooltip title={<p>{result.message}</p>}>
                <ExclamationCircleFilled className={`text-${result.type === 'warning' ? 'yellow' : 'red'}-500`} />
              </Tooltip>
            </div>
          );
        };

        return (
          templateNotDoneArr && (
            <div>
              <div className="flex gap-2 items-center">
                <p className="text-gray-500">{templateNotDoneArr[indexTemplate]?.name}</p>
                {relativeTime(templateNotDoneArr[indexTemplate]?.expiredDate as string)}
              </div>
              <p className="text-[#FF4D4F] font-semibold mt-2">
                {dayjs(templateNotDoneArr[indexTemplate]?.expiredDate).format('DD/MM/YYYY')}
              </p>
            </div>
          )
        );
      },
    },
    // {
    //   title: 'Tổ thực hiện',
    //   dataIndex: 'investor',
    //   key: 'investor',
    //   width: 130,
    //   render: (value, record) => {
    //     const handleRemoveDuplicate = (arr: any[]) => {
    //       return Array.from(new Set(arr));
    //     };

    //     const teams = handleRemoveDuplicate(
    //       record?.executionTeams?.filter((x: any) => x.toThucHien != null)?.map((item: any) => item?.toThucHien?.title),
    //     );

    //     const displayText = teams.join(', ');

    //     return (
    //       <div
    //         className="line-clamp-3 text-ellipsis overflow-hidden whitespace-normal break-words text-[13px]"
    //         title={displayText}
    //       >
    //         {displayText}
    //       </div>
    //     );
    //   },
    // },
    {
      title: 'Người theo dõi',
      dataIndex: 'folower',
      key: 'folower',
      width: 150,
      render: (value, record) => {
        return (
          <Avatar.Group
            className={'cursor-pointer'}
            max={{
              count: 3,
              style: { color: '#f56a00', backgroundColor: '#fde3cf' },
            }}
          >
            {record?.executionTeams
              ?.filter((x: any) => x.userType === 'follower')
              ?.map((item: any) => {
                return (
                  <Tooltip title={item?.employeeName} placement="top" key={item?.employeeId}>
                    <Avatar src={item?.employeeAvatarUrl} />
                  </Tooltip>
                );
              })}
          </Avatar.Group>
        );
      },
    },
    {
      title: 'Nhân sự t/gia',
      dataIndex: 'participants',
      key: 'participants',
      width: 150,
      render: (value, record) => {
        return (
          <Avatar.Group
            className={'cursor-pointer'}
            max={{
              count: 3,
              style: { color: '#f56a00', backgroundColor: '#fde3cf' },
            }}
          >
            {record?.executionTeams
              ?.filter((x: any) => x.userType === 'participants')
              ?.map((item: any) => {
                return (
                  <Tooltip title={item?.employeeName} placement="top" key={item?.employeeId}>
                    <Avatar src={item?.employeeAvatarUrl} />
                  </Tooltip>
                );
              })}
          </Avatar.Group>
        );
      },
    },
    {
      title: 'Tình trạng',
      dataIndex: 'executionStatusName',
      key: 'executionStatusName',
      width: 210,
      align: 'center',
      render: (value: any, record) => {
        return (
          <Space direction="vertical" size="middle" className={'px-1 gap-3'}>
            <div className="flex justify-between items-center gap-4">
              <p className="text-gray-500/90 shrink-0 text-[12px]">Thực hiện:</p>

              <Tag className="rounded-full mx-0" color={renderColor(record?.executionStatusCode)}>
                {record?.executionStatusName}
              </Tag>
            </div>
            <div className="flex justify-between items-center gap-4">
              <p className="text-gray-500/90 shrink-0 text-[12px]">Dự án:</p>

              <Tag className="rounded-full mx-0" color={renderColor(record?.statusCode)}>
                {record?.statusName}
              </Tag>
            </div>
            <div className="flex justify-between items-center gap-4">
              <p className="text-gray-500/90 shrink-0 text-[12px]">Hồ sơ:</p>

              <Tag className="rounded-full mx-0" color={renderColor(record?.documentStatusCode)}>
                {record?.documentStatusName}
              </Tag>
            </div>
          </Space>
        );
      },
    },
    {
      dataIndex: 'action',
      key: 'Action',
      align: 'center',
      width: 60,
      fixed: 'right',
      render: (value, record) => {
        const itemsMenu: ItemType[] = [
          {
            key: 1,
            label: (
              <a
                onClick={() => {
                  navigate(`/${lang}${routerLinks('Construction')}/${record?.id}/construction-monitor`, {
                    state: {
                      isTaskTab: true,
                    },
                  });
                }}
              >
                Xem công việc
              </a>
            ),
          },
          {
            key: 2,
            label: (
              <a
                onClick={() => navigate(`/${lang}${routerLinks('Construction')}/${record?.id}/construction-monitor`)}
                className="text-gray-900 hover:!text-blue-500"
              >
                Xem monitor
              </a>
            ),
          },
          {
            key: 3,
            label: (
              <a
                onClick={() => {
                  navigate(`/${lang}${routerLinks('Construction')}/${record?.id}/edit`);
                  constructionFacade.set({
                    listParticipantsArr: [],
                    listPresentArr: [],
                    listPresent: [],
                    listParticipants: [],
                    checkedListParticipants: [],
                    checkedListPresent: [],
                  });
                }}
                className="text-gray-900 hover:!text-blue-500"
              >
                Chỉnh sửa
              </a>
            ),
          },
          {
            key: 4,
            label: (
              <a onClick={() => handleDelete(record?.id)} className="text-gray-900 hover:!text-blue-500">
                Xóa
              </a>
            ),
          },
        ];
        return (
          <Space>
            <Dropdown
              placement="bottomRight"
              trigger={['click']}
              menu={{
                items: itemsMenu,
              }}
            >
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const table = (
    <div>
      <Table
        title={() => (
          <>
            <Flex gap={15} align="center">
              <div className={'flex-1'}>
                <SearchWidget
                  placeholder={'Tìm kiếm theo mã, tên công trình/dự án'}
                  callback={onChangeSearch}
                  form={(form) => (formRef.current = form)}
                />
              </div>
              <Select
                value={constructionFacade?.investorId}
                className={'w-56'}
                showSearch
                allowClear
                optionFilterProp={'label'}
                placeholder={'Chọn CĐT/BQLDA'}
                options={investorFacade.pagination?.content?.map((item) => ({
                  value: item.id,
                  label: item.name,
                  code: item.investorType?.name,
                }))}
                optionRender={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<Typography.Text strong>{item.label}</Typography.Text>}
                      description={
                        <Typography.Text
                          style={{
                            fontSize: 12,
                          }}
                          type="secondary"
                          italic
                        >
                          {item.data.code}
                        </Typography.Text>
                      }
                    />
                  </List.Item>
                )}
                onChange={handleSelectedOwnerType}
              />
              <Select
                value={constructionFacade?.createdOnDate}
                className="w-56"
                placeholder={'Ngày tạo'}
                allowClear
                showSearch
                optionLabelProp={'label'}
                options={
                  [
                    {
                      label: 'Hôm nay',
                      value: 'today',
                    },
                    {
                      label: 'Hôm qua',
                      value: 'yesterday',
                    },
                    {
                      label: 'Tuần này',
                      value: 'this_week',
                    },
                    {
                      label: 'Tuần trước',
                      value: 'last_week',
                    },
                    {
                      label: 'Tháng này',
                      value: 'this_month',
                    },
                    {
                      label: 'Tháng trước',
                      value: 'last_month',
                    },
                  ] as any
                }
                onChange={handleSelectedCreateOnDateButtonClick}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  onChangeDataTable({ query: { page, size, sort, filter } });
                }}
              >
                Tải lại
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() =>
                  constructionFacade.set({
                    isFilterVisible: true,
                  })
                }
                icon={<FilterOutlined />}
              >
                Bộ lọc
              </Button>
            </Flex>
          </>
        )}
        // bordered
        scroll={{ y: `calc(100vh - 300px)` }}
        dataSource={dataSource}
        columns={column as any}
        pagination={false}
      />
      <Pagination
        className={'flex justify-end py-2'}
        showSizeChanger
        showTitle={false}
        current={constructionFacade?.query?.page}
        pageSize={constructionFacade?.pagination?.size}
        total={constructionFacade?.pagination?.totalElements}
        pageSizeOptions={[20, 40, 60, 80]}
        showTotal={(total, range) => `Từ ${range[0]} đến ${range[1]} trên tổng ${total}`}
        onChange={(page, pageSize) => {
          onChangeDataTable({
            query: {
              page,
              size: pageSize,
              filter: JSON.stringify(JSON.parse(searchParams.get('filter') || '{}')),
            },
          });

          scrollLeftWhenChanging('.ant-table-body');
          scrollTopWhenChanging('.ant-table-body');
        }}
      />
    </div>
  );

  const tool = (
    <Space size={'middle'} className={'mx-2'}>
      {!rightMapRoleFacade?.rightDatas?.[0]?.rightCodes?.includes('EXPORTIMPORTFILE') ? (
        <Tooltip title="Bạn không có quyền thực hiện thao tác này">
          <Button
            disabled={true}
            variant={'outlined'}
            color={'primary'}
            icon={<UploadOutlined />}
            onClick={() =>
              constructionFacade.set({
                isImportFileModalOpen: true,
              })
            }
          >
            Nhập file
          </Button>
        </Tooltip>
      ) : (
        <Button
          variant={'outlined'}
          color={'primary'}
          icon={<UploadOutlined />}
          onClick={() =>
            constructionFacade.set({
              isImportFileModalOpen: true,
            })
          }
        >
          Nhập file
        </Button>
      )}
      {/* <ImportUpload
        showBtnDelete={() => false}
        renderContent={() => <div style={{ opacity: 0 }} />}
        onChange={(values: any) => {
          if (!values[0].filePath) return;
          constructionFacade.importExcel(values[0].filePath, false);
        }}
        multiple={false}
        url={linkApi + `/upload/blob/attach`}
        action={'export-excel'}
        accept={'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
      >
        {!rightMapRoleFacade?.rightDatas?.[0]?.rightCodes?.includes('EXPORTIMPORTFILE') ? (
          <Tooltip title="Bạn không có quyền thực hiện thao tác này">
            <Button
              disabled={true}
              variant={'outlined'}
              color={'primary'}
              icon={<UploadOutlined />}
              loading={constructionFacade.isLoading}
            >
              Nhập file
            </Button>
          </Tooltip>
        ) : (
          <Button
            variant={'outlined'}
            color={'primary'}
            icon={<UploadOutlined />}
            loading={constructionFacade.isLoading}
          >
            Nhập file
          </Button>
        )}
      </ImportUpload> */}
      {!rightMapRoleFacade?.rightDatas?.[0]?.rightCodes?.includes('EXPORTIMPORTFILE') ? (
        <Tooltip title="Bạn không có quyền thực hiện thao tác này">
          <Button
            disabled={true}
            icon={<DownloadOutlined />}
            onClick={handleOpenExportFileModal}
            variant={'outlined'}
            color={'primary'}
          >
            Xuất file
          </Button>
        </Tooltip>
      ) : (
        <Button icon={<DownloadOutlined />} onClick={handleOpenExportFileModal} variant={'outlined'} color={'primary'}>
          Xuất file
        </Button>
      )}
      {!rightMapRoleFacade?.rightDatas?.[0]?.rightCodes?.includes('ADD') ? (
        <Tooltip title="Bạn không có quyền thực hiện thao tác này">
          <Button
            disabled={true}
            icon={<PlusOutlined />}
            onClick={() => {
              navigate(`/${lang}${routerLinks('Construction')}/create`);
            }}
            type="primary"
          >
            Thêm mới
          </Button>
        </Tooltip>
      ) : (
        <Button
          icon={<PlusOutlined />}
          onClick={() => {
            navigate(`/${lang}${routerLinks('Construction')}/create`);
          }}
          type="primary"
        >
          Thêm mới
        </Button>
      )}
    </Space>
  );

  return (
    <div>
      {constructionFacade.isExportFileModal && <ExportFileModal />}

      <Modal
        title={'Bảng giải thích thuật ngữ'}
        onCancel={() => constructionFacade.set({ isShow: false })}
        open={constructionFacade.isShow}
        footer={<Button onClick={() => constructionFacade.set({ isShow: false })}>Đóng</Button>}
      >
        <GlossaryTable />
      </Modal>
      <SubHeader tool={tool} />
      {contextModalApi}
      <div className={'m-4 bg-white'}>
        <Spin spinning={constructionFacade.isLoading}>
          {table}

          <Drawer
            title={'Bộ lọc'}
            maskClosable={false}
            forceRender
            open={constructionFacade.isFilterVisible}
            onClose={() => constructionFacade.set({ isFilterVisible: false })}
            closeIcon={false}
            extra={
              <Button
                type={'text'}
                icon={<CloseOutlined />}
                onClick={() => constructionFacade.set({ isFilterVisible: false })}
              />
            }
            footer={
              <Space className={'flex justify-end'}>
                <Button danger onClick={() => formFilter.resetFields()}>
                  Xóa bộ lọc
                </Button>
                <Button type={'primary'} onClick={formFilter.submit}>
                  Lọc
                </Button>
              </Space>
            }
          >
            <Form form={formFilter} layout={'vertical'} onFinish={onFilter}>
              <Form.Item name={'statusCode'} label={'Tình trạng dự án'}>
                <Select
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
              <Form.Item name={'deliveryDate'} label={'Chọn ngày giao A'}>
                <DatePicker
                  className="w-full"
                  placeholder="Chọn ngày giao A"
                  format={'DD/MM/YYYY'}
                  placement="bottomRight"
                />
              </Form.Item>
            </Form>
          </Drawer>
        </Spin>
      </div>

      <ImportFileModal />
    </div>
  );
};

export default ConstructionPage;
