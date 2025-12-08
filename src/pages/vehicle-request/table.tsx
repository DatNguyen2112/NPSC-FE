import { Button, Card, FormInstance, Select, Table, Tag, Space, Tooltip, Dropdown, App, Form, Input } from 'antd';
import React, { useEffect, useMemo, useRef } from 'react';
import { ReloadOutlined, CloseOutlined, ExclamationCircleFilled, MoreOutlined } from '@ant-design/icons';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import { formatDayjsDate, isLoadAllData, lang, routerLinks, uuidv4 } from '@utils';
import {
  CodeTypeFacade,
  ConstructionFacade,
  EstatusVehicleRequest,
  filterFieldNameMap,
  LoaiXeFacade,
  PhuongTienFacade,
  RightMapRoleFacade,
  UserFacade,
  VehicleRequestFacade,
  vehicleRequestPriority,
  vehicleRequestStatus,
  VehicleRequestViewModel,
} from '@store';
import { DefaultOptionType } from 'antd/es/select';
import { ColumnsType } from 'antd/es/table';
import { Link, useSearchParams } from 'react-router-dom';
import { ItemType } from 'antd/es/menu/interface';
import { customMessage } from 'src';
import { isEqual } from 'underscore';
import FilterDrawer from './filter-drawer';
import dayjs from 'dayjs';
import { EStatusState } from '@models';
import VehicleShareModal from './vehicle-share-modal';

const statusList = Object.values(vehicleRequestStatus);
const queryDefaultValue = {
  page: 1,
  size: 10,
  filter: '{}',
  sort: '',
};

