import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { ConstructionFacade } from '@store';
import { linkFile, uuidv4 } from '@utils';
import { App, Button, Checkbox, Modal } from 'antd';
import { FC, useState } from 'react';

const ImportFileModal: FC = () => {
  const { message } = App.useApp();
  const constructionFacade = ConstructionFacade();
  const [file, setFile] = useState<File | null>(null);
  const [isOverwrite, setIsOverwrite] = useState(false);

  const handleCancel = () => {
    constructionFacade.set({
      isImportFileModalOpen: false,
    });
  };

  const handleSelectFile = () => {
    const inputEl = document.createElement('input');
    inputEl.type = 'file';
    inputEl.accept = '.xlsx, .xls';
    inputEl.onchange = async (e: any) => {
      inputEl.onchange = null;
      setFile(e.target.files[0] || null);
    };
    inputEl.click();
  };

  const handleImportExcel = () => {
    if (!file) return;

    const messageKey = uuidv4();
    message.loading({ content: 'Đang nhập file...', duration: 60000, key: messageKey });
    constructionFacade.importExcel(file, isOverwrite).finally(() => {
      message.destroy(messageKey);
    });
  };

  return (
    <Modal
      title="Nhập file danh sách công trình"
      open={constructionFacade.isImportFileModalOpen}
      okText="Nhập danh sách công trình"
      cancelText="Huỷ"
      onCancel={handleCancel}
      onOk={handleImportExcel}
      confirmLoading={constructionFacade.isImportingFile}
      okButtonProps={{
        disabled: constructionFacade.isImportingFile || !file,
      }}
      afterOpenChange={(open) => {
        if (!open) {
          setFile(null);
          setIsOverwrite(false);
        }
      }}
    >
      <div className="space-y-4 my-8">
        {file ? (
          <div className="flex">
            <div className="flex-1 h-9 flex items-center border rounded-l-[3px] text-ellipsis overflow-hidden font-medium px-4 -mr-[1px] whitespace-nowrap">
              {file.name}
            </div>
            <Button
              variant="outlined"
              color="danger"
              icon={<DeleteOutlined />}
              onClick={() => setFile(null)}
              className="!rounded-l-none"
            />
          </div>
        ) : (
          <Button icon={<UploadOutlined />} onClick={handleSelectFile}>
            Tải lên file danh sách công trình
          </Button>
        )}
        <p className="mt-2">
          Tải file mẫu nhập danh sách công trình{' '}
          <a
            download="ConstructionTemplate.xlsx"
            href={linkFile + '/excel-template/ConstructionTemplate.xlsx'}
            target="_blank"
            rel="noreferrer"
          >
            tại đây
          </a>
        </p>
        <Checkbox className="mt-2" checked={isOverwrite} onChange={(e) => setIsOverwrite(e.target.checked)}>
          Ghi đè thông tin công trình đã có
        </Checkbox>
        <div className="font-medium">
          <p>Lưu ý</p>
          <p>- Việc ghi đè sẽ xoá hết các thông tin cũ của công trình bị đè để lưu thông tin mới</p>
          <p>- Tính năng này không dùng để cập nhật hàng loạt công trình</p>
        </div>
      </div>
    </Modal>
  );
};

export default ImportFileModal;
