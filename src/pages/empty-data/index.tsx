import React from 'react';
import { Empty, Image, Typography } from 'antd';

const EmptyData: React.FC = () => (
  <Empty
    className={'pb-4'}
    imageStyle={{ height: 140 }}
    image={
      <Image
        src={'/assets/images/empty-data.jpg'}
        width={120}
        height={140}
        alt={'empty-data'}
        preview={false}
        className={'pb-8'}
      />
    }
    description={
      <Typography.Text>
        {/*<Image src={'/public/assets/images/empty-data.jpg'} width={240} height={160} alt={'empty-data'} />*/}
        <p className={'text-base font-semibold'}>
          Không tìm thấy dữ liệu nào phù hợp với điều kiện lọc hoặc từ khoá tìm kiếm
        </p>
        <span className={'text-gray-400 pb-6'}>Thử thay đổi điều kiện lọc hoặc từ khóa tìm kiếm</span>
      </Typography.Text>
    }
  ></Empty>
);
export default EmptyData;
