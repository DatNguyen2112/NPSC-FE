import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, Row, Select, Table } from 'antd';
import { API, isLoadAllData, keyToken, lang, routerLinks, uuidv4 } from '@utils';
import {
  CloseOutlined,
  DeleteOutlined,
  LeftOutlined,
  PaperClipOutlined,
  PlusOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  AppendixAttachment,
  CodeTypeFacade,
  ConstructionFacade,
  ContractAppendix,
  ContractFacade,
  ContractModel,
  contractImplementationStatuses,
  ProjectTemplateFacade,
  contractAcceptanceDocumentStatuses,
  contractInvoiceStatuses,
  contractSupplementaryContractRequires,
} from '@store';
import { DefaultOptionType } from 'antd/es/select';
import dayjs from 'dayjs';
import { EStatusState } from '@models';
import { customMessage } from 'src';
import type { ColumnsType } from 'antd/es/table';
import './form.css';

const implementationStatus = Object.values(contractImplementationStatuses).map((status) => ({
  label: status.label,
  value: status.value,
}));

const acceptanceDocumentStatus = Object.values(contractAcceptanceDocumentStatuses).map((status) => ({
  label: status.label,
  value: status.value,
}));

const invoiceStatus = Object.values(contractInvoiceStatuses).map((status) => ({
  label: status.label,
  value: status.value,
}));

const supplementaryContractRequires = Object.values(contractSupplementaryContractRequires).map((status) => ({
  label: status.label,
  value: status.value,
}));

