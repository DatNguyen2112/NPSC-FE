import React from 'react';
import { Button, Col, Row } from 'antd';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { CashbookTransactionFacade } from '@store';

// Define types for the props
interface MenuComponentProps {
  dateSelectedShow: boolean | undefined;
  handleClick: () => void;
  menuItems: { key: string; label: string }[];
  handleMenuClick: (value: string) => void;
  handleOptionClick?: () => void;
  dateRangeType: string;
  dashboardFacade: ReturnType<typeof CashbookTransactionFacade>;
}

const { RangePicker } = DatePicker;
const MenuComponent: React.FC<MenuComponentProps> = ({
                                                       dateSelectedShow,
                                                       handleClick,
                                                       menuItems,
                                                       handleMenuClick,
                                                       handleOptionClick,
                                                       dateRangeType,
                                                       dashboardFacade
                                                     }) => (
  <Row className="max-w-sm mx-auto p-4 bg-white border border-gray-300 rounded-md shadow-md" gutter={[8, 8]}>
    {menuItems.map((item) => (
      <Col span={12} key={item.key}>
        <Button
          className={`hover:bg-gray-100 text-gray-700 w-full rounded-md text-sm `}
          onClick={() => handleMenuClick(item.key)}
        >
          {item.label}
        </Button>
      </Col>
    ))}
    <Col span={24}>
      <Button className={`hover:bg-gray-200 text-gray-700 w-full rounded-md text-sm`} onClick={handleOptionClick}>
        Tuỳ chọn
      </Button>
    </Col>
    {dateSelectedShow && (
      <Col span={24}>
        <RangePicker
          onChange={(values) => {
            const dateRange = [
              dayjs(values?.[0]).format('YYYY-MM-DD'),
              dayjs(values?.[1]).format('YYYY-MM-DD')
            ];
            switch (dateRangeType) {
              case 'dateRange':
                dashboardFacade.set({ date: dateRange });
                break;
              case 'dateRangeTop5':
                dashboardFacade.set({ dateRangeTop5: dateRange });
                break;
              case 'dateRangeTopDebt':
                dashboardFacade.set({ dateRangeTopDebt: dateRange });
                break;
              case 'dateRangeReturned':
                dashboardFacade.set({ dateRangeReturned: dateRange });
                break;
              case 'dateRangeCombine':
                dashboardFacade.set({ dateRangeCombine: dateRange });
                break;

            }
          }}
          format="DD-MM-YYYY"
          className="w-full"
        />
      </Col>
    )}
    <Col span={24}>
      <Button type="primary" className="w-full" onClick={handleClick}>
        Lọc
      </Button>
    </Col>
  </Row>
);

export default MenuComponent;
