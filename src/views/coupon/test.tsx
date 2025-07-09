import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const CouponTest: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>优惠券测试页面</Title>
        <p>如果您能看到这个页面，说明路由配置正常工作。</p>
      </Card>
    </div>
  );
};

export default CouponTest;
