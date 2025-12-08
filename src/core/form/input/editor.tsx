import { API, keyToken, linkApi } from '@utils';
import classNames from 'classnames';
import { useLocation } from 'react-router';
import SunEditor from 'suneditor-react';

const Component = ({
  onChange,
  value = '',
  placeholder,
  disabled,
  action,
}: {
  onChange?: (values: string) => void;
  value?: string;
  placeholder: string;
  disabled: boolean;
  action: string;
}) => {
  return (
    <div className={classNames({ 'mb-24': useLocation().pathname === '/vn/huong-dan' })}>
      <SunEditor
        setOptions={{
          width: 'auto',
          height: action === 'noImage' ? '200px' : '300px',
          fontSize: [11, 13, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96, 128],
          buttonList: [
            ['undo', 'redo'],
            ['font', 'fontSize', 'formatBlock'],
            ['paragraphStyle', 'blockquote'],
            ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
            ['fontColor', 'hiliteColor', 'textStyle'],
            ['removeFormat'],
            // '/', // Line break
            ['outdent', 'indent'],
            ['align', 'horizontalRule', 'list', 'lineHeight'],
            ['table', 'link', ...(action === 'noImage' ? [] : ['image', 'video', 'audio']) /** ,'math' */], // You must add the 'katex' library at options to use the 'math' plugin.
            /** ['imageGallery'] */ // You must add the "imageGalleryUrl".
            ['fullScreen', 'showBlocks', 'codeView'],
            // ['preview', 'print'],
            // ['save', 'template'],
            /** ['dir', 'dir_ltr', 'dir_rtl'] */ // "dir": Toggle text direction, "dir_ltr": Right to Left, "dir_rtl": Left to Right
          ],
        }}
        onImageUploadBefore={(files, info, uploadHandler) => {
          const bodyFormData = new FormData();
          bodyFormData.append('file', files[0]);
          API.responsible(
            linkApi + `/upload/blob/` + action,
            {},
            {
              ...API.init(),
              method: 'post',
              body: bodyFormData,
              headers: {
                authorization: localStorage.getItem(keyToken) ? 'Bearer ' + localStorage.getItem(keyToken) : '',
                'Accept-Language': localStorage.getItem('i18nextLng') || '',
              },
            },
          ).then(({ data }: any) => {
            uploadHandler({
              result: [
                {
                  url: data.fileUrl,
                  name: data.fileName,
                  size: data.fileSize,
                },
              ],
            });
          });
          return false;
        }}
        setContents={value}
        onChange={onChange}
        placeholder={placeholder}
        disable={disabled}
      />
    </div>
  );
};
export default Component;
