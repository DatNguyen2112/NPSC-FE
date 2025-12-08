import React, { useState, useEffect, lazy, Suspense } from 'react';
import 'leaflet/dist/leaflet.css';
import { Button, Form, Modal, Spin } from 'antd';
import { AddressFacade, ConstructionFacade } from '@store';
import MyMap from '@pages/du-an-v2/construction/MapView';

function AddressPicker({form} : {form: any}) {
  const constructionFacade = ConstructionFacade();
  const addressFacade = AddressFacade();

  const fakeLat = 21.0040399;
  const fakeLng = 105.8425128;

  // const provinceCode = Form.useWatch('provinceCode', form);
  // const districtCode = Form.useWatch('districtCode', form);

  //console.log(provinceCode)

  const [position, setPosition] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState<[string, string] | any>({
    province: '',
    district: '',
    ward: '',
    street: '',
    provinceCode: '',
    wareCode: '',
    districtCode: '',
    placement: '',
  });

  const normalizeName = (name: string) => {
    const PREFIXES = [
      'Quận',
      'Huyện',
      'Thành phố',
      'Tỉnh',
      'Xã',
      'Phường',
      'Thị xã',
      'Thị trấn',
    ];

    const prefixPattern = new RegExp(`^(${PREFIXES.join('|')})\\s+`, 'i');
    return (
      name
        .replace(prefixPattern, "") // Xóa tiền tố
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Bỏ dấu
        .toLowerCase()
        .replace(/\s+/g, "") // Xóa toàn bộ khoảng trắng
    );
  };

  useEffect(() => {
    addressFacade.getTinh();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          await fetchAddress(latitude, longitude);
        },
        async (error) => {
          console.error('Lỗi khi lấy vị trí:', error);
          // fallback nếu lỗi
          setPosition([fakeLat, fakeLng]);
          await fetchAddress(fakeLat, fakeLng);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    if (address?.provinceCode) {
      addressFacade.getHuyen({ filter: JSON.stringify({ parentId: address?.provinceCode })});
    }
  }, [address?.provinceCode]);

  const valueHuyen = addressFacade?.listHuyen?.find((items) => normalizeName(items?.label) === normalizeName(address?.district))?.value

  useEffect(() => {
    if (valueHuyen) {
      addressFacade.getXa({ filter: JSON.stringify({ parentId: valueHuyen }) });
    }
  }, [valueHuyen]);

  const valueXa = addressFacade?.listXa?.find((items) => normalizeName(items?.label) === normalizeName(address?.ward))?.value

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=vi`
      );

      if (!response.ok) throw new Error('Lỗi khi gọi API địa chỉ');

      const result = await response.json();
      const data = result.address;

      //console.log(result)

      const rawProvince = data.state || data.city || '';
      const matchedProvince = addressFacade.listTinh?.find((p) => normalizeName(p.label) === normalizeName(rawProvince));

      setAddress({
        province: rawProvince,
        district:
          data.city_district || data.suburb || data.county || data.city || data.neighbourhood || '',
        ward: data.quarter || data.town || data.suburb || data.village || '',
        street:
          (data.amenity ? `${data.road}, ${data.amenity}` : `${data.road}`) ||
          (data.industrial ? `${data.road}, ${data.industrial}` : `${data.road}`) ||
          (data.residential ? `${data.residential}` : `${data.road}`) ||
          '',
        provinceCode: matchedProvince?.value,
        placement: result.display_name || '',
      });
    } catch (error) {
      console.error('Lỗi khi lấy địa chỉ:', error);
    }
  };

  const onSubmit = () => {
    form.setFieldsValue({
      provinceCode: address?.provinceCode,
      districtCode: valueHuyen,
      wardCode: valueXa,
      address: address?.placement,
    })

    constructionFacade.set({isOpenQuickAddressPicker: false})
  }

  return (
    <Modal title={'Chọn nhanh trên bản đồ'} width={800} open={constructionFacade.isOpenQuickAddressPicker} onCancel={() => constructionFacade.set({
      isOpenQuickAddressPicker: false
    })} okText={<Button onClick={onSubmit} type={"primary"}>
      Lưu lại
    </Button>}>
      <div className="space-y-4">
        {position ? (
          <MyMap
            position={position}
            setPosition={setPosition}
            fetchAddress={fetchAddress}/>
        ) : (
          <div className={'flex flex-col justify-center h-[400px]'}>
            <Spin spinning={true}>
            </Spin>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default AddressPicker;
