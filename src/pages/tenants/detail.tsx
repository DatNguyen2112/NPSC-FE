import { TenantFacade } from '../../store/tenants';
import { Button, Card, Col, Descriptions, Flex, Row, Space, Spin } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import React, { useEffect } from 'react';
import { lang, routerLinks } from '@utils';
import { useParams } from 'react-router';

const DetailPage = () => {
  const tenantFacade = TenantFacade();
  const { id } = useParams();

  useEffect(() => {
    id && tenantFacade.getById({ id });
  }, []);

  const tenantData = tenantFacade.data;

  return (
    <Spin spinning={tenantFacade.isFormLoading}>
      <Flex className={'bg-white h-12 sticky top-0 z-20 shadow-header'} justify="space-between" align="center">
        <Button color="default" variant="link" icon={<LeftOutlined />} href={`/#/${lang}${routerLinks('Tenant')}`}>
          Quay lại danh sách tenant
        </Button>
        <Space size={'small'} className={'pr-4'}></Space>
      </Flex>
      <div className="max-w-8xl mx-auto py-6 px-8">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title={'Thông tin tenant'}>
              <Descriptions
                column={2}
                items={[
                  { label: 'Tên', children: tenantData?.name },
                  { label: 'Subdomain', children: tenantData?.subDomain },
                  { label: 'Tên công ty', children: tenantData?.companyName },
                  { label: 'MST', children: tenantData?.mst },
                  { label: 'Email', children: tenantData?.email },
                  { label: 'Số điện thoại', children: tenantData?.phoneNumber },
                  { label: 'Ngày tạo', children: tenantData?.createdOnDate },
                  { label: 'Ngày cập nhật cuối', children: tenantData?.lastModifiedOnDate },
                  {
                    label: 'Logo',
                    children: (
                      <img
                        src={tenantData?.logo?.fileUrl}
                        alt="Tenant Logo"
                        style={{ maxWidth: '100px', maxHeight: '100px' }}
                      />
                    ),
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

export default DetailPage;
