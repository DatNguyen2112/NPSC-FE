import { PhuongTienModel, VehicleRequestFacade, vehicleRequestStatus, VehicleRequestViewModel } from '@store';
import { Avatar, Card, Popover, Tooltip } from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { LinkOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatDayjsDate, lang, routerLinks } from '@utils';
import { groupBy } from 'underscore';

/**
 * Sinh màu theo chuỗi, cho phép dao động S & L trong biên độ nhỏ.
 *
 * @param str        Chuỗi nguồn
 * @param satBase    Saturation trung tâm (%). Mặc định 60
 * @param satDelta   Biên độ ± cho Saturation (%). Mặc định 10  → 50–70 %
 * @param lightBase  Lightness trung tâm (%). Mặc định 85
 * @param lightDelta Biên độ ± cho Lightness (%). Mặc định 5   → 80–90 %
 */
export function stringToColor(str: string, satBase = 60, satDelta = 10, lightBase = 85, lightDelta = 5): string {
  /** 1) Tạo hash nguyên */
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  /** 2) Hue cố định từ hash */
  const hue = Math.abs(hash) % 360;

  /** 3) Lấy thêm bit hash để "lắc" S & L */
  const satVar = ((hash >> 8) & 0xff) / 0xff; // 0–1
  const lightVar = ((hash >> 16) & 0xff) / 0xff; // 0–1

  const saturation = clamp(satBase - satDelta + satVar * satDelta * 2, 0, 100);
  const lightness = clamp(lightBase - lightDelta + lightVar * lightDelta * 2, 0, 100);

  return hslToHex(hue, saturation, lightness);
}

