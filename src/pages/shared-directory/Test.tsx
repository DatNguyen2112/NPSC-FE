import { Button, Drawer } from 'antd';
import { useState } from 'react';

const Test = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <Drawer open={isOpen} onClose={() => setIsOpen(false)} />
      <Button onClick={() => setIsOpen(true)}>Open</Button>
    </>
  );
};

export default Test;
