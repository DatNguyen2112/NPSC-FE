import { Button } from 'antd';
import React, { useEffect, useMemo } from 'react';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { lang, routerLinks } from '@utils';
import { Link, useSearchParams } from 'react-router-dom';
import { SubHeader } from '@layouts/admin';
import VehicleRequestTable from './table';
import { VehicleRequestFacade } from '@store';
import VehicleRequestGanttChart from './gantt-chart';
import ExportConfigModal from './export-config-modal';

const tabList = [
  {
    key: 'list',
    label: 'Danh sách',
  },
  {
    key: 'gantt',
    label: 'Biểu đồ Gantt',
  },
] as const;

const VehicleRequestPage: React.FC = () => {
  const vehicleRequestFacade = VehicleRequestFacade();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabKey: (typeof tabList)[number]['key'] = useMemo(() => {
    const tab = searchParams.get('tab');
    return tab && tabList.find((x) => x.key === tab) ? tab : (tabList[0].key as any);
  }, [searchParams]);

  const changeTab = (key: (typeof tabList)[number]['key']) => {
    setSearchParams((x) => {
      if (key === tabList[0].key) {
        x.delete('tab');
      } else {
        x.set('tab', key);
      }

      return x;
    });
  };

  useEffect(() => {
    return () => {
      vehicleRequestFacade.set({
        queryParams: undefined,
        needReloadChart: true,
        chartData: undefined,
      });
    };
  }, []);

  return (
    <>
      <SubHeader
        tool={
          <div className="pr-1 flex gap-1.5">
            <ExportConfigModal />
            <Link to={`/${lang}${routerLinks('VehicleRequest')}/create`}>
              <Button type="primary" icon={<PlusOutlined />}>
                Thêm mới
              </Button>
            </Link>
          </div>
        }
      />
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          {tabList.map((x) => (
            <Button
              className={`rounded border-none ${
                activeTabKey === x.key ? 'bg-white text-blue-500 font-semibold' : 'text-gray-500'
              }`}
              key={x.key}
              onClick={() => changeTab(x.key)}
            >
              {x.label}
            </Button>
          ))}
        </div>
        {activeTabKey === 'list' && <VehicleRequestTable />}
        {activeTabKey === 'gantt' && <VehicleRequestGanttChart />}
      </div>
    </>
  );
};

export default VehicleRequestPage;
