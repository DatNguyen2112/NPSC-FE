import { lang, routerLinks } from '@utils';
import { Card, Col, Row, Typography } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

interface ReportCardProps {
  title: string;
  description: string;
  icon: string;
  link: string;
  alt: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, description, icon, link, alt }) => (
  <Col span={12}>
    <Card hoverable>
      <Link to={`/${lang}${routerLinks(link)}`}>
        <div className="flex items-center gap-5">
          <img src={icon} alt={alt} />
          <div>
            <Typography.Title level={5} className="!mb-1">
              {title}
            </Typography.Title>
            <Typography.Text type="secondary">{description}</Typography.Text>
          </div>
        </div>
      </Link>
    </Card>
  </Col>
);

const reportItems: ReportCardProps[] = [
  {
    title: 'Sổ quỹ',
    description: 'Theo dõi các khoản thu chi của công ty',
    icon: '/assets/svgs/vouchers.svg',
    link: 'vouchers',
    alt: 'Sổ quỹ',
  },
  {
    title: 'Báo cáo công nợ khách hàng',
    description: 'Theo dõi các khoản công nợ phải thu hoặc phải trả khách hàng',
    icon: '/assets/svgs/debt-customers.svg',
    link: 'CustomerDebtReport',
    alt: 'Báo cáo công nợ khách hàng',
  },
  {
    title: 'Báo cáo công nợ nhà cung cấp',
    description: 'Theo dõi các khoản công nợ phải thu hoặc phải trả nhà cung cấp',
    icon: '/assets/svgs/debt-supplier.svg',
    link: 'SupplierDebtReport',
    alt: 'Báo cáo công nợ nhà cung cấp',
  },
  {
    title: 'Báo cáo dòng tiền',
    description: 'Theo dõi dòng tiền vào và ra của công ty',
    icon: '/assets/svgs/cash-flow-report.svg',
    link: 'CashFlowReport',
    alt: 'Báo cáo dòng tiền',
  },
];

export default function ReportFinance(): React.ReactElement {
  return (
    <div className="px-3.5 pt-4">
      <Typography.Title level={2}>Danh sách báo cáo tài chính</Typography.Title>
      <Row gutter={[16, 16]}>
        {reportItems.map((item, index) => (
          <ReportCard key={index} {...item} />
        ))}
      </Row>
    </div>
  );
}