/** HSL → #RRGGBB  */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));

  const toHex = (x: number) => x.toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const VehicleRequestGanttChart: React.FC = () => {
  const ganttContainer = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);
  const lastMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const vehicleRequestFacade = VehicleRequestFacade();
  const [cellWidth, setCellWidth] = useState(84);
  const chartData = useMemo(() => {
    const medianDate = vehicleRequestFacade.chartData?.date
      ? dayjs(vehicleRequestFacade.chartData?.date)
      : dayjs().startOf('day');
    const startDate = medianDate.subtract(7, 'day').startOf('day');
    const dateRange = Array(15)
      .fill(undefined)
      .map((_, i) => startDate.add(i, 'day'));
    const vehicleMap: Record<
      string,
      {
        info: PhuongTienModel;
        color: string;
        requests: {
          cols: [number, number];
          data: VehicleRequestViewModel[];
          provedRequest: VehicleRequestViewModel;
        }[];
      }
    > = {};

    const groupBySharingGroup = Object.values(
      groupBy(vehicleRequestFacade.chartData?.data.content ?? [], 'sharingGroupId'),
    );

    [
      ...groupBySharingGroup.filter((x) => x[0].sharingGroupId),
      ...groupBySharingGroup
        .filter((x) => !x[0].sharingGroupId)
        .flatMap((x) => x)
        .map((x) => [x]),
    ]
      .filter((x) => x[0].requestedVehicleId)
      .forEach((items) => {
        const item = items.sort((a, b) => dayjs(b.endDateTime).diff(dayjs(a.endDateTime)))[0];
        if (!vehicleMap[item.requestedVehicleId!]) {
          vehicleMap[item.requestedVehicleId!] = {
            info: item.requestedVehicle!,
            color: stringToColor(item.requestedVehicle?.id ?? ''),
            requests: [],
          };
        }

        const startDiff = Math.max(0, dayjs(item.startDateTime).startOf('day').diff(startDate, 'day'));
        const endDiff = Math.max(
          startDiff,
          Math.min(14, dayjs(item.endDateTime).startOf('day').diff(startDate, 'day')),
        );

        vehicleMap[item.requestedVehicleId!].requests.push({
          cols: [startDiff, endDiff],
          data: items,
          provedRequest: items.find((x) => x.status === vehicleRequestStatus.Approved.value) ?? items[0],
        });
      });

    return {
      dateRange,
      vehicles: Object.values(vehicleMap),
    };
  }, [vehicleRequestFacade.chartData?.date]);
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    lastMousePosition.current = { x: e.clientX, y: e.clientY };
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const selectedDate = vehicleRequestFacade.chartData?.date ? dayjs(vehicleRequestFacade.chartData?.date) : undefined;

    if (vehicleRequestFacade.needReloadChart || selectedDate?.diff(dayjs().startOf('day'), 'day') !== 0) {
      vehicleRequestFacade.getRequestForChart();
    }
  }, [vehicleRequestFacade.needReloadChart]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current && ganttContainer.current) {
        const deltaX = e.clientX - lastMousePosition.current.x;
        ganttContainer.current.scrollLeft -= deltaX;

        const deltaY = e.clientY - lastMousePosition.current.y;
        ganttContainer.current.scrollTop -= deltaY;

        lastMousePosition.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.userSelect = '';
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        setCellWidth((prevWidth) => {
          const newWidth = prevWidth - e.deltaY / 25;
          return Math.max(72, Math.min(200, newWidth));
        });
      }
    };

    const container = ganttContainer.current!;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <Card styles={{ body: { padding: 16, height: 'calc(100vh - 191px)' } }}>
      <div ref={ganttContainer} className="h-full miniScroll overflow-auto relative">
        <div className="size-fit min-h-full relative">
          <div
            style={{ gridTemplateColumns: `auto repeat(${chartData.dateRange.length}, ${cellWidth}px)` }}
            className="absolute top-0 left-0 grid size-full gap-x-1 pt-[58px] *:h-full"
          >
            <div className="bg-white w-32 sticky left-0 z-[1]"></div>
            {chartData.dateRange.map((_, i) => (
              <div key={i} className="bg-slate-100 rounded-t-md"></div>
            ))}
          </div>
          <div
            style={{ gridTemplateColumns: `auto repeat(${chartData.dateRange.length}, ${cellWidth}px)` }}
            className="grid z-[3] sticky top-0 *:text-center *:font-medium bg-white gap-x-1 -mb-1"
          >
            <div className="w-32 sticky left-0 bg-white p-4">Xe/Ngày</div>
            {chartData.dateRange.map((date, i) => (
              <Tooltip key={i} title={date.format('DD/MM/YYYY')} mouseEnterDelay={0.5}>
                <div className="p-4 bg-slate-200 rounded-md">{date.format('DD/MM')}</div>
              </Tooltip>
            ))}
          </div>
          {chartData.vehicles.map((vehicle, i) => (
            <div
              key={i}
              style={{ gridTemplateColumns: `auto repeat(${chartData.dateRange.length}, ${cellWidth}px)` }}
              className="grid h-24 gap-x-1 *:h-full relative"
            >
              <div className="w-32 sticky left-0 p-4 flex flex-col items-center justify-center bg-white z-[2]">
                <span className="font-medium">{vehicle.info.bienSoXe}</span>
                <span className="text-black/50 text-xs font-medium">({vehicle.info.loaiXe?.tenLoaiXe})</span>
              </div>
              {vehicle.requests.map((request, i) => (
                <div
                  key={i}
                  style={{ gridColumnStart: request.cols[0] + 2, gridColumnEnd: request.cols[1] + 3, gridRow: 1 }}
                  className="py-2"
                >
                  <div
                    style={{ backgroundColor: vehicle.color }}
                    className="relative rounded-md h-full flex justify-center items-center gap-3 p-2 group z-[1]"
                  >
                    {/* <Link
                      className="absolute right-1.5 top-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                      to={`/${lang}${routerLinks('VehicleRequest')}/${request.data.id}`}
                    >
                      <LinkOutlined />
                    </Link> */}
                    <Avatar.Group
                      size={44}
                      max={{
                        count: Math.min(2, request.cols[1] - request.cols[0] + 1),
                        style: { color: '#f56a00', backgroundColor: '#fde3cf', marginLeft: -16 },
                      }}
                    >
                      {request.data.map((item) => (
                        <Popover
                          key={item.id}
                          content={
                            <div key={item.id}>
                              <p>
                                <span className="text-gray-500">Người sử dụng xe: </span>
                                {item.user.name} ({item.numPassengers} người)
                              </p>
                              <p>
                                <span className="text-gray-500">Thời gian sử dụng: </span>
                                {formatDayjsDate(item.startDateTime)} - {formatDayjsDate(item.endDateTime)}
                              </p>
                              <p>
                                <span className="text-gray-500">Điểm xuất phát: </span>
                                {item.departureLocation}
                              </p>
                              <p>
                                <span className="text-gray-500">Nơi đến: </span>
                                {item.destinationLocation}
                              </p>
                            </div>
                          }
                        >
                          <Avatar
                            className={`min-w-11 [&:not(:first-child)]:!-ml-4 ${!item.user.avatarUrl ? 'bg-green-500' : 'bg-white'}`}
                            src={item.user.avatarUrl}
                          >
                            {!item.user.avatarUrl && item.user.name?.charAt(0)}
                          </Avatar>
                        </Popover>
                        // <Tooltip key={item.id} title={item.user.name}>
                        //   <Avatar
                        //     className={`min-w-11 [&:not(:first-child)]:!-ml-4 ${!item.user.avatarUrl ? 'bg-green-500' : 'bg-white'}`}
                        //     src={item.user.avatarUrl}
                        //   >
                        //     {!item.user.avatarUrl && item.user.name?.charAt(0)}
                        //   </Avatar>
                        // </Tooltip>
                      ))}
                    </Avatar.Group>
                    {request.cols[1] - request.cols[0] > Math.max(0, Math.min(1, request.data.length - 1)) && (
                      <div className="flex-1 overflow-hidden">
                        <p className="font-medium text-ellipsis overflow-hidden whitespace-nowrap">
                          {request.provedRequest.user.name}
                        </p>
                        <Tooltip title={request.provedRequest.destinationLocation} mouseEnterDelay={0.5}>
                          <p
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                            className="text-black/60 text-xs"
                          >
                            {request.provedRequest.destinationLocation}
                          </p>
                        </Tooltip>
                        {request.data.length > 1 && <p className="text-xs italic mt-1">Đã ghép xe</p>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div onMouseDown={handleMouseDown} className="opacity-0 absolute top-0 left-32 right-0 bottom-0"></div>
        </div>
      </div>
    </Card>
  );
};

export default VehicleRequestGanttChart;
