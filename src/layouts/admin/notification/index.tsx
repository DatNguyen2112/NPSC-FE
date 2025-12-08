import {
  BellOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  ExclamationCircleOutlined,
  HourglassOutlined,
  LoginOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Pagination } from '@models';
import { unwrapResult } from '@reduxjs/toolkit';
import {
  EStatusTaskNotification,
  GlobalFacade,
  TaskFacade,
  TaskNotificationFacade,
  TaskNotificationModel,
} from '@store';
import { API, lang, linkApi, routerLinks } from '@utils';
import { App, Avatar, Badge, Button, Divider, Empty, Popover, Space, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';

dayjs.extend(isToday);
const renderAvatar = (notification: TaskNotificationModel) => {
  if (notification?.notificationStatus === 'WarningSoonExpire')
    return <ExclamationCircleOutlined className="text-yellow-500 text-[44px]" />;
  if (notification?.notificationStatus === 'Left')
    return <LogoutOutlined className="text-red-500 text-[44px] rotate-180" />;
  if (notification?.notificationStatus === 'Joined') return <LoginOutlined className="text-blue-500 text-[44px]" />;
  if (notification?.notificationStatus === 'Overdue' || notification?.notificationStatus === 'Due')
    return <ExclamationCircleOutlined className="text-red-500 text-[44px]" />;
  if (notification?.notificationStatus === 'StatusInProgress')
    return <HourglassOutlined className="text-blue-500 text-[44px]" />;
  if (notification?.notificationStatus === 'NextTaskCompletion')
    return <CheckCircleOutlined className="text-green-500 text-[44px]" />;
  return <Avatar size={44} src={notification?.avatarUrl} className="border-0" />;
};
const notificationSections: {
  name: string;
  condition: (n: TaskNotificationModel, today?: Dayjs) => boolean;
}[] = [
  {
    name: 'Hôm nay',
    condition: (x) => dayjs(x.createdOnDate).isToday(),
  },
  {
    name: 'Trước đó',
    condition: (x, y) => dayjs(x.createdOnDate).isBefore(y),
  },
];

const PopoverContent: React.FC = () => {
  const notificationFacade = TaskNotificationFacade();
  const globalFacade = GlobalFacade();
  const navigate = useNavigate();
  const taskFacade = TaskFacade();
  const { modal } = App.useApp();

  const notifications = useMemo(() => {
    const today = dayjs().startOf('D');
    return notificationSections.map((x) => ({
      name: x.name,
      data:
        (notificationFacade.isViewPrev ? notificationFacade.list : notificationFacade.list?.slice(0, 7))?.filter((n) =>
          x.condition(n, today),
        ) ?? [],
    }));
  }, [notificationFacade.list]);
  function onNotificationClicked(notification: TaskNotificationModel) {
    if (!notification.isRead) notificationFacade.putMarkAsRead(notification.id);
    if (window.location.hash.includes(notification?.task?.id || ''))
      taskFacade.getById({ id: notification?.task?.id || '' });

    if (notification?.additionalData && notification?.additionalData[0] === "ISSUE"){
      navigate(`/${lang}${routerLinks('IssueManagement')}/${notification?.additionalData[2]}/detail`);
      return
    }

    if (notification.notificationStatus.startsWith('VehicleRequest')) {
      navigate(`/${lang}${routerLinks('VehicleRequest')}/${notification.additionalData?.[1]}`);
    } else {
      navigate(
        `/${lang}${routerLinks('Task')}/${notification?.task?.constructionId}/edit-view/${notification?.task?.id}`,
      );
    }
  }

  async function viewPrev() {
    if (!notificationFacade.isViewPrev) {
      notificationFacade.set({
        isViewPrev: true,
      });
    }

    if (!notificationFacade.isPrevAvailable) return;

    const action = await notificationFacade.get({
      page: (notificationFacade.pagination?.page ?? 0) + 1,
      size: 8,
      filter: JSON.stringify({ userId: globalFacade.data?.userModel?.id }),
    });
    const response = unwrapResult(action);

    if (!response.data) return;

    const notiList = [...(notificationFacade.list ?? [])];
    const newNotiList = [...(response.data?.content ?? [])];

    notiList.forEach((x, i) => {
      const newNotiIndex = newNotiList.findIndex((n) => n.id === x.id);
      if (newNotiIndex === -1) return;
      notiList[i] = newNotiList[newNotiIndex];
      newNotiList.splice(newNotiIndex, 1);
    });

    notificationFacade.set({
      list: [...notiList, ...newNotiList],
      isPrevAvailable: response.data.page < response.data.totalPages,
    });
  }

  return (
    <div className="-m-3 w-[400px] rounded-lg overflow-hidden">
      <div className="max-h-[70vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        <Space className="w-full justify-between px-4 py-3 border-b border-gray-200" size={0}>
          <Typography.Text strong className="text-xl w-full">
            Thông báo
          </Typography.Text>
          <Button
            type="link"
            icon={<CheckOutlined className="text-xs" />}
            className="text-xs p-0 h-fit border-none shadow-none"
            onClick={() => {
              notificationFacade.putMarkAllReadUser(globalFacade.data?.userModel?.id || '');
            }}
            disabled={!notificationFacade.unreadCount}
          >
            Đánh dấu đã đọc
          </Button>
          <Button
            type="link"
            icon={<DeleteOutlined className="text-xs !p-0" />}
            className="text-xs p-0 h-fit border-none shadow-none"
            danger
            onClick={() => {
              modal.confirm({
                title: 'Xóa tất cả thông báo?',
                icon: <ExclamationCircleFilled />,
                content: 'Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa?',
                okText: 'Xoá',
                cancelText: 'Huỷ',
                onOk() {
                  notificationFacade.deleteAllByUser(globalFacade.data?.userModel?.id || '');
                },
              });
            }}
            disabled={!notificationFacade.list?.length}
          >
            Xóa thông báo
          </Button>
        </Space>
        {notifications.every((x) => x.data.length === 0) && (
          <>
            <Divider className="m-0" />
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Danh sách thông báo trống" />
          </>
        )}
        {notifications
          .filter((x) => x.data.length > 0)
          .map((section) => (
            <React.Fragment key={section.name}>
              <Divider className="m-0" />
              <div className="px-4 py-2">
                <Typography.Title level={5} className="!m-0">
                  {section.name}
                </Typography.Title>
              </div>
              <Divider className="m-0" />
              <div>
                {section.data.map((item, i) => (
                  <div
                    key={i}
                    className={`px-4 py-2 flex gap-2.5 justify-evenly cursor-pointer items-center ${item.isRead ? 'bg-white' : 'bg-cyan-50'}`}
                    onClick={() => onNotificationClicked(item)}
                  >
                    {renderAvatar(item)}
                    <div className="flex-1">
                      <Typography.Paragraph ellipsis={{ rows: 2 }} className="!m-0">
                        {/* {render(item, item.notificationStatus)?.avatar} */}
                        <div dangerouslySetInnerHTML={{ __html: item?.content || '' }} />
                        {/* {n.partedTitle.map((x, i) => {
                          if (x == null) {
                            return <span key={i}></span>;
                          }

                          return i % 2 === 0 ? (
                            <span key={i} className="font-medium">
                              {x}
                            </span>
                          ) : (
                            <span key={i}> {x} </span>
                          );
                        })} */}
                      </Typography.Paragraph>
                      <span className="text-gray-500"> {dayjs(item.createdOnDate).fromNow()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </React.Fragment>
          ))}
        <div className="p-4">
          <Button
            color="default"
            variant="filled"
            className="w-full font-medium border border-gray-200 hover:border-gray-300 active:border-gray-400"
            onClick={viewPrev}
            disabled={!notificationFacade.isPrevAvailable}
            loading={notificationFacade.isLoading}
          >
            {notificationFacade.isPrevAvailable ? 'Xem thông báo trước đó' : 'Không có thông báo trước đó'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const MemoizedPopoverContent = React.memo(PopoverContent);

const NotificationDropdown: React.FC = () => {
  const notificationFacade = TaskNotificationFacade();
  const globalFacade = GlobalFacade();

  useEffect(() => {
    switch (notificationFacade.status) {
      case EStatusTaskNotification.countUnreadPending:
        if (notificationFacade.list?.length) reloadNotifications();
        else
          notificationFacade
            .get({ page: 1, size: 8, filter: JSON.stringify({ userId: globalFacade.data?.userModel?.id }) })
            .then((x) => unwrapResult(x))
            .then((x) => {
              notificationFacade.set({
                list: [...(notificationFacade.list ?? []), ...(x.data?.content ?? [])],
                isPrevAvailable: (x.data?.page ?? 1) < (x.data?.totalPages ?? 1),
              });
            });
        break;
      case EStatusTaskNotification.putMarkAsReadFulfilled:
      case EStatusTaskNotification.putMarkAllReadUserFulfilled:
      case EStatusTaskNotification.deleteAllByUserFulfilled:
        notificationFacade.countUnread();
        break;
    }
  }, [notificationFacade.status]);

  async function reloadNotifications() {
    const name = 'TaskNotification';
    const response = await API.get<Pagination<TaskNotificationModel>>(`${routerLinks(name, 'api')}`, {
      page: 1,
      size: notificationFacade.list?.length,
      filter: JSON.stringify({ userId: globalFacade.data?.userModel?.id }),
    });
    notificationFacade.set({
      list: response?.data?.content,
    });
  }

  useEffect(() => {
    notificationFacade.requestNotification();
    const eventSource = new EventSource(`${linkApi}/task-notification/signal`);
    // Lấy dữ liệu từ server
    eventSource.onmessage = () => notificationFacade.countUnread();
    eventSource.onerror = () => eventSource.close(); // Đóng kết nối khi có lỗi
    return () => {
      eventSource.close(); // Đóng kết nối khi component bị unmount
    };
  }, []);

  return (
    <Popover trigger={['hover']} placement="bottomLeft" content={<MemoizedPopoverContent />}>
      <Badge count={notificationFacade.unreadCount ?? 0} overflowCount={99}>
        <Button className="p-0 size-7 border-none">
          <BellOutlined className="text-xl text-[#1677ff]" />
        </Button>
      </Badge>
    </Popover>
  );
};

export default NotificationDropdown;
