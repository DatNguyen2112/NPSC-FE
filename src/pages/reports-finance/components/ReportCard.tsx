import { Card, Col, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { lang, routerLinks } from '@utils';

export interface ReportCardProps {
  title: string;
  description: string;
  icon: string;
  link: string;
  alt: string;
}

export const ReportCard: React.FC<ReportCardProps> = ({ title, description, icon, link, alt }) => (
  <Col xs={24} sm={24} md={12} lg={12}>
    <Card hoverable className="h-full transition-all duration-300 hover:shadow-lg">
      <Link to={`/${lang}${routerLinks(link)}`}>
        <div className="flex items-center gap-5">
          <div className="flex-shrink-0">
            <img src={icon} alt={alt} className="w-12 h-12" />
          </div>
          <div className="flex-1">
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