export function formatCurrency(value: number | string): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const GeneralInfo: React.FC = () => {
  const form = Form.useFormInstance();
  const location = useLocation();
  const codeTypeFacade = CodeTypeFacade();
  const projectTemplateFacade = ProjectTemplateFacade();
  const constructionFacade = ConstructionFacade();
  const constructionId = Form.useWatch('constructionId', form);
  const consultServiceList = useMemo(() => {
    return (codeTypeFacade.consultServiceData?.content ?? []).map(
      (x) =>
        ({
          label: x.title,
          value: x.id,
          color: x.description || 'default',
        }) satisfies DefaultOptionType,
    );
  }, [codeTypeFacade.consultServiceData?.content]);
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
  const templateStageList = useMemo(() => {
    if (!constructionId) {
      return [];
    }

    const construction = constructionFacade.pagination?.content.find((x) => x.id === constructionId);

    if (!construction) {
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

  useEffect(() => {
    codeTypeFacade.getConsultService({ size: -1 });

    if (!isLoadAllData(constructionFacade)) {
      constructionFacade.get({ size: -1 });
    }

    if (!isLoadAllData(projectTemplateFacade)) {
      projectTemplateFacade.get({ size: -1 });
    }

    if (location.state) {
      form.setFieldsValue(location.state);
    }
  }, []);

  return (
    <Card id="general-info" title="Thông tin chung" className="h-full">
      <Row gutter={16}>
        {/* Contract Code */}
        <Col span={6}>
          <Form.Item label="Mã hợp đồng" name="code" rules={[{ required: true, message: 'Vui lòng nhập mã hợp đồng' }]}>
            <Input placeholder="Nhập mã hợp đồng" />
          </Form.Item>
        </Col>

        {/* Construction/Project */}
        <Col span={18}>
          <Form.Item
            label="Công trình/dự án"
            name="constructionId"
            rules={[{ required: true, message: 'Vui lòng chọn công trình/dự án' }]}
          >
            <Select
              loading={constructionFacade.isLoading}
              options={constructionList}
              placeholder="Chọn công trình/dự án"
              showSearch
              optionFilterProp="label"
              onChange={() => {
                form.setFieldValue('templateStageId', undefined);
              }}
            />
          </Form.Item>
        </Col>

        {/* Stage */}
        <Col span={8}>
          <Form.Item
            label="Giai đoạn"
            name="templateStageId"
            rules={[{ required: true, message: 'Vui lòng chọn giai đoạn' }]}
          >
            <Select
              disabled={!constructionId}
              loading={projectTemplateFacade.isLoading}
              options={templateStageList}
              placeholder="Chọn giai đoạn"
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        </Col>

        {/* Assignment Year A */}
        <Col span={8}>
          <Form.Item
            label="Năm giao A"
            name="assignmentAYear"
            rules={[{ required: true, message: 'Vui lòng nhập năm giao A' }]}
          >
            <InputNumber placeholder="Nhập năm giao A" className="w-full" min={0} />
          </Form.Item>
        </Col>

        {/* Consulting Service */}
        <Col span={8}>
          <Form.Item
            label="Dịch vụ tư vấn"
            name="consultingServiceId"
            rules={[{ required: true, message: 'Vui lòng chọn dịch vụ tư vấn' }]}
          >
            <Select
              loading={codeTypeFacade.isLoading}
              options={consultServiceList}
              placeholder="Chọn dịch vụ tư vấn"
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

const ValueInfo: React.FC = () => {
  const form = Form.useFormInstance();
  const taxRatePercentage = Form.useWatch('taxRatePercentage', form) ?? 0;
  const valueBeforeVatAmount = Form.useWatch('valueBeforeVatAmount', form) ?? 0;
  const acceptanceValueBeforeVatAmount = Form.useWatch('acceptanceValueBeforeVatAmount', form) ?? 0;
  const valueAmount = Math.round(valueBeforeVatAmount + (valueBeforeVatAmount * taxRatePercentage) / 100);
  const acceptanceValueAmount = Math.round(
    acceptanceValueBeforeVatAmount + (acceptanceValueBeforeVatAmount * taxRatePercentage) / 100,
  );

  return (
    <Card title="Thông tin giá trị" id="contract-value" className="h-full">
      <Row gutter={16}>
        {/* Contract Value before VAT */}
        <Col span={12}>
          <Form.Item label="Giá trị hợp đồng (trước VAT)" name="valueBeforeVatAmount">
            <InputNumber
              controls={false}
              placeholder="0"
              className="w-full"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VND"
            />
          </Form.Item>
        </Col>

        {/* Expected Volume */}
        <Col span={12}>
          <Form.Item label="Sản lượng dự kiến" name="expectedVolume">
            <InputNumber
              controls={false}
              placeholder="0"
              className="w-full"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VND"
            />
          </Form.Item>
        </Col>

        {/* Acceptance Value before VAT */}
        <Col span={12}>
          <Form.Item label="Giá trị nghiệm thu (trước VAT)" name="acceptanceValueBeforeVatAmount">
            <InputNumber
              controls={false}
              placeholder="0"
              className="w-full"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VND"
            />
          </Form.Item>
        </Col>

        {/* Paid Amount */}
        <Col span={12}>
          <Form.Item label="Giá trị đã xuất hóa đơn (đã thanh toán)" name="paidAmount">
            <InputNumber
              controls={false}
              placeholder="0"
              className="w-full"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VND"
            />
          </Form.Item>
        </Col>

        {/* Tax Rate */}
        <Col span={12}>
          <Form.Item label="Thuế suất" name="taxRatePercentage">
            <InputNumber controls={false} placeholder="0" className="w-full" min={0} max={100} addonAfter="%" />
          </Form.Item>
        </Col>

        <Col span={12} className="grid grid-cols-[auto_1fr] gap-4 h-fit">
          <span>Giá trị HĐ (VAT {taxRatePercentage}%):</span>
          <span className="text-end">
            <span className="font-medium">{formatCurrency(valueAmount)}</span>
            <span> VND</span>
          </span>

          <span>Giá trị NT (VAT {taxRatePercentage}%):</span>
          <span className="text-end">
            <span className="font-medium">{formatCurrency(acceptanceValueAmount)}</span>
            <span> VND</span>
          </span>
        </Col>
      </Row>
    </Card>
  );
};

const AdditionalInfo: React.FC = () => {
  return (
    <Card title="Thông tin bổ sung" id="additional-info" className="h-full">
      <Row gutter={16}>
        {/* Contract Number */}
        <Col span={8}>
          <Form.Item label="Số hợp đồng" name="contractNumber">
            <Input placeholder="Nhập số hợp đồng" />
          </Form.Item>
        </Col>

        {/* Contract Signing Date */}
        <Col span={8}>
          <Form.Item label="Ngày ký hợp đồng" name="contractSigningDate">
            <DatePicker className="w-full" placeholder="Chọn ngày ký hợp đồng" format="DD/MM/YYYY" />
          </Form.Item>
        </Col>

        {/* Contract Duration Days */}
        <Col span={8}>
          <Form.Item label="Thời hạn hợp đồng (ngày)" name="contractDurationDays">
            <InputNumber placeholder="0" className="w-full" min={0} />
          </Form.Item>
        </Col>

        {/* Issues */}
        <Col span={24}>
          <Form.Item label="Vướng mắc" name="issues">
            <Input.TextArea
              placeholder="Nhập các nội dung vướng mắc trong quá trình thực hiện thiết kế/nghiệm thu"
              autoSize={{ minRows: 2 }}
            />
          </Form.Item>
        </Col>

        {/* Notes */}
        <Col span={24}>
          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea placeholder="Nhập ghi chú" autoSize={{ minRows: 2 }} />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

const AcceptanceInfo: React.FC = () => {
  return (
    <Card
      styles={{ body: { flex: 1, overflow: 'hidden', padding: 0 } }}
      title="Thông tin nghiệm thu"
      className="h-full flex flex-col"
      id="acceptance-info"
    >
      <div className="h-full p-6 overflow-auto miniScroll">
        {/* Implementation Status */}
        <Form.Item label="Tình hình thực hiện" name="implementationStatus">
          <Select options={implementationStatus} placeholder="Chọn tình hình thực hiện" />
        </Form.Item>

        {/* Expected Approval Month */}
        <Form.Item label="Tháng dự kiến phê duyệt" name="expectedApprovalMonth">
          <Input placeholder="Nhập tháng dự kiến phê duyệt" className="w-full" />
        </Form.Item>

        {/* Approval Date */}
        <Form.Item label="Ngày phê duyệt hợp đồng" name="approvalDate">
          <DatePicker className="w-full" placeholder="Chọn ngày phê duyệt hợp đồng" format="DD/MM/YYYY" />
        </Form.Item>

        {/* Expected Acceptance Month */}
        <Form.Item label="Tháng dự kiến nghiệm thu" name="expectedAcceptanceMonth">
          <Input placeholder="Nhập tháng dự kiến nghiệm thu" className="w-full" />
        </Form.Item>

        {/* Invoice Issuance Date */}
        <Form.Item label="Ngày xuất hóa đơn" name="invoiceIssuanceDates">
          <DatePicker multiple className="w-full" placeholder="Chọn ngày xuất hóa đơn" format="DD/MM/YYYY" />
        </Form.Item>

        {/* Acceptance Year */}
        <Form.Item label="Năm nghiệm thu" name="acceptanceYear">
          <InputNumber placeholder="Nhập năm nghiệm thu" className="w-full" min={0} />
        </Form.Item>

        {/* Acceptance Document Status */}
        <Form.Item label="Tình hình lập hồ sơ nghiệm thu" name="acceptanceDocumentStatus">
          <Select options={acceptanceDocumentStatus} placeholder="Chọn tình hình lập hồ sơ nghiệm thu" />
        </Form.Item>
      </div>
    </Card>
  );
};

const OtherInfo: React.FC = () => {
  return (
    <Card
      styles={{ body: { flex: 1, overflow: 'hidden', padding: 0 } }}
      title="Thông tin khác"
      className="h-full flex flex-col"
      id="other-info"
    >
      <div className="h-full p-6 overflow-auto miniScroll">
        {/* Design Approval Date */}
        <Form.Item label="Ngày phê duyệt thiết kế" name="designApprovalDate">
          <DatePicker className="w-full" placeholder="Chọn ngày phê duyệt thiết kế" format="DD/MM/YYYY" />
        </Form.Item>

        {/* Invoice Status */}
        <Form.Item label="Tình hình xuất hoá đơn" name="invoiceStatus">
          <Select options={invoiceStatus} placeholder="Chọn tình hình xuất hoá đơn" />
        </Form.Item>

        {/* Handover Record Date */}
        <Form.Item label="Ngày lập BB bàn giao" name="handoverRecordDate">
          <DatePicker className="w-full" placeholder="Chọn ngày lập biên bản bàn giao" format="DD/MM/YYYY" />
        </Form.Item>

        {/* Site Survey Record Date */}
        <Form.Item label="Ngày lập BB khảo sát hiện trường" name="siteSurveyRecordDate">
          <DatePicker className="w-full" placeholder="Chọn ngày lập biên bản khảo sát HT" format="DD/MM/YYYY" />
        </Form.Item>

        {/* Survey Acceptance Record Date */}
        <Form.Item label="Ngày lập BB nghiệm thu khảo sát" name="surveyAcceptanceRecordDate">
          <DatePicker className="w-full" placeholder="Chọn ngày lập biên bản NT KS" format="DD/MM/YYYY" />
        </Form.Item>

        {/* Supplementary Contract Required */}
        <Form.Item label="Cần ký PLHĐ" name="supplementaryContractRequired">
          <Select options={supplementaryContractRequires} placeholder="Chọn yêu cầu ký PLHĐ" />
        </Form.Item>

        {/* Acceptance Plan */}
        <Form.Item label="Kế hoạch nghiệm thu" name="acceptancePlan">
          <Input placeholder="Nhập quý dự kiến nghiệm thu" />
        </Form.Item>
      </div>
    </Card>
  );
};

const AppendixInfo: React.FC = () => {
  const contractFacade = ContractFacade();
  const form = Form.useFormInstance();
  const inputEl = useRef<HTMLInputElement>(document.createElement('input'));
  const [loadingRows, setLoadingRows] = useState<string[]>([]);
  const appendixAttachments = useRef<Record<string, AppendixAttachment>>({});
  const setAttachmentId = (key: string, attId: string | undefined) => {
    const allAppendices = form.getFieldValue('appendices') as any[];
    const index = allAppendices.findIndex((x: any) => x.key === key);

    if (index >= 0) {
      allAppendices[index].attachmentId = attId;
      form.setFieldValue('appendices', allAppendices);
    }
  };
  const columns: ColumnsType<ContractAppendix & { key: string }> = [
    {
      title: 'STT',
      dataIndex: 'key',
      key: 'key',
      width: 60,
      align: 'center',
      render: (_, __, index) => <span>{index + 1}</span>,
    },
    {
      title: 'Nội dung phụ lục',
      dataIndex: 'content',
      key: 'content',
      width: 400,
      render: (value, _, index) => (
        <Form.Item name={[index, 'content']} rules={[{ required: true, message: 'Vui lòng nhập nội dung phụ lục' }]}>
          <Input.TextArea placeholder="Nhập nội dung phụ lục" value={value} autoSize />
        </Form.Item>
      ),
    },
    {
      title: 'File đính kèm',
      dataIndex: 'attachmentId',
      key: 'attachmentId',
      ellipsis: true,
      width: 240,
      render: (value, record) => (
        <>
          {value ? (
            <div className="flex gap-2 items-center">
              <PaperClipOutlined className="text-black/45" />
              <a
                className="text-blue-500 text-ellipsis overflow-hidden font-medium"
                href={appendixAttachments.current[value]?.fileUrl}
                target="_blank"
                rel="noreferrer"
              >
                {appendixAttachments.current[value]?.fileName}
              </a>
              <Button
                onClick={() => setAttachmentId(record.key, undefined)}
                className="!size-6"
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </div>
          ) : (
            <Button
              icon={<UploadOutlined />}
              onClick={() => uploadFile(record.key)}
              loading={loadingRows.includes(record.key)}
            >
              Tải lên file đính kèm
            </Button>
          )}
        </>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 40,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<CloseOutlined />}
          onClick={() => {
            form.setFieldValue(
              'appendices',
              form.getFieldValue('appendices').filter((x: any) => x.key !== record.key),
            );
          }}
        />
      ),
    },
  ];

  const addNewRow = () => {
    form.setFieldValue('appendices', [
      ...form.getFieldValue('appendices'),
      {
        key: uuidv4(),
        content: '',
      },
    ]);
  };

  const uploadFile = (key: string) => {
    inputEl.current.type = 'file';
    inputEl.current.accept = '.pdf,.xlsx,.docx,.png';
    inputEl.current.onchange = async (e: any) => {
      inputEl.current.onchange = null;
      setLoadingRows((prev) => [...prev, key]);

      try {
        const file: File = e.target.files[0];

        if (!file) return;

        const formData = new FormData();
        formData.set('file', file);

        const res = await API.responsible<any>(
          '/upload/blob/attach',
          {},
          {
            ...API.init(),
            method: 'post',
            body: formData,
            headers: {
              authorization: localStorage.getItem(keyToken) ? 'Bearer ' + localStorage.getItem(keyToken) : '',
              'Accept-Language': localStorage.getItem('i18nextLng') || '',
            },
          },
        );
        const attachmentId = res.data.id;

        appendixAttachments.current[attachmentId] = {
          id: attachmentId,
          fileName: res.data.fileName,
          fileType: res.data.docType,
          filePath: res.data.filePath,
          fileUrl: res.data.fileUrl,
        };

        setAttachmentId(key, attachmentId);
      } finally {
        setLoadingRows((prev) => prev.filter((x) => x !== key));
      }
    };
    inputEl.current.click();
  };

  useEffect(() => {
    if (contractFacade.data?.appendices) {
      contractFacade.data.appendices.forEach((x: ContractAppendix) => {
        if (x.attachment?.id) {
          appendixAttachments.current[x.attachment.id] = x.attachment;
        }
      });
    }
  }, [contractFacade.data?.appendices]);

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span>Thông tin phụ lục</span>
          <Button type="primary" icon={<PlusOutlined />} onClick={addNewRow}>
            Thêm dòng
          </Button>
        </div>
      }
    >
      <Form.List name="appendices">
        {() => <Table columns={columns} dataSource={form.getFieldValue('appendices')} pagination={false} />}
      </Form.List>
    </Card>
  );
};

const ContractForm: React.FC = () => {
  const { editId } = useParams();
  const location = useLocation();
  const contractFacade = ContractFacade();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  function onFinish(data: any) {
    if (data.approvalDate) {
      data.approvalDate = dayjs(data.approvalDate).format('YYYY-MM-DDTHH:mm:ss[Z]');
    }

    if (data.designApprovalDate) {
      data.designApprovalDate = dayjs(data.designApprovalDate).format('YYYY-MM-DDTHH:mm:ss[Z]');
    }

    if (data.contractSigningDate) {
      data.contractSigningDate = dayjs(data.contractSigningDate).format('YYYY-MM-DDTHH:mm:ss[Z]');
    }

    if (data.handoverRecordDate) {
      data.handoverRecordDate = dayjs(data.handoverRecordDate).format('YYYY-MM-DDTHH:mm:ss[Z]');
    }

    if (data.siteSurveyRecordDate) {
      data.siteSurveyRecordDate = dayjs(data.siteSurveyRecordDate).format('YYYY-MM-DDTHH:mm:ss[Z]');
    }

    if (data.surveyAcceptanceRecordDate) {
      data.surveyAcceptanceRecordDate = dayjs(data.surveyAcceptanceRecordDate).format('YYYY-MM-DDTHH:mm:ss[Z]');
    }

    if (data.invoiceIssuanceDates) {
      data.invoiceIssuanceDates = data.invoiceIssuanceDates.map((x: dayjs.Dayjs) => x.format('YYYY-MM-DDTHH:mm:ss[Z]'));
    }

    const messageKey = uuidv4();

    if (editId) {
      customMessage.loading({ content: 'Đang cập nhật hợp đồng...', duration: 60000, key: messageKey });
      contractFacade.put({ ...data, id: editId }).finally(() => {
        customMessage.destroy(messageKey);
      });
    } else {
      customMessage.loading({ content: 'Đang tạo hợp đồng...', duration: 60000, key: messageKey });
      contractFacade.post(data).finally(() => {
        customMessage.destroy(messageKey);
      });
    }
  }

  function setFormValues(contract: ContractModel) {
    form.setFieldsValue({
      ...contract,
      approvalDate: contract.approvalDate ? dayjs(contract.approvalDate) : undefined,
      designApprovalDate: contract.designApprovalDate ? dayjs(contract.designApprovalDate) : undefined,
      contractSigningDate: contract.contractSigningDate ? dayjs(contract.contractSigningDate) : undefined,
      handoverRecordDate: contract.handoverRecordDate ? dayjs(contract.handoverRecordDate) : undefined,
      siteSurveyRecordDate: contract.siteSurveyRecordDate ? dayjs(contract.siteSurveyRecordDate) : undefined,
      surveyAcceptanceRecordDate: contract.surveyAcceptanceRecordDate
        ? dayjs(contract.surveyAcceptanceRecordDate)
        : undefined,
      invoiceIssuanceDates: contract.invoiceIssuanceDates?.map((x) => dayjs(x)) ?? [],
      appendices:
        contract.appendices?.map((x) => ({
          key: uuidv4(),
          content: x.content,
          attachmentId: x.attachment?.id,
        })) ?? [],
    });
  }

  useEffect(() => {
    if (!editId) return;

    const contract = contractFacade.pagination?.content.find((x) => x.id === editId);

    if (contract) {
      contractFacade.set({ data: contract });
    } else {
      contractFacade.getById({ id: editId });
    }

    return () => {
      contractFacade.set({ data: undefined });
    };
  }, [editId]);

  useEffect(() => {
    switch (contractFacade.status) {
      case EStatusState.postFulfilled:
      case EStatusState.putFulfilled:
        contractFacade.set({ status: EStatusState.idle, data: undefined });
        navigate(-1);
        break;
    }
  }, [contractFacade.status]);

  useEffect(() => {
    if (contractFacade.data && editId) {
      setFormValues(contractFacade.data);
    }
  }, [editId, contractFacade.data]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-12 bg-white shadow-header px-4 flex justify-between items-center">
        <Button
          variant="link"
          size="large"
          onClick={() => {
            if (location.key === 'default') {
              navigate(`/${lang}${routerLinks('Contract')}`);
            } else {
              navigate(-1);
            }
          }}
          className="text-neutral-500 p-0 h-fit border-none shadow-none"
          icon={<LeftOutlined />}
        >
          Quay lại
        </Button>
        <Button icon={<SaveOutlined />} type="primary" onClick={form.submit} disabled={contractFacade.isLoading}>
          Lưu lại
        </Button>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-4 overflow-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            valueBeforeVatAmount: 0,
            expectedVolume: 0,
            settlementValueAmount: 0,
            acceptanceValueBeforeVatAmount: 0,
            paidAmount: 0,
            taxRatePercentage: 0,
            implementationStatus: contractImplementationStatuses.NotImplemented.value,
            appendices: [],
            invoiceIssuanceDates: [],
            acceptanceDocumentStatus: contractAcceptanceDocumentStatuses.NotPrepared.value,
            invoiceStatus: contractInvoiceStatuses.NotIssued.value,
            supplementaryContractRequired: contractSupplementaryContractRequires.NotRequired.value,
          }}
        >
          <div className="grid grid-cols-3 grid-rows-[repeat(4,auto)] gap-4">
            <div className="col-span-2">
              <GeneralInfo />
            </div>
            <div className="row-span-3 relative">
              <div className="absolute top-0 left-0 size-full grid grid-rows-2 gap-4">
                <AcceptanceInfo />
                <OtherInfo />
              </div>
            </div>
            <div className="col-span-2">
              <ValueInfo />
            </div>
            <div className="col-span-2">
              <AdditionalInfo />
            </div>
            <div className="col-span-3">
              <AppendixInfo />
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ContractForm;
