import { ExclamationCircleFilled, InboxOutlined, LoadingOutlined } from '@ant-design/icons';
import { QueryParams } from '@models';
import { AnalyzeConstructionHasIssue, ConstructionFacade, InvestorFacade, InvestorViewModel } from '@store';
import { lang, routerLinks } from '@utils';
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import {
  AiOutlineBarChart,
  AiOutlineCluster,
  AiOutlineContacts,
  AiOutlineDollar,
  AiOutlineException,
  AiOutlineFileText,
  AiOutlineSketch,
} from 'react-icons/ai';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import DashboardChart from './BarChartDashboard';
import ContractChart from './ContractChart';
import DebtChart from './DebtBarChart';
import PieCharts from './HalfPieChart';
import PriorityDashboard from './PieChartDashboard';
import DebtBarChart from './RevenueBarDashboard';
import PriceBarChart from './StackChartDashboard';

let currentFilter: any;

interface DataType extends AnalyzeConstructionHasIssue {
  key: string;
}

function DashboardPage() {
  const constructionFacade = ConstructionFacade();
  const investorFacade = InvestorFacade();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formFilter] = Form.useForm();
  // const investorCodes = Form.useWatch('investorCodes', formFilter);
  // const deliveryDateArr = Form.useWatch('deliveryDateArr', formFilter);

  const [newArr, setNewArr] = useState<any>(['all']);

  const contentStyle: React.CSSProperties = {
    padding: 50,
    borderRadius: 4,
  };

  useEffect(() => {
    constructionFacade.set({
      activeTabDashboard: 'construction',
    });

    investorFacade.get({ size: -1 });

    // Thống kê dự án
    constructionFacade.getAnalyzeAllConstruction({ size: -1 });
  }, []);

  useEffect(() => {
    if (investorFacade.pagination?.content) {
      investorFacade.set({
        investorData: [
          {
            code: 'all',
            name: 'Tất cả',
          },
          ...(investorFacade?.pagination?.content?.map((item: any) => ({
            code: item?.code,
            name: item?.name,
          })) as any),
        ],
      });
    }
  }, [investorFacade.pagination?.content]);

  useEffect(() => {
    if (investorFacade?.investorData) {
      formFilter.setFieldsValue({
        investorCodes: newArr,
        deliveryDateArr: [dayjs(new Date())],
      });
    }
  }, [investorFacade?.investorData]);

  useEffect(() => {
    if (newArr) {
      handleSelectedInvestorCodes(newArr);
    }
  }, [newArr]);

  const handleChange = (value: string[]) => {
    // Nếu người dùng chọn "all"
    if (value.includes('all')) {
      // Nếu "all" vừa được chọn (so với giá trị cũ), thì reset thành chỉ ['all']
      if (!newArr.includes('all')) {
        setNewArr(['all']);
      } else {
        // Nếu đã chọn 'all' rồi, giờ chọn thêm cái khác → bỏ 'all' ra
        const filtered = value.filter((v) => v !== 'all');
        setNewArr(filtered);
      }
    } else {
      // Nếu không có 'all', set bình thường
      setNewArr(value);
    }
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

  const columns: ColumnsType<DataType> = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      align: 'center',
      width: 50,
    },
    {
      title: 'Tên dự án',
      dataIndex: 'constructionName',
      key: 'constructionName',
      align: 'left',
      width: 200,
      render: (value: any, record: any) => {
        return (
          <div className="flex gap-2">
            <Link to={`/${lang}${routerLinks('Construction')}/${record?.constructionId}/construction-monitor`}>
              {value}
            </Link>
            {record?.totalIssueExpired > 0 && (
              <Tooltip placement="top" title={`Dự án có ${record?.totalIssueExpired} vướng mắc đã quá hạn xử lý`}>
                <ExclamationCircleFilled className="text-red-500" />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: 'VM chưa xử lý',
      dataIndex: 'totalIssuePending',
      key: 'totalIssuePending',
      align: 'center',
      width: 100,
    },
    {
      title: 'VM quá hạn',
      dataIndex: 'totalIssueExpired',
      key: 'totalIssueExpired',
      align: 'center',
      width: 100,
      render: (value: any) => {
        return <p className="text-[#FF4D4F]">{value}</p>;
      },
    },
    {
      dataIndex: 'action',
      key: 'Action',
      align: 'center',
      width: 100,
      title: 'Thao tác',
      render: (value, record) => {
        return (
          <a
            className="hover:underline"
            onClick={() => {
              navigate(`/${lang}${routerLinks('IssueManagement')}`, {
                state: {
                  constructionId: record?.constructionId,
                },
              });
            }}
          >
            Xem
          </a>
        );
      },
    },
  ];

  const handleSelectedDeliveryDate = (value: string[]) => {
    currentFilter = JSON.parse(searchParams.get('filter') || '{}');
    currentFilter.deliveryDateArr = value?.map((item) => dayjs(item).format('YYYY'));

    const query: QueryParams = {
      page: 1,
      size: -1,
      filter: JSON.stringify(currentFilter),
    };

    // Thống kê doanh thu
    constructionFacade.getAnalyzeContractAll(query);
  };

  const handleSelectedInvestorCodes = (value: string[]) => {
    currentFilter = JSON.parse(searchParams.get('filter') || '{}');
    currentFilter.investorCodes = value;

    const query: QueryParams = {
      page: 1,
      size: -1,
      filter: JSON.stringify(
        currentFilter?.investorCodes?.length === 1 && currentFilter?.investorCodes?.includes('all')
          ? {}
          : currentFilter,
      ),
    };

    // Thống kê doanh thu
    constructionFacade.getAnalyzeContractAll(query);
  };

  return (
    <Spin spinning={constructionFacade.isLoading}>
      <div className={'py-4 px-4'}>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              onClick={() => {
                constructionFacade.set({ activeTabDashboard: 'construction' });

                // Thống kê dự án
                constructionFacade.getAnalyzeAllConstruction({ size: -1 });
              }}
              className={`px-4 py-2 rounded border-none ${
                constructionFacade?.activeTabDashboard === 'construction'
                  ? 'bg-white text-[#1890FF] font-semibold'
                  : 'text-gray-600'
              }`}
            >
              Dự án
            </Button>
            <Button
              onClick={() => {
                constructionFacade.set({ activeTabDashboard: 'revenue' });

                // Thống kê doanh thu
                constructionFacade.getAnalyzeContractAll({
                  size: -1,
                  filter: JSON.stringify({
                    deliveryDateArr: [2025],
                  }),
                });
              }}
              className={`px-4 py-2 rounded border-none ${
                constructionFacade?.activeTabDashboard === 'revenue'
                  ? 'bg-white text-[#1890FF] font-semibold'
                  : 'text-gray-600'
              }`}
            >
              Doanh thu
            </Button>
          </div>

          {constructionFacade?.activeTabDashboard === 'revenue' && (
            <Form form={formFilter} layout="inline">
              <Form.Item name="deliveryDateArr" label="Năm giao A">
                <DatePicker
                  className="min-w-[200px]"
                  onChange={(value: any[]) => {
                    handleSelectedDeliveryDate(value);
                  }}
                  placeholder="Chọn năm giao A"
                  multiple
                  picker="year"
                  format={'YYYY'}
                />
              </Form.Item>

              <Form.Item label="Chủ đầu tư">
                <Select
                  className="min-w-[500px]"
                  placeholder="Chọn chủ đầu tư"
                  mode="multiple"
                  value={newArr}
                  onChange={(newValue: string[]) => {
                    handleChange(newValue);
                  }}
                  options={investorFacade?.investorData?.map((item: InvestorViewModel) => ({
                    label: item?.name,
                    value: item?.code,
                  }))}
                />
              </Form.Item>
            </Form>
          )}
        </div>

        {constructionFacade.activeTabDashboard === 'construction' && (
          <Row gutter={[12, 12]} className="mt-4">
            <Col span={9}>
              <Card
                className="rounded-[10px] h-full"
                title={
                  <div className="flex gap-2 items-center">
                    <AiOutlineException className="text-[23px] text-[#FAAD14]" />
                    <p>Dự án theo tình trạng vướng mắc</p>
                  </div>
                }
              >
                <div className="flex justify-between">
                  <div>
                    <p>Tổng dự án</p>
                    <p className="text-[#1890FF] font-[500] text-[24px]">
                      {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                        ?.constructionAnalyzeByIssueData?.totalConstructionQuantity ?? 0}{' '}
                    </p>
                  </div>
                  <div>
                    <p>Có vướng mắc</p>
                    <div className="flex gap-1 items-center">
                      <p className="text-[#FF4D4F] font-[500] text-[24px]">
                        {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                          ?.constructionAnalyzeByIssueData?.totalConstructionHasIssueQuantity ?? 0}{' '}
                      </p>
                      <span className="text-[#ffa16e] text-[12px] font-[500]">
                        (
                        {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                          ?.constructionAnalyzeByIssueData?.constructionHasIssuePercent ?? 0}
                        %)
                      </span>
                    </div>
                  </div>
                  <div>
                    <p>Không vướng mắc</p>
                    <div className="flex gap-1 items-center">
                      <p className="text-[#52C41A] font-[500] text-[24px]">
                        {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                          ?.constructionAnalyzeByIssueData?.totalConstructionNotIssueQuantity ?? 0}{' '}
                      </p>
                      <span className="text-[#ffa16e] text-[12px] font-[500]">
                        (
                        {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                          ?.constructionAnalyzeByIssueData?.constructionNotIssuePercent ?? 0}
                        %)
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={9}>
              <Card
                className="rounded-[10px] h-full"
                title={
                  <div className="flex gap-2 items-center">
                    <AiOutlineCluster className="text-[23px] text-[#C41D7F]" />
                    <p>Dự án theo loại cấp điện áp</p>
                  </div>
                }
              >
                <div className="flex justify-between">
                  <div>
                    <p>110kV</p>
                    <div className="flex gap-1 items-center">
                      <p className="text-[#1890FF] font-[500] text-[24px]">
                        {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                          ?.constructionAnalyzeByVoltageData?.totalConstructionHas110kV ?? 0}{' '}
                      </p>
                      <span className="text-[#ffa16e] text-[12px] font-[500]">
                        (
                        {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                          ?.constructionAnalyzeByVoltageData?.constructionHas110kVPercent ?? 0}
                        % )
                      </span>
                    </div>
                  </div>
                  <div>
                    <p>220kV</p>
                    <div className="flex gap-1 items-center">
                      <p className="text-[#1890FF] font-[500] text-[24px]">
                        {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                          ?.constructionAnalyzeByVoltageData?.totalConstructionHas220kV ?? 0}{' '}
                      </p>
                      <span className="text-[#ffa16e] text-[12px] font-[500]">
                        (
                        {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                          ?.constructionAnalyzeByVoltageData?.constructionHas220kVPercent ?? 0}
                        % )
                      </span>
                    </div>
                  </div>
                  <div>
                    <p>Trung áp</p>
                    <div className="flex gap-1 items-center">
                      <p className="text-[#1890FF] font-[500] text-[24px]">
                        {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                          ?.constructionAnalyzeByVoltageData?.totalConstructionHasMediumVoltage ?? 0}{' '}
                      </p>
                      <span className="text-[#ffa16e] text-[12px] font-[500]">
                        (
                        {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                          ?.constructionAnalyzeByVoltageData?.constructionHasMediumVoltagePercent ?? 0}
                        % )
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card
                className="rounded-[10px] h-full"
                title={
                  <div className="flex gap-2 items-center">
                    <AiOutlineFileText className="text-[23px] text-[#52C41A]" />
                    <p>Dự án theo tình trạng hồ sơ</p>
                  </div>
                }
              >
                <div className="flex justify-between">
                  <div>
                    <p>Đã phê duyệt</p>
                    <div className="flex gap-1 items-center">
                      <p className="text-[#1890FF] font-[500] text-[24px]">
                        {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                          ?.constructionAnalyzeByDocumentStatusData?.totalConstructionApproved ?? 0}{' '}
                      </p>
                      <span className="text-[#ffa16e] text-[12px] font-[500]">
                        (
                        {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                          ?.constructionAnalyzeByDocumentStatusData?.constructionApprovedPercent ?? 0}
                        % )
                      </span>
                    </div>
                  </div>
                  <div>
                    <p>Chưa phê duyệt</p>
                    <div className="flex gap-1 items-center">
                      <p className="text-[#1890FF] font-[500] text-[24px]">
                        {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                          ?.constructionAnalyzeByDocumentStatusData?.totalConstructionNotApproved ?? 0}{' '}
                      </p>
                      <span className="text-[#ffa16e] text-[12px] font-[500]">
                        (
                        {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                          ?.constructionAnalyzeByDocumentStatusData?.constructionNotApprovedPercent ?? 0}
                        % )
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={6} md={6}>
              {/* Cột chứa cả hai Card */}
              <div className="flex flex-col gap-2">
                {/* Card 1: Dự án theo tình trạng */}
                <Card
                  className="rounded-[10px] h-full"
                  title={
                    <div className="flex gap-2 items-center">
                      <AiOutlineBarChart className="text-[23px] text-[#52C41A]" />
                      <p>Dự án theo tình trạng</p>
                    </div>
                  }
                >
                  <div className="flex justify-between">
                    <div>
                      <p>Đang thiết kế</p>
                      <div className="flex gap-1 items-center">
                        <p className="text-[#1890FF] font-[500] text-[24px]">
                          {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                            ?.constructionAnalyzeByStatusData?.totalConstructionIsDesigning ?? 0}{' '}
                        </p>
                        <span className="text-[#ffa16e] text-[12px] font-[500]">
                          (
                          {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                            ?.constructionAnalyzeByStatusData?.totalConstructionIsDesigningPercent ?? 0}
                          % )
                        </span>
                      </div>
                    </div>
                    <div>
                      <p>Giám sát tác giả</p>
                      <div className="flex gap-1 items-center">
                        <p className="text-[#1890FF] font-[500] text-[24px]">
                          {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                            ?.constructionAnalyzeByStatusData?.totalConstructionSupervisorAuthor ?? 0}{' '}
                        </p>
                        <span className="text-[#ffa16e] text-[12px] font-[500]">
                          (
                          {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                            ?.constructionAnalyzeByStatusData?.totalConstructionSupervisorAuthorPercent ?? 0}
                          % )
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Card 2: Hợp đồng theo loại dịch vụ tư vấn */}
                <Card
                  className="rounded-[10px] h-full"
                  title={
                    <div className="flex gap-2 items-center">
                      <AiOutlineContacts className="text-[23px] text-[#08979C]" />
                      <p className="truncate">Hợp đồng theo loại dịch vụ tư vấn</p>
                    </div>
                  }
                >
                  <div className="flex justify-between">
                    <div>
                      <p>KS, TK</p>
                      <div className="flex gap-1 items-center">
                        <p className="text-[#1890FF] font-[500] text-[24px]">
                          {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                            ?.constructionAnalyzeByConsultServiceData?.totalContractByKSTK ?? 0}{' '}
                        </p>
                        <span className="text-[#ffa16e] text-[12px] font-[500]">
                          (
                          {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                            ?.constructionAnalyzeByConsultServiceData?.contractByKSTKPercent ?? 0}
                          % )
                        </span>
                      </div>
                    </div>
                    <div>
                      <p>Thẩm tra</p>
                      <div className="flex gap-1 items-center">
                        <p className="text-[#1890FF] font-[500] text-[24px]">
                          {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                            ?.constructionAnalyzeByConsultServiceData?.totalContractByTest ?? 0}{' '}
                        </p>
                        <span className="text-[#ffa16e] text-[12px] font-[500]">
                          (
                          {constructionFacade.analyzeAllConstructionData?.constructionAnalyzeViewModelData
                            ?.constructionAnalyzeByConsultServiceData?.contractByTestPercent ?? 0}
                          % )
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </Col>
            <Col xs={12} md={9}>
              <Card
                className="rounded-[10px] h-full"
                bodyStyle={{ padding: '10px' }}
                title={
                  <div className="flex gap-2 items-center">
                    <p>Tỉ lệ dự án theo mức độ ưu tiên</p>
                  </div>
                }
              >
                {constructionFacade.analyzeAllConstructionData?.listConstructionAnalyzeByPriorityData != null ? (
                  <PriorityDashboard
                    title="Mức độ ưu tiên"
                    data={
                      constructionFacade.analyzeAllConstructionData?.listConstructionAnalyzeByPriorityData
                        ?.slice()
                        ?.sort((a: any, b: any) => {
                          const getLevelNumber = (str: string) => parseInt(str?.match(/\d+/)?.[0] ?? '0');
                          return getLevelNumber(a.name) - getLevelNumber(b.name);
                        }) ?? []
                    }
                  />
                ) : (
                  <div className="mt-[5%] flex justify-center items-center">
                    <Spin indicator={<LoadingOutlined spin />} size="large" tip={'Đang tải'}>
                      <div style={contentStyle} />
                    </Spin>
                  </div>
                )}
              </Card>
            </Col>
            <Col xs={12} md={9}>
              <Card
                className="rounded-[10px] h-full"
                bodyStyle={{ padding: '10px' }}
                title={
                  <div className="flex gap-2 items-center">
                    <p>Tỉ lệ dự án theo loại chủ đầu tư</p>
                  </div>
                }
              >
                {constructionFacade.analyzeAllConstructionData?.listConstructionAnalyzeByInvestorData != null ? (
                  <PriorityDashboard
                    title="Loại chủ đầu tư"
                    data={constructionFacade.analyzeAllConstructionData?.listConstructionAnalyzeByInvestorData ?? []}
                  />
                ) : (
                  <div className="mt-[5%] flex justify-center items-center">
                    <Spin indicator={<LoadingOutlined spin />} size="large" tip={'Đang tải'}>
                      <div style={contentStyle} />
                    </Spin>
                  </div>
                )}
              </Card>
            </Col>
            <Col xs={24} md={24}>
              <Card
                bodyStyle={{ padding: '5px' }}
                className="rounded-[10px] h-full"
                title={<p>Số lượng dự án theo chủ đầu tư</p>}
              >
                {constructionFacade.analyzeAllConstructionData?.listConstructionQuantityByInvestorData != null ? (
                  <DashboardChart
                    data={constructionFacade.analyzeAllConstructionData?.listConstructionQuantityByInvestorData ?? []}
                  />
                ) : (
                  <div className="mt-[5%] flex justify-center items-center">
                    <Spin indicator={<LoadingOutlined spin />} size="large" tip={'Đang tải'}>
                      <div style={contentStyle} />
                    </Spin>
                  </div>
                )}
              </Card>
            </Col>
            <Col xs={12} md={12}>
              <Card
                bodyStyle={{ padding: '10px' }}
                className="rounded-[10px] h-full"
                title={<p>Top 5 dự án có giá trị nghiệm thu (trước VAT) lớn nhất</p>}
              >
                <div className="flex justify-end mr-2">
                  <Typography.Text>Đơn vị: triệu (VND)</Typography.Text>
                </div>
                {constructionFacade.analyzeAllConstructionData?.listTopFiveConstructionHasBigQualityData != null ? (
                  constructionFacade.analyzeAllConstructionData?.listTopFiveConstructionHasBigQualityData?.length >
                  0 ? (
                    <DebtBarChart
                      data={
                        constructionFacade.analyzeAllConstructionData?.listTopFiveConstructionHasBigQualityData ?? []
                      }
                    />
                  ) : (
                    <div className="mt-[5%] text-center">
                      <div className="flex justify-center mb-2">
                        <InboxOutlined className="text-gray-500 text-[30px]" />
                      </div>
                      <p className="font-medium color-[#A3A8AF]">Chưa có dữ liệu</p>
                    </div>
                  )
                ) : (
                  <div className="mt-[5%] flex justify-center items-center">
                    <Spin indicator={<LoadingOutlined spin />} size="large" tip={'Đang tải'}>
                      <div style={contentStyle} />
                    </Spin>
                  </div>
                )}
              </Card>
            </Col>
            <Col xs={12} md={12}>
              <Card
                bodyStyle={{ padding: '10px' }}
                className="rounded-[10px] h-full"
                title={<p>Top 5 chủ đầu tư có công nợ cao</p>}
              >
                <div className="flex justify-end mr-2">
                  <Typography.Text>Đơn vị: triệu (VND)</Typography.Text>
                </div>
                {constructionFacade.analyzeAllConstructionData?.listTopFiveConstructionHasBigDebtData != null ? (
                  constructionFacade.analyzeAllConstructionData?.listTopFiveConstructionHasBigDebtData?.length > 0 ? (
                    <DebtChart
                      data={constructionFacade.analyzeAllConstructionData?.listTopFiveConstructionHasBigDebtData ?? []}
                    />
                  ) : (
                    <div className="mt-[5%] text-center">
                      <div className="flex justify-center mb-2">
                        <InboxOutlined className="text-gray-500 text-[30px]" />
                      </div>
                      <p className="font-medium color-[#A3A8AF]">Chưa có dữ liệu</p>
                    </div>
                  )
                ) : (
                  <div className="mt-[5%] flex justify-center items-center">
                    <Spin indicator={<LoadingOutlined spin />} size="large" tip={'Đang tải'}>
                      <div style={contentStyle} />
                    </Spin>
                  </div>
                )}
              </Card>
            </Col>
            <Col xs={12} md={12}>
              <Card
                bodyStyle={{ padding: '10px' }}
                className="rounded-[10px] h-full"
                title={<p>5 dự án có tiến độ chậm nhất</p>}
              >
                <div className={'h-[436px] overflow-y-auto miniScroll'}>
                  {constructionFacade?.analyzeAllConstructionData?.listTopFiveInvestorHasLowQualityData?.length > 0 ? (
                    constructionFacade?.analyzeAllConstructionData?.listTopFiveInvestorHasLowQualityData?.map(
                      (item: any, index: number) => (
                        <Card key={index} bodyStyle={{ padding: '10px' }} size="small" className="rounded-[5px] mt-2">
                          <div className="flex justify-between items-center p-2">
                            <Space direction="vertical" size={0} className="!gap-0">
                              <div className="flex items-center gap-2">
                                <p className="m-0 font-medium line-clamp-2 max-w-[350px]">
                                  {item?.constructionName}{' '}
                                  <Tag className="rounded-full m-0" color={renderColor(item?.statusCode)}>
                                    {item?.statusName}
                                  </Tag>
                                </p>
                              </div>

                              <a
                                className="hover:underline text-sm text-blue-500"
                                onClick={() => {
                                  navigate(
                                    `/${lang}${routerLinks('Construction')}/${item?.constructionId}/construction-monitor`,
                                    {
                                      state: { isTaskTab: true },
                                    },
                                  );
                                }}
                              >
                                {item?.constructionCode}
                              </a>

                              <p className="text-xs text-[#8C8C8C] m-0">
                                {item?.totalTemplateStageQuantity ?? 0} giai đoạn
                              </p>

                              <Avatar.Group
                                className="cursor-pointer"
                                max={{
                                  count: 2,
                                  style: { color: '#f56a00', backgroundColor: '#fde3cf' },
                                }}
                              >
                                {item?.executionTeams?.map((items: any) => (
                                  <Tooltip title={items?.employeeName} placement="top" key={items?.employeeId}>
                                    <Avatar src={items?.employeeAvatarUrl} />
                                  </Tooltip>
                                ))}
                              </Avatar.Group>
                            </Space>

                            <div className="flex items-center gap-4">
                              <Progress type="circle" percent={item?.constructionProcess} size={[80, 80]} />

                              <Space direction="vertical" size={0} className="!gap-0">
                                <p className="m-0 text-sm">Tổng công việc: {item?.totalTaskQuantity ?? 0}</p>
                                <p className="m-0 text-sm text-[#1890FF]">
                                  Đã hoàn thành: {item?.totalTaskCompletedQuantity ?? 0}
                                </p>
                                <p className="m-0 text-sm text-[#FF4D4F]">
                                  Quá hạn: {item?.totalTaskExpiredDateQuantity ?? 0}
                                </p>
                              </Space>
                            </div>
                          </div>
                        </Card>
                      ),
                    )
                  ) : (
                    <div className="mt-[5%] flex justify-center items-center">
                      <Spin indicator={<LoadingOutlined spin />} size="large" tip={'Đang tải'}>
                        <div style={contentStyle} />
                      </Spin>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
            <Col xs={12} md={12}>
              <Card className="rounded-[10px] h-full" title={<p>Top dự án có vướng mắc chưa xử lý</p>}>
                <Table
                  dataSource={constructionFacade?.analyzeAllConstructionData?.listTopConstructionHasIssueData?.map(
                    (item: AnalyzeConstructionHasIssue, index: number) => ({
                      ...item,
                      stt: index + 1,
                    }),
                  )}
                  scroll={{ x: `200px` }}
                  columns={(columns as any) ?? []}
                  pagination={false}
                />
              </Card>
            </Col>
          </Row>
        )}

        {constructionFacade.activeTabDashboard === 'revenue' && (
          <Row gutter={[12, 12]} className="mt-4">
            <Col span={8}>
              <Card
                className="rounded-[10px] h-full"
                title={
                  <div className="flex gap-2 items-center">
                    <AiOutlineFileText className="text-[23px] text-[#13C2C2]" />
                    <p>Hợp đồng</p>
                  </div>
                }
              >
                <div className="flex justify-between">
                  <div>
                    <p>Số lượng hợp đồng</p>
                    <p className="text-[#1890FF] font-[500] text-[20px]">
                      {constructionFacade?.analyzeAllContractData?.analyzeRevenueContractData?.totalContractQuantity ??
                        0}
                    </p>
                  </div>
                  <div>
                    <p>Tổng giá trị hợp đồng (trước VAT)</p>
                    <div className="flex gap-1 items-center">
                      <p className="text-[#1890FF] font-[500] text-[20px]">
                        {constructionFacade?.analyzeAllContractData?.analyzeRevenueContractData?.totalExpectedAmountBeforeVAT
                          ?.toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ',') ?? 0}
                      </p>
                      <span className="text-[12px] font-[500]">VND</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card
                className="rounded-[10px] h-full"
                title={
                  <div className="flex gap-2 items-center">
                    <AiOutlineSketch className="text-[23px] text-[#FAAD14]" />
                    <p>Giá trị</p>
                  </div>
                }
              >
                <div className="flex justify-between">
                  <div>
                    <p>Sản lượng dự kiến</p>
                    <div className="flex gap-1 items-center">
                      <p className="text-[#1890FF] font-[500] text-[20px]">
                        {constructionFacade?.analyzeAllContractData?.analyzeRevenueContractData?.totalExpectedAmount
                          ?.toString()
                          ?.replace(/\B(?=(\d{3})+(?!\d))/g, ',') ?? 0}
                      </p>
                      <span className="text-[12px] font-[500]">VND</span>
                    </div>
                  </div>
                  <div>
                    <p>Giá trị nghiệm thu</p>
                    <div className="flex gap-1 items-center">
                      <p className="text-[#52C41A] font-[500] text-[20px]">
                        {constructionFacade?.analyzeAllContractData?.analyzeRevenueContractData?.totalReceiptAmount
                          ?.toString()
                          ?.replace(/\B(?=(\d{3})+(?!\d))/g, ',') ?? 0}
                      </p>
                      <span className="text-[12px] font-[500]">VND</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card
                className="rounded-[10px] h-full"
                title={
                  <div className="flex gap-2 items-center">
                    <AiOutlineDollar className="text-[23px] text-[#52C41A]" />
                    <p>Thanh toán</p>
                  </div>
                }
              >
                <div className="flex justify-between">
                  <div>
                    <p>Giá trị đã xuất HĐ</p>
                    <div className="flex gap-1 items-center">
                      <p className="text-[#52C41A] font-[500] text-[20px]">
                        {constructionFacade?.analyzeAllContractData?.analyzeRevenueContractData?.totalAmountHasExportBillOrder
                          ?.toString()
                          ?.replace(/\B(?=(\d{3})+(?!\d))/g, ',') ?? 0}
                      </p>
                      <span className="text-[12px] font-[500]">VND</span>
                    </div>
                  </div>
                  <div>
                    <p>Giá trị còn lại</p>
                    <div className="flex gap-1 items-center">
                      <p className="text-[#FF4D4F] font-[500] text-[20px]">
                        {constructionFacade?.analyzeAllContractData?.analyzeRevenueContractData?.totalRemainingAmount
                          ?.toString()
                          ?.replace(/\B(?=(\d{3})+(?!\d))/g, ',') ?? 0}
                      </p>
                      <span className="text-[12px] font-[500]">VND</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={24}>
              <Card bodyStyle={{ padding: '10px' }} title="Số lượng và giá trị hợp đồng (trước VAT) theo chủ đầu tư">
                {constructionFacade?.analyzeAllContractData?.analyzeContractAmountData != null ? (
                  constructionFacade?.analyzeAllContractData?.analyzeContractAmountData?.length > 0 ? (
                    <ContractChart data={constructionFacade?.analyzeAllContractData?.analyzeContractAmountData ?? []} />
                  ) : (
                    <div className="mt-[5%] text-center">
                      <div className="flex justify-center mb-2">
                        <InboxOutlined className="text-gray-500 text-[30px]" />
                      </div>
                      <p className="font-medium color-[#A3A8AF]">Chưa có dữ liệu</p>
                    </div>
                  )
                ) : (
                  <div className="mt-[5%] flex justify-center items-center">
                    <Spin indicator={<LoadingOutlined spin />} size="large" tip={'Đang tải'}>
                      <div style={contentStyle} />
                    </Spin>
                  </div>
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card bodyStyle={{ padding: '10px' }} title="Tỉ lệ số lượng hợp đồng đã phê duyệt">
                {constructionFacade.analyzeAllContractData?.analyzePercentData != null ? (
                  constructionFacade.analyzeAllContractData?.analyzePercentData?.length > 0 ? (
                    <PieCharts
                      packageData={
                        constructionFacade?.analyzeAllContractData?.analyzePercentData?.map((item: any) => ({
                          ...item,
                          itemStyle: { color: item?.name === 'Đã nghiệm thu' ? '#D6EDFF' : '#FFDAEC' },
                          label: { color: item?.name === 'Đã nghiệm thu' ? '#36A2EB' : '#FF6384' },
                        })) ?? []
                      }
                    />
                  ) : (
                    <div className="mt-[5%] text-center">
                      <div className="flex justify-center mb-2">
                        <InboxOutlined className="text-gray-500 text-[30px]" />
                      </div>
                      <p className="font-medium color-[#A3A8AF]">Chưa có dữ liệu</p>
                    </div>
                  )
                ) : (
                  <div className="mt-[5%] flex justify-center items-center">
                    <Spin indicator={<LoadingOutlined spin />} size="large" tip={'Đang tải'}>
                      <div style={contentStyle} />
                    </Spin>
                  </div>
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card bodyStyle={{ padding: '10px' }} title="Tỷ lệ giá trị hợp đồng (trước VAT) đã phê duyệt">
                {constructionFacade?.analyzeAllContractData?.analyzeApprovePercentData != null ? (
                  constructionFacade?.analyzeAllContractData?.analyzeApprovePercentData?.length > 0 ? (
                    <PieCharts
                      packageData={
                        constructionFacade?.analyzeAllContractData?.analyzeApprovePercentData?.map((item: any) => ({
                          ...item,
                          itemStyle: { color: item?.name === 'Đã nghiệm thu' ? '#FBE38EB2' : '#FEAEAEB2' },
                          label: { color: item?.name === 'Đã nghiệm thu' ? '#C19600' : '#FF3838' },
                        })) ?? []
                      }
                    />
                  ) : (
                    <div className="mt-[5%] text-center">
                      <div className="flex justify-center mb-2">
                        <InboxOutlined className="text-gray-500 text-[30px]" />
                      </div>
                      <p className="font-medium color-[#A3A8AF]">Chưa có dữ liệu</p>
                    </div>
                  )
                ) : (
                  <div className="mt-[5%] flex justify-center items-center">
                    <Spin indicator={<LoadingOutlined spin />} size="large" tip={'Đang tải'}>
                      <div style={contentStyle} />
                    </Spin>
                  </div>
                )}
              </Card>
            </Col>
            <Col span={24}>
              <Card
                bodyStyle={{ padding: '10px' }}
                title="Tổng sản lượng dự kiến và giá trị nghiệm thu (trước VAT) theo chủ đầu tư"
              >
                {constructionFacade?.analyzeAllContractData?.analyzeByInvestorData != null ? (
                  constructionFacade?.analyzeAllContractData?.analyzeByInvestorData?.length > 0 ? (
                    <PriceBarChart
                      packageData={constructionFacade?.analyzeAllContractData?.analyzeByInvestorData ?? []}
                    />
                  ) : (
                    <div className="mt-[5%] text-center">
                      <div className="flex justify-center mb-2">
                        <InboxOutlined className="text-gray-500 text-[30px]" />
                      </div>
                      <p className="font-medium color-[#A3A8AF]">Chưa có dữ liệu</p>
                    </div>
                  )
                ) : (
                  <div className="mt-[5%] flex justify-center items-center">
                    <Spin indicator={<LoadingOutlined spin />} size="large" tip={'Đang tải'}>
                      <div style={contentStyle} />
                    </Spin>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </Spin>
  );
}

export default DashboardPage;