const VehicleRequestTable: React.FC = () => {
  const rightMapFacade = RightMapRoleFacade();
  const vehicleRequestFacade = VehicleRequestFacade();
  const constructionFacade = ConstructionFacade();
  const userFacade = UserFacade();
  const codeTypeFacade = CodeTypeFacade();
  const loaiXeFacade = LoaiXeFacade();
  const phuongTienFacade = PhuongTienFacade();
  const [rejectForm] = Form.useForm();
  const [searchParams, setSearchParams] = useSearchParams();
  const forceReload = useRef(false);
  const filterTagsContainer = useRef<HTMLDivElement>(null);
  const queryParams = useMemo(() => {
    return {
      page: Number(searchParams.get('page') || queryDefaultValue.page),
      size: Number(searchParams.get('size') || queryDefaultValue.size),
      filter: JSON.parse(searchParams.get('filter') || queryDefaultValue.filter) as Record<string, any>,
      sort: searchParams.get('sort') || queryDefaultValue.sort,
    };
  }, [searchParams]);
  const oldQueryParams = useRef(
    (() => {
      const lastQuery = JSON.parse(vehicleRequestFacade.queryParams || '{}');

      return {
        page: Number(lastQuery.page || -1),
        size: Number(lastQuery.size || -1),
        filter: JSON.parse(lastQuery.filter || '{}') as Record<string, any>,
        sort: lastQuery.sort as string,
      };
    })(),
  );
  const { modal } = App.useApp();
  const formRef = useRef<FormInstance | undefined>(undefined);
  const constructionList = useMemo(
    () =>
      (constructionFacade.pagination?.content ?? []).map(
        (x) =>
          ({
            label: x.name,
            value: x.id,
          }) satisfies DefaultOptionType,
      ),
    [constructionFacade.pagination],
  );
  const dataSource = useMemo(
    () =>
      vehicleRequestFacade.pagination?.content?.map((item, index) => {
        const page = vehicleRequestFacade.pagination?.page || 1;
        const size = vehicleRequestFacade.pagination?.size || 10;
        const stt = (page - 1) * size + index + 1;

        return {
          ...item,
          index: stt,
          key: item.id,
        };
      }),
    [vehicleRequestFacade.pagination],
  );
  const warningRequest = useMemo(() => {
    const today = dayjs().startOf('day');
    return (
      vehicleRequestFacade.pagination?.content
        ?.filter((x) => x.status === vehicleRequestStatus.PendingApproval.value)
        .reduce(
          (acc, curr) => {
            acc[curr.id] = dayjs(curr.startDateTime).startOf('day').diff(today, 'day');
            return acc;
          },
          {} as Record<string, number>,
        ) ?? {}
    );
  }, [vehicleRequestFacade.pagination?.content]);
  const columns: ColumnsType<VehicleRequestViewModel> = useMemo(
    () => [
      {
        title: 'STT',
        dataIndex: 'index',
        key: 'index',
        width: 60,
        align: 'center',
      },
      {
        title: 'Mã yêu cầu',
        dataIndex: 'requestCode',
        key: 'requestCode',
        width: 150,
        ellipsis: {
          showTitle: false,
        },
        render: (text, record) => (
          <div className="flex gap-1">
            <Link className="hover:underline" to={`/${lang}${routerLinks('VehicleRequest')}/${record.id}`}>
              {text}
            </Link>
            {warningRequest[record.id] != null && warningRequest[record.id] <= 3 && (
              <Tooltip
                title={
                  warningRequest[record.id] > 0
                    ? 'Yêu cầu xin xe sắp quá hạn phê duyệt'
                    : warningRequest[record.id] === 0
                      ? 'Yêu cầu xin xe đã đến hạn phê duyệt'
                      : `Yêu cầu xin xe đã quá hạn phê duyệt ${warningRequest[record.id] * -1} ngày`
                }
              >
                <ExclamationCircleFilled
                  className={warningRequest[record.id] > 0 ? 'text-yellow-500' : 'text-red-500'}
                />
              </Tooltip>
            )}
          </div>
        ),
      },
      {
        title: 'Nội dung công việc',
        dataIndex: 'purpose',
        key: 'purpose',
        width: 270,
        render: (text, record) => (
          <>
            <Tooltip placement="topLeft" title={text}>
              <p
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {text}
              </p>
            </Tooltip>
            <div className="flex items-center gap-1 mt-1">
              <div
                style={{ backgroundColor: vehicleRequestPriority[record.priority].color }}
                className="size-1.5 rounded-full"
              ></div>
              <span className="text-xs">{vehicleRequestPriority[record.priority].label}</span>
              <Tag color={vehicleRequestStatus[record.status].color} className="rounded-full ml-2">
                {vehicleRequestStatus[record.status].label || record.status}
              </Tag>
            </div>
          </>
        ),
      },
      {
        title: 'Người sử dụng xe',
        dataIndex: 'userName',
        key: 'userName',
        width: 190,
        ellipsis: {
          showTitle: false,
        },
        render: (_, record) => (
          <div>
            <p>{record.user.name}</p>
            <p>
              {formatDayjsDate(record.startDateTime)} - {formatDayjsDate(record.endDateTime)}
            </p>
          </div>
        ),
      },
      {
        title: 'Dự án',
        dataIndex: 'projectName',
        key: 'projectName',
        width: 200,
        ellipsis: {
          showTitle: false,
        },
        render: (text, record) =>
          record.projectId ? (
            <Tooltip placement="topLeft" title={text}>
              <Link to={`/${lang}${routerLinks('Construction')}/${record.projectId}/construction-monitor`}>
                {text || '-'}
              </Link>
            </Tooltip>
          ) : (
            '-'
          ),
      },
      {
        title: 'Chặng đường',
        dataIndex: 'locations',
        key: 'locations',
        width: 200,
        ellipsis: {
          showTitle: false,
        },
        render: (_, record) => (
          <>
            <p>
              <span className="text-xs italic text-neutral-500">Từ</span>
              <span> {record.departureLocation}</span>
            </p>
            <p>
              <span className="text-xs italic text-neutral-500">Đến</span>
              <span> {record.destinationLocation}</span>
            </p>
          </>
        ),
      },
      {
        key: 'action',
        width: 80,
        align: 'center',
        fixed: 'right',
        render: (_, record) => {
          const itemsMenu: ItemType[] = [
            {
              key: 0,
              label: (
                <Link
                  to={`/${lang}${routerLinks('VehicleRequest')}/${record?.id}`}
                  className="px-3 py-2 block text-gray-900 hover:!text-blue-500"
                >
                  Xem chi tiết
                </Link>
              ),
              style: {
                padding: 0,
              },
            },
          ];

          if ([vehicleRequestStatus.Draft.value, vehicleRequestStatus.Rejected.value].includes(record.status)) {
            itemsMenu.push(
              {
                key: 1,
                label: (
                  <Tooltip
                    title={
                      !rightMapFacade.rightData?.rightCodes?.includes('UPDATE')
                        ? 'Bạn không có quyền thực hiện thao tác này'
                        : null
                    }
                  >
                    <div
                      className={`${!rightMapFacade.rightData?.rightCodes?.includes('UPDATE') ? 'cursor-not-allowed' : ''}`}
                    >
                      <Link
                        to={`/${lang}${routerLinks('VehicleRequest')}/${record?.id}/edit`}
                        className={`px-3 py-2 block ${!rightMapFacade.rightData?.rightCodes?.includes('UPDATE') ? 'pointer-events-none !text-gray-500' : 'text-gray-900 hover:!text-blue-500'}`}
                      >
                        Chỉnh sửa
                      </Link>
                    </div>
                  </Tooltip>
                ),
                style: {
                  padding: 0,
                },
              },
              {
                key: 2,
                label: (
                  <Tooltip
                    title={
                      !rightMapFacade.rightData?.rightCodes?.includes('SENDAPPROVAL')
                        ? 'Bạn không có quyền thực hiện thao tác này'
                        : null
                    }
                  >
                    <div
                      className={`${!rightMapFacade.rightData?.rightCodes?.includes('SENDAPPROVAL') ? 'cursor-not-allowed' : ''}`}
                    >
                      <p
                        onClick={() => handleSendForApproval(record?.id)}
                        className={`px-3 py-2 block ${!rightMapFacade.rightData?.rightCodes?.includes('SENDAPPROVAL') ? 'pointer-events-none !text-gray-500' : 'text-gray-900 hover:!text-blue-500'}`}
                      >
                        Gửi duyệt
                      </p>
                    </div>
                  </Tooltip>
                ),
                style: {
                  padding: 0,
                },
              },
            );
          }

          if (
            [
              vehicleRequestStatus.Draft.value,
              vehicleRequestStatus.Rejected.value,
              vehicleRequestStatus.Approved.value,
              vehicleRequestStatus.Shared.value,
            ].includes(record.status)
          ) {
            itemsMenu.push({
              key: 3,
              label: (
                <p onClick={() => handleDelete(record?.id)} className="text-gray-900 hover:!text-blue-500">
                  Xoá
                </p>
              ),
            });
          }

          if (
            [vehicleRequestStatus.PendingApproval.value, vehicleRequestStatus.WaitingForSharing.value].includes(
              record.status,
            )
          ) {
            itemsMenu.push(
              {
                key: 4,
                label: (
                  <Tooltip
                    title={
                      !rightMapFacade.rightData?.rightCodes?.includes('APPROVE')
                        ? 'Bạn không có quyền thực hiện thao tác này'
                        : null
                    }
                  >
                    <div
                      className={`${!rightMapFacade.rightData?.rightCodes?.includes('APPROVE') ? 'cursor-not-allowed' : ''}`}
                    >
                      <p
                        onClick={() => handleReject(record?.id)}
                        className={`px-3 py-2 block ${!rightMapFacade.rightData?.rightCodes?.includes('APPROVE') ? 'pointer-events-none !text-gray-500' : 'text-gray-900 hover:!text-blue-500'}`}
                      >
                        Từ chối
                      </p>
                    </div>
                  </Tooltip>
                ),
                style: {
                  padding: 0,
                },
              },
              {
                key: 5,
                label: (
                  <Tooltip
                    title={
                      !rightMapFacade.rightData?.rightCodes?.includes('APPROVE')
                        ? 'Bạn không có quyền thực hiện thao tác này'
                        : null
                    }
                  >
                    <div
                      className={`${!rightMapFacade.rightData?.rightCodes?.includes('APPROVE') ? 'cursor-not-allowed' : ''}`}
                    >
                      <p
                        onClick={() => handleApprove(record?.id, record.status)}
                        className={`px-3 py-2 block ${!rightMapFacade.rightData?.rightCodes?.includes('APPROVE') ? 'pointer-events-none !text-gray-500' : 'text-gray-900 hover:!text-blue-500'}`}
                      >
                        Phê duyệt
                      </p>
                    </div>
                  </Tooltip>
                ),
                style: {
                  padding: 0,
                },
              },
            );
          }

          const isDropdownShow = !!itemsMenu.length;

          return (
            <Space size={0}>
              <Dropdown
                placement="bottomRight"
                trigger={isDropdownShow ? ['click'] : []}
                menu={{
                  items: isDropdownShow ? itemsMenu : [],
                }}
                disabled={!isDropdownShow}
              >
                <Button type="text" icon={<MoreOutlined />} />
              </Dropdown>
            </Space>
          );
        },
      },
    ],
    [vehicleRequestFacade.pagination, warningRequest],
  );

  const loadData = (
    query: { page?: number; size?: number; filter?: Record<string, any>; sort?: string },
    force?: boolean,
  ) => {
    setSearchParams((x) => {
      ['page', 'size', 'sort'].forEach((field) => {
        const value = query[field as keyof typeof query] ?? queryParams[field as keyof typeof queryParams];

        x.delete(field);

        if (value != queryDefaultValue[field as keyof typeof queryDefaultValue]) {
          x.set(field, value.toString());
        }
      });

      const combinedFilter = {
        ...queryParams.filter,
        ...(query.filter ?? {}),
      };

      Object.entries(combinedFilter).forEach(([key, value]) => {
        if (value == null || (typeof value === 'string' && !value)) {
          delete combinedFilter[key];
        }
      });

      if (!isEqual(combinedFilter, oldQueryParams.current.filter)) {
        x.delete('page');
      }

      const filterJson = JSON.stringify(combinedFilter);

      x.delete('filter');

      if (filterJson != queryDefaultValue.filter) {
        x.set('filter', filterJson);
      }

      return x;
    });

    if (force) {
      forceReload.current = true;
    }
  };

  const handleApprove = (id: string, status: string) => {
    modal.confirm({
      title: `Xác nhận phê duyệt yêu cầu ${status === vehicleRequestStatus.PendingApproval.value ? 'xin' : 'ghép'} xe?`,
      content: `Bạn có chắc chắn muốn phê duyệt yêu cầu ${
        status === vehicleRequestStatus.PendingApproval.value ? 'xin' : 'ghép'
      } xe này không?`,
      okText: 'Phê duyệt',
      cancelText: 'Hủy',
      onOk: () => {
        if (id) {
          const messageKey = uuidv4();
          customMessage.loading({ content: 'Đang phê duyệt...', duration: 60000, key: messageKey });
          let promise: Promise<any> | undefined = undefined;

          if (status === vehicleRequestStatus.PendingApproval.value) {
            promise = vehicleRequestFacade.processApproval({ id, isApproved: true, rejectNotes: '' });
          } else if (status === vehicleRequestStatus.WaitingForSharing.value) {
            promise = vehicleRequestFacade.approveVehicleSharing(id);
          }

          promise?.finally(() => {
            customMessage.destroy(messageKey);
          });
        }
      },
    });
  };

  const handleReject = (id: string) => {
    modal.confirm({
      title: 'Từ chối yêu cầu',
      content: (
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="rejectNotes"
            label="Lý do từ chối"
            rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối' }]}
          >
            <Input.TextArea className="w-full" placeholder="Nhập lý do từ chối yêu cầu xin xe" rows={2} />
          </Form.Item>
        </Form>
      ),
      okText: 'Từ chối',
      cancelText: 'Hủy bỏ',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const values = await rejectForm.validateFields();

          if (id) {
            const messageKey = uuidv4();
            customMessage.loading({ content: 'Đang xử lý...', duration: 60000, key: messageKey });
            vehicleRequestFacade
              .processApproval({ id, isApproved: false, rejectNotes: values.rejectNotes })
              .finally(() => {
                customMessage.destroy(messageKey);
                rejectForm.resetFields();
              });
          }
        } catch {
          return await Promise.reject();
        }
      },
      onCancel: () => {
        rejectForm.resetFields();
      },
    });
  };

  const handleSendForApproval = (id: string) => {
    modal.confirm({
      title: 'Xác nhận gửi duyệt yêu cầu xin xe?',
      content: 'Bạn có chắc chắn muốn gửi duyệt yêu cầu xin xe này không?',
      okText: 'Gửi',
      cancelText: 'Hủy',
      onOk: () => {
        if (id) {
          const messageKey = uuidv4();
          customMessage.loading({ content: 'Đang gửi duyệt...', duration: 60000, key: messageKey });
          vehicleRequestFacade.submitForApproval(id).finally(() => {
            customMessage.destroy(messageKey);
          });
        }
      },
    });
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: 'Xác nhận xoá yêu cầu xin xe?',
      content: 'Bạn có chắc chắn muốn xoá yêu cầu này không?',
      okText: 'Xoá',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        if (id) {
          const messageKey = uuidv4();
          customMessage.loading({ content: 'Đang xoá yêu cầu...', duration: 60000, key: messageKey });
          vehicleRequestFacade.delete(id).finally(() => {
            customMessage.destroy(messageKey);
          });
        }
      },
    });
  };

  const filterTagsList = useMemo(() => {
    const data: [string, string, string][] = [];
    const availableFilterField = Object.keys(filterFieldNameMap);

    Object.entries(queryParams.filter).forEach(([key, value]) => {
      if (!availableFilterField.includes(key)) {
        return;
      }

      let stringValue = '';

      switch (key) {
        case 'fullTextSearch':
        case 'requestCode':
          stringValue = value;
          break;
        case 'createdByUserId':
        case 'userId':
          if (!isLoadAllData(userFacade)) {
            userFacade.get({ size: -1 });
          }
          stringValue = userFacade.pagination?.content.find((x) => x.id === value)?.name || value;
          break;
        case 'priority':
          stringValue = vehicleRequestPriority[value as keyof typeof vehicleRequestPriority].label;
          break;
        case 'createdDateRange':
        case 'usageDateRange':
          stringValue = `${formatDayjsDate(value[0])} - ${formatDayjsDate(value[1])}`;
          break;
        case 'departmentId':
          stringValue = codeTypeFacade.organizationData?.content.find((x) => x.id === value)?.title || value;
          break;
        case 'projectId':
          if (!isLoadAllData(constructionFacade)) {
            constructionFacade.get({ size: -1 });
          }
          stringValue = constructionFacade.pagination?.content.find((x) => x.id === value)?.name || value;
          break;
        case 'status':
          stringValue = vehicleRequestStatus[value as keyof typeof vehicleRequestStatus].label;
          break;
        case 'requestedVehicleTypeId':
          if (!isLoadAllData(loaiXeFacade)) {
            loaiXeFacade.get({ size: -1 });
          }
          stringValue = loaiXeFacade.pagination?.content.find((x) => x.id === value)?.tenLoaiXe || value;
          break;
        case 'requestedVehicleId':
          if (!isLoadAllData(phuongTienFacade)) {
            phuongTienFacade.get({ size: -1 });
          }
          stringValue = phuongTienFacade.pagination?.content.find((x) => x.id === value)?.bienSoXe || value;
          break;
      }

      data.push([key, filterFieldNameMap[key as keyof typeof filterFieldNameMap], stringValue]);
    });

    return (
      <>
        {data.map((x) => (
          <Tag
            key={x[0]}
            className="rounded-full py-0.5"
            color="#E6F4FF"
            closable
            closeIcon={<CloseOutlined className="p-0.5 rounded hover:bg-slate-200" style={{ color: '#1890ff' }} />}
            onClose={() => loadData({ filter: { [x[0]]: undefined } })}
          >
            <span className="text-black pl-0.5 text-sm">
              {x[1]}
              {': '}
              {x[2]}
            </span>
          </Tag>
        ))}
      </>
    );
  }, [
    queryParams.filter,
    userFacade.pagination,
    codeTypeFacade.organizationData,
    constructionFacade.pagination,
    loaiXeFacade.pagination,
    phuongTienFacade.pagination,
  ]);

  useEffect(() => {
    rightMapFacade.getRightMapByCode('VEHICLEREQUEST');
  }, []);

  useEffect(() => {
    switch (vehicleRequestFacade.status) {
      case EStatusState.deleteFulfilled:
      case EstatusVehicleRequest.processApprovalFulfilled:
      case EstatusVehicleRequest.submitForApprovalFulfilled:
      case EstatusVehicleRequest.submitVehicleSharingFulfilled:
      case EstatusVehicleRequest.approveVehicleSharingFulfilled:
        loadData({}, true);
        break;
    }
  }, [vehicleRequestFacade.status]);

  useEffect(() => {
    if (isEqual(queryParams, oldQueryParams.current) && !forceReload.current) {
      return;
    }

    forceReload.current = false;
    oldQueryParams.current = queryParams;
    vehicleRequestFacade.get({
      ...queryParams,
      filter: JSON.stringify(queryParams.filter),
    });
  }, [queryParams, forceReload.current]);

  return (
    <>
      <Card styles={{ body: { padding: 0 } }}>
        <div className="flex gap-4 p-4">
          <div className="flex-1">
            <SearchWidget
              form={(form) => (formRef.current = form)}
              callback={(value) => loadData({ filter: { fullTextSearch: value } })}
              placeholder="Tìm kiếm theo nội dung công việc, người sử dụng xe, công trình/dự án..."
              value={queryParams.filter?.fullTextSearch}
            />
          </div>
          <Select
            placeholder="Chọn công trình/dự án"
            className="w-52"
            showSearch
            optionFilterProp="label"
            allowClear
            options={constructionList}
            value={queryParams.filter?.projectId}
            onChange={(value) => {
              loadData({ filter: { projectId: value }, page: 1 });
            }}
          />
          <Select
            placeholder="Chọn trạng thái"
            className="w-40"
            showSearch
            optionFilterProp="label"
            allowClear
            options={statusList}
            value={queryParams.filter?.status}
            onChange={(value) => {
              loadData({ filter: { status: value }, page: 1 });
            }}
          />
          <Button
            icon={<ReloadOutlined />}
            loading={vehicleRequestFacade.isLoading}
            onClick={loadData.bind(null, {}, true)}
          >
            Tải lại
          </Button>
          <FilterDrawer filter={queryParams.filter} loadFunc={(filter, force) => loadData({ filter }, force)} />
        </div>
        <div ref={filterTagsContainer} className="flex flex-wrap gap-y-2 justify-start px-4 pb-4 empty:pb-0">
          {filterTagsList}
        </div>
        <Table
          scroll={{ y: `calc(100vh - 382px - ${filterTagsContainer.current?.clientHeight ?? 0}px)` }}
          dataSource={dataSource}
          columns={columns as any}
          loading={vehicleRequestFacade.isLoading}
          pagination={{
            defaultPageSize: queryDefaultValue.size,
            current: vehicleRequestFacade?.pagination?.page || 1,
            total: vehicleRequestFacade?.pagination?.totalElements || 0,
            onChange: (newPage, newSize) => loadData({ page: newPage, size: newSize }),
          }}
        />
      </Card>
      <VehicleShareModal />
    </>
  );
};

export default VehicleRequestTable;
