import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { TypesCodeTypeManagementFacade, ProductFacade, ProductModel, QuotationFacade } from '@store';
import { uuidv4 } from '@utils';
import { Button, Form, Input, InputNumber, Modal, Select, Table, Tooltip } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useEffect, useRef } from 'react';
import SunEditor from 'suneditor-react';
import { EditTwoTone } from '@ant-design/icons';
import React from 'react';

const { Column } = Table;

const QuotationItemTable: React.FC = (props: any) => {
  const { data, add, remove, form, vat } = props;
  const productFacade = ProductFacade();
  const typesCodeTypeManagementFacade = TypesCodeTypeManagementFacade();
  const quotationFacade = QuotationFacade();
  const rValue = useRef<any>({});
  const rIndex = useRef<any>(undefined);
  useEffect(() => {
    quotationFacade.set({ typeCode: 'QuotationMaterial' });
    typesCodeTypeManagementFacade.get({});
  }, []);

  // Sử dụng useEffect để chờ dữ liệu của form được cập nhật
  useEffect(() => {
    const quotationItems = form.getFieldValue('quotationItem');

    // Kiểm tra xem dữ liệu đã được cập nhật chưa
    if (quotationItems && quotationItems.length > 0 && Object.keys(quotationItems[0]).length > 0) {
      calculateTotalAmount(); // Chỉ gọi khi `quotationItem` có dữ liệu
    }
  }, [form.getFieldValue('quotationItem')]); // Theo dõi sự thay đổi của `quotationItem`

  useEffect(() => {
    productFacade.get({ size: -1, filter: JSON.stringify({ type: productFacade.type ?? 'VAT_TU' }) });
  }, [productFacade.type]);

  const calculateTotalAmount = () => {
    const quotationItems = form.getFieldValue('quotationItem');

    // Kiểm tra nếu `quotationItem` chưa có dữ liệu
    if (!quotationItems || quotationItems.length === 0 || Object.keys(quotationItems[0]).length === 0) {
      console.log('quotationItem chưa có dữ liệu');
      return;
    }

    // Khi `quotationItem` đã có dữ liệu, tính toán subtotal
    const subTotalAmount = quotationItems.reduce((acc: number, item: any) => {
      return acc + Number(item.lineAmount || 0); // Đảm bảo `lineAmount` có giá trị hợp lệ
    }, 0);

    // Cập nhật các giá trị tính toán vào `quotationFacade`
    quotationFacade.set({
      subTotalAmount,
      totalAmount: Number(subTotalAmount || 0) * (1 + Number(vat) / 100),
      vatAmount: Number(subTotalAmount || 0) * (Number(vat) / 100),
    });
  };

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  const handleCloseModal = () => {
    quotationFacade.set({ isSpecifications: false });
    rIndex.current = undefined;
  };

  const CustomFormItem = ({ value, index }: { value?: string; index: number }) => {
    return (
      <div className="flex gap-1 justify-between min-h-8 px-2 border border-[#d9d9d9] hover:border-[#4096ff] hover:bg-white focus:border-[#1677ff] outline-0 focus:shadow-[0_0_0_2px_rgba(5,145,255,0.1)]">
        <div dangerouslySetInnerHTML={{ __html: value || '' }} title={value} className="break-words"></div>
        <Tooltip title="Nhập quy cách">
          <EditTwoTone
            onClick={() => {
              quotationFacade.set({ isSpecifications: true });
              rIndex.current = index;
            }}
            className="cursor-pointer hover:opacity-80"
          />
        </Tooltip>
      </div>
    );
  };

  return (
    <>
      <Table
        size="small"
        dataSource={data}
        pagination={false}
        footer={() => (
          <div className=" font-medium p-3 ">
            <div className="flex justify-between items-center">
              <span className="pl-5">Total</span>
              <span>{formatNumber(Math.floor(quotationFacade.subTotalAmount || 0))}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="pl-5">Vat {Number(vat ?? 0)}%</span>
              <span>{formatNumber(Math.floor(quotationFacade.vatAmount || 0))}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="pl-5">Total Amount</span>
              <span>{formatNumber(Math.floor(quotationFacade.totalAmount || 0))}</span>
            </div>
          </div>
        )}
      >
        <Column
          width={50}
          align="center"
          dataIndex={'lineNumber'}
          title={'STT'}
          render={(_value, _row: any, index: number) => {
            return <div className="text-center">{index + 1}</div>;
          }}
        />
        <Column
          className="!p-0.5"
          hidden={quotationFacade.typeCode !== 'QuotationMaterial'}
          width={200}
          dataIndex={'code'}
          title={
            <div className="text-center">
              PRODUCT NAME/
              <br />
              TÊN VẬT TƯ
            </div>
          }
          render={(_value, _row, index) => {
            return (
              <Form.Item name={[index, 'code']}>
                <Select
                  placeholder="Chọn tên vật tư"
                  showSearch
                  optionFilterProp="label"
                  options={productFacade.pagination?.content.map((item: ProductModel) => {
                    return { label: item.name, value: item.code };
                  })}
                  suffixIcon={
                    <Tooltip title="Thêm mới vật tư">
                      <PlusCircleOutlined
                        className="text-green-600"
                        onClick={() =>
                          productFacade.set({
                            isVisible: true,
                            data: undefined,
                            isEdit: false,
                            type: 'VAT_TU',
                            indexAddVatTu: index,
                          })
                        }
                      />
                    </Tooltip>
                  }
                  onChange={(code) => {
                    const donViTinh2 = productFacade.pagination?.content.find(
                      (item: ProductModel) => item.code === code,
                    )?.unit;

                    const donGia2 = productFacade.pagination?.content.find(
                      (item: ProductModel) => item.code === code,
                    )?.sellingUnitPrice;
                    form.setFieldValue(['quotationItem', index, 'unit'], donViTinh2);
                    form.setFieldValue(['quotationItem', index, 'unitPrice'], donGia2);
                    calculateTotalAmount();
                  }}
                />
              </Form.Item>
            );
          }}
        />
        <Column
          className="!p-0.5"
          hidden={quotationFacade.typeCode !== 'QuotationProduct'}
          width={200}
          dataIndex={'code'}
          title={
            <div className="text-center">
              PRODUCT NAME/
              <br />
              TÊN SẢN PHẨM
            </div>
          }
          render={(_value, _row, index) => {
            return (
              <Form.Item name={[index, 'code']}>
                <Select
                  placeholder="Chọn tên sản phẩm"
                  showSearch
                  optionFilterProp="label"
                  options={productFacade.pagination?.content.map((item) => {
                    return { label: item.name, value: item.code };
                  })}
                  suffixIcon={
                    <Tooltip title="Thêm mới sản phẩm">
                      <PlusCircleOutlined
                        className="text-green-600"
                        onClick={() => productFacade.set({ isVisible: true, data: undefined, isEdit: false })}
                      />
                    </Tooltip>
                  }
                  onChange={(code) => {
                    const donViTinh3 = productFacade.pagination?.content.find(
                      (item: ProductModel) => item.code === code,
                    )?.unit;

                    const donGia3 = productFacade.pagination?.content.find(
                      (item: ProductModel) => item.code === code,
                    )?.sellingUnitPrice;
                    form.setFieldValue(['quotationItem', index, 'unit'], donViTinh3);
                    form.setFieldValue(['quotationItem', index, 'unitPrice'], donGia3);
                  }}
                />
              </Form.Item>
            );
          }}
        />
        <Column
          className="!p-0.5"
          dataIndex={'specifications'}
          title={
            <div className="text-center">
              SPECIFICATIONS/
              <br />
              QUY CÁCH
            </div>
          }
          width={200}
          render={(_value, _row, index) => {
            return (
              <Form.Item name={[index, 'specifications']}>
                <CustomFormItem index={index} />
              </Form.Item>
            );
          }}
        />
        <Column
          className="!p-0.5"
          width={100}
          dataIndex={'unit'}
          title={
            <div className="text-center">
              UNIT/
              <br />
              ĐƠN VỊ TÍNH
            </div>
          }
          render={(_value, _row, index) => {
            return (
              <Form.Item name={[index, 'unit']}>
                <Input
                  placeholder="Nhập đơn vị tính"
                  readOnly
                  onBlur={(donViTinh) => {
                    rValue.current = { ...rValue.current, donViTinh };
                  }}
                />
              </Form.Item>
            );
          }}
        />
        <Column
          className="!p-0.5"
          width={100}
          dataIndex={'quantity'}
          title={
            <div className="text-center">
              QUANTINY/
              <br />
              SỐ LƯỢNG
            </div>
          }
          render={(_value, _row, index) => {
            return (
              <Form.Item name={[index, 'quantity']}>
                <InputNumber
                  className="w-full"
                  controls={false}
                  onChange={(quantity) => {
                    const unitPrice = form.getFieldValue(['quotationItem', index, 'unitPrice']) || 0;
                    const discountAmount = form.getFieldValue(['quotationItem', index, 'discountAmount']) || 0;
                    form.setFieldValue(
                      ['quotationItem', index, 'lineAmount'],
                      Number(unitPrice) * Number(quantity) - Number(discountAmount),
                    );
                    calculateTotalAmount();
                  }}
                  placeholder="Nhập số lượng"
                />
              </Form.Item>
            );
          }}
        />
        <Column
          className="!p-0.5"
          width={100}
          dataIndex={'unitPrice'}
          title={
            <div className="text-center">
              PRICE /UNIT
              <br />
              ĐƠN GIÁ
              <br />
              (VND)
            </div>
          }
          render={(_value, _row, index) => {
            return (
              <Form.Item
                name={[index, 'unitPrice']}
                // rules={[{ required: true, message: '' }]}
              >
                <InputNumber
                  className="w-full"
                  readOnly
                  controls={false}
                  onChange={(unitPrice) => {
                    const quantity = form.getFieldValue(['quotationItem', index, 'quantity']) || 0;
                    form.setFieldValue(['quotationItem', index, 'lineAmount'], Number(quantity) * Number(unitPrice));
                    calculateTotalAmount();
                  }}
                  onBlur={(unitPrice) => {
                    rValue.current = { ...rValue.current, unitPrice };
                  }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => `${value}`.replace(/\./g, '')}
                  placeholder="Nhập đơn giá"
                />
              </Form.Item>
            );
          }}
        />
        <Column
          className="!p-0.5"
          width={100}
          dataIndex={'discountAmount'}
          title={
            <div className="text-center">
              DISCOUNT AMOUNT
              <br />
              CHIẾT KHẤU
              <br />
              (VND)
            </div>
          }
          render={(_value, _row, index) => {
            return (
              <Form.Item name={[index, 'discountAmount']}>
                <InputNumber
                  className="w-full"
                  controls={false}
                  onChange={(discountAmount) => {
                    const unitPrice = form.getFieldValue(['quotationItem', index, 'unitPrice']) || 0;
                    const quantity = form.getFieldValue(['quotationItem', index, 'quantity']) || 0;
                    form.setFieldValue(
                      ['quotationItem', index, 'lineAmount'],
                      Number(unitPrice) * Number(quantity) - Number(discountAmount),
                    );
                    calculateTotalAmount();
                  }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, '') : '')}
                  placeholder="Nhập chiết khấu"
                />
              </Form.Item>
            );
          }}
        />
        <Column
          className="!p-0.5"
          width={120}
          dataIndex={'lineAmount'}
          title={
            <div className="text-center">
              AMOUNT/
              <br />
              THÀNH TIỀN
            </div>
          }
          render={(_value, _row, index) => {
            return (
              <Form.Item name={[index, 'lineAmount']}>
                <InputNumber
                  className="w-full"
                  readOnly
                  controls={false}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => `${value}`.replace(/\./g, '')}
                  placeholder="Nhập tổng tiền"
                />
              </Form.Item>
            );
          }}
        />
        <Column
          className="!p-0.5"
          width={120}
          dataIndex={'lineNote'}
          title={
            <div className="text-center">
              NOTE/
              <br />
              GHI CHÚ
            </div>
          }
          align="center"
          render={(_value, _row, index) => {
            return (
              <Form.Item name={[index, 'lineNote']}>
                <TextArea className="w-full" placeholder="Nhập ghi chú" rows={2} />
              </Form.Item>
            );
          }}
        />
        <Column
          className="!p-0.5"
          width={50}
          title={
            <Tooltip title="Thêm dòng">
              <Button
                icon={<PlusCircleOutlined />}
                type="link"
                onClick={() => {
                  add({ lineAmount: 0 });
                  calculateTotalAmount();
                }}
              ></Button>
            </Tooltip>
          }
          fixed="right"
          align="center"
          render={(_value, row: any) => {
            return (
              <Tooltip title="Xóa">
                <Button
                  icon={<MinusCircleOutlined />}
                  type="link"
                  danger
                  onClick={() => {
                    remove(row.name);
                    calculateTotalAmount();
                  }}
                ></Button>
              </Tooltip>
            );
          }}
        />
      </Table>

      <Modal
        title="Nhập quy cách"
        open={quotationFacade.isSpecifications}
        onCancel={handleCloseModal}
        onOk={handleCloseModal}
      >
        <SunEditor
          key={uuidv4()}
          defaultValue={form.getFieldValue(['quotationItem', rIndex.current, 'specifications'])}
          setOptions={{
            width: 'auto',
            height: '200px',
            fontSize: [11, 13, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96, 128],
            buttonList: [
              ['bold', 'underline', 'italic', 'strike'],
              ['fontColor'],
              ['list', 'lineHeight'],
              ['fullScreen'],
            ],
          }}
          placeholder={'Nhập quy cách'}
          onChange={(content) => {
            form.setFieldValue(['quotationItem', rIndex.current, 'specifications'], content);
          }}
        />
      </Modal>
    </>
  );
};

export default QuotationItemTable;
