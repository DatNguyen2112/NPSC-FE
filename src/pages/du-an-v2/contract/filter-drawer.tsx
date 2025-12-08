import { Button, Drawer, Form, Space, Input, Select, DatePicker, InputNumber } from 'antd';
import React, { useMemo } from 'react';
import { CloseOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { CodeTypeFacade, ContractFacade, ConstructionFacade } from '@store';
import { DefaultOptionType } from 'antd/es/select';
import { isLoadAllData } from '@utils';
import dayjs from 'dayjs';

interface FilterDrawerProps {
  filter: Record<string, any>;
  loadFunc: (filter: Record<string, any>, force?: boolean) => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({ filter, loadFunc }) => {
  const [form] = Form.useForm();
  const contractFacade = ContractFacade();
  const codeTypeFacade = CodeTypeFacade();
  const constructionFacade = ConstructionFacade();
  const constructionId = Form.useWatch('constructionId', form);

  // Get construction list for dropdown
  const constructionList = useMemo(
    () =>
      (constructionFacade.pagination?.content ?? []).map(
        (x) =>
          ({
            label: x.name,
            value: x.id,
          }) satisfies DefaultOptionType,
      ),
    [constructionFacade.pagination?.content],
  );

  // Get template stages list for dropdown
  const templateStageList = useMemo(() => {
    if (!constructionId) {
      return [];
    }

    const construction = constructionFacade.pagination?.content.find((x) => x.id === constructionId);

    if (!construction?.constructionTemplateId) {
      return [];
    }

    return (
      construction.templateStages?.map(
        (x) =>
          ({
            label: `${x.stepOrder}. ${x.name}`,
            value: x.id,
          }) satisfies DefaultOptionType,
      ) ?? []
    );
  }, [constructionFacade.pagination?.content, constructionId]);

  const handleClose = () => {
    contractFacade.set({ isFilterDrawerOpen: false });
  };

  const resetFilter = () => {
    form.resetFields();

    const emptyFilter = { ...filter };

    Object.keys(emptyFilter).forEach((x) => {
      emptyFilter[x] = undefined;
    });

    loadFunc(emptyFilter);
    contractFacade.set({ isFilterDrawerOpen: false });
  };

  const onFinish = (values: any) => {
    // Handle date ranges
    if (values.approvalDateRange) {
      values.approvalDateRange = [
        dayjs(values.approvalDateRange[0]).format('YYYY-MM-DDTHH:mm:ss[Z]'),
        dayjs(values.approvalDateRange[1]).format('YYYY-MM-DDTHH:mm:ss[Z]'),
      ];
    }
    if (values.invoiceIssuanceDateRange) {
      values.invoiceIssuanceDateRange = [
        dayjs(values.invoiceIssuanceDateRange[0]).format('YYYY-MM-DDTHH:mm:ss[Z]'),
        dayjs(values.invoiceIssuanceDateRange[1]).format('YYYY-MM-DDTHH:mm:ss[Z]'),
      ];
    }

    // Handle value range - combine min and max into an array
    if (values.valueBeforeVatAmountMin !== undefined || values.valueBeforeVatAmountMax !== undefined) {
      values.valueBeforeVatAmountRange = [values.valueBeforeVatAmountMin, values.valueBeforeVatAmountMax];
      // Remove individual min/max fields
      delete values.valueBeforeVatAmountMin;
      delete values.valueBeforeVatAmountMax;
    }

    loadFunc(values);
    contractFacade.set({ isFilterDrawerOpen: false });
  };

  const onDrawerOpen = () => {
    contractFacade.set({ isFilterDrawerOpen: true });

    // Load necessary data for dropdowns
    if (!isLoadAllData(constructionFacade)) {
      constructionFacade.get({ size: -1 });
    }

    // Format date ranges for form
    const approvalDateRange = filter.approvalDateRange
      ? [dayjs(filter.approvalDateRange[0]), dayjs(filter.approvalDateRange[1])]
      : undefined;
    const invoiceIssuanceDateRange = filter.invoiceIssuanceDateRange
      ? [dayjs(filter.invoiceIssuanceDateRange[0]), dayjs(filter.invoiceIssuanceDateRange[1])]
      : undefined;

    // Extract min and max values from valueBeforeVatAmountRange if it exists
    const valueBeforeVatAmountMin = filter.valueBeforeVatAmountRange?.[0];
    const valueBeforeVatAmountMax = filter.valueBeforeVatAmountRange?.[1];

    form.resetFields();
    form.setFieldsValue({
      ...filter,
      approvalDateRange,
      invoiceIssuanceDateRange,
      valueBeforeVatAmountMin,
      valueBeforeVatAmountMax,
    });
  };

  return (
    <>
      <Button icon={<FilterOutlined />} color="primary" variant="outlined" onClick={onDrawerOpen}>
        Bộ lọc
      </Button>
      <Drawer
        title="Bộ lọc"
        closeIcon={false}
        extra={<Button type={'text'} icon={<CloseOutlined />} onClick={handleClose} />}
        onClose={handleClose}
        open={contractFacade.isFilterDrawerOpen}
        footer={
          <Space className={'flex justify-end'}>
            <Button icon={<ReloadOutlined />} onClick={resetFilter}>
              Đặt lại
            </Button>
            <Button icon={<FilterOutlined />} type={'primary'} onClick={form.submit}>
              Lọc
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Mã hợp đồng" name="code">
            <Input placeholder="Nhập mã hợp đồng" />
          </Form.Item>

          <Form.Item label="Công trình/Dự án" name="constructionId">
            <Select
              className="w-full"
              loading={constructionFacade.isLoading}
              options={constructionList}
              placeholder="Chọn công trình/dự án"
              showSearch
              optionFilterProp="label"
              allowClear
              onChange={() => {
                form.setFieldValue('templateStageId', undefined);
              }}
            />
          </Form.Item>

          <Form.Item label="Giai đoạn" name="templateStageId">
            <Select
              className="w-full"
              loading={codeTypeFacade.isLoading}
              options={templateStageList}
              disabled={!constructionId}
              placeholder="Chọn giai đoạn"
              showSearch
              optionFilterProp="label"
              allowClear
            />
          </Form.Item>

          <Form.Item label="Năm giao A" name="assignmentAYear">
            <InputNumber className="w-full" placeholder="Nhập năm giao A" min={0} />
          </Form.Item>

          <Form.Item label="Giá trị hợp đồng (trước VAT) (đơn vị: VND)">
            <div className="flex gap-2 items-center">
              <Form.Item name="valueBeforeVatAmountMin" noStyle>
                <InputNumber
                  className="w-full"
                  placeholder="Nhập giá trị đầu"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
              <span className="shrink-0">-</span>
              <Form.Item name="valueBeforeVatAmountMax" noStyle>
                <InputNumber
                  className="w-full"
                  placeholder="Nhập giá trị cuối"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item label="Ngày phê duyệt" name="approvalDateRange">
            <DatePicker.RangePicker format="DD/MM/YYYY" placeholder={['Từ ngày', 'Đến ngày']} className="w-full" />
          </Form.Item>

          <Form.Item label="Ngày xuất hóa đơn" name="invoiceIssuanceDateRange">
            <DatePicker.RangePicker format="DD/MM/YYYY" placeholder={['Từ ngày', 'Đến ngày']} className="w-full" />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default FilterDrawer;
