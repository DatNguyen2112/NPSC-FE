import classNames from 'classnames';
import { Fragment, PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PlusOutlined } from '@ant-design/icons';
import { PopConfirm } from '@core/pop-confirm';
import { API, keyToken, uuidv4 } from '@utils';
import { Button, Image } from 'antd';
import { Message } from '@core/message';
import React from 'react';

export const Upload = ({
  value = [],
  onChange,
  deleteFile,
  showBtnDelete = () => true,
  method = 'post',
  maxSize = 40,
  multiple = true,
  action = '',
  keyImage = 'fileUrl',
  accept = 'image/*',
  style = '',
  params,
  url,
  validation = async () => true,
  isShowImage = true,
}: Type) => {
  const { t } = useTranslation();
  // const { formatDate } = useAuth();
  const [isLoading, set_isLoading] = useState(false);
  const ref = useRef<any>();
  const [listFiles, set_listFiles] = useState(
    multiple && value && typeof value === 'object'
      ? value.map((_item: any) => {
          if (_item.status) return _item;
          return {
            ..._item,
            status: 'done',
          };
        })
      : value && value?.length > 0
        ? value
        : [],
  );
  useEffect(() => {
    const tempData =
      !multiple && value && Array.isArray(value)
        ? value.map((_item: any) => {
            if (_item.status) return _item;
            return {
              ..._item,
              status: 'done',
            };
          })
        : value && value?.length > 0
          ? value
          : [];
    if (
      JSON.stringify(listFiles) !== JSON.stringify(tempData) &&
      listFiles.filter((item: any) => item.status === 'uploading').length === 0
    ) {
      set_listFiles([...tempData]);
    }
  }, [value, multiple]);

  const onUpload = async ({ target }: any) => {
    let tmpListFiles = [...listFiles];

    for (let i = 0; i < target.files.length; i++) {
      const file = target.files[i];
      if (maxSize && file.size > maxSize * 1024 * 1024) {
        await Message.error({
          text: `${file.name} (${(file.size / (1024 * 1024)).toFixed(1)}mb): ${t('components.form.ruleMaxSize', {
            max: maxSize,
          })}`,
        });
        return set_listFiles(tmpListFiles.filter((_item: any) => _item.id !== dataFile.id));
      }

      if (!(await validation(file, tmpListFiles))) {
        return set_listFiles(tmpListFiles.filter((_item: any) => _item.id !== dataFile.id));
      }
      const thumbUrl = await new Promise((resolve) => {
        const fileReader = new FileReader();
        fileReader.onload = () => resolve(fileReader.result);
        fileReader.readAsDataURL(file);
      });
      const dataFile = {
        lastModified: file.lastModified,
        lastModifiedDate: file.lastModifiedDate,
        name: file.name,
        size: file.size,
        type: file.type,
        originFileObj: file,
        thumbUrl,
        id: uuidv4(),
        percent: 0,
        status: 'uploading',
      };

      if (!multiple) {
        tmpListFiles = [dataFile];
      } else {
        tmpListFiles.push(dataFile);
      }

      if (action) {
        set_isLoading(true);
        if (typeof action === 'string') {
          const bodyFormData = new FormData();
          bodyFormData.append('file', file);
          let res: any;
          if (url) {
            res = await API.responsible<any>(url, params ?? {}, {
              ...API.init(),
              method,
              body: bodyFormData,
              headers: {
                authorization: localStorage.getItem(keyToken) ? 'Bearer ' + localStorage.getItem(keyToken) : '',
                'Accept-Language': localStorage.getItem('i18nextLng') || '',
              },
            });
          } else {
            const { data } = await API.responsible<any>(
              '/upload/blob/' + action,
              {},
              {
                ...API.init(),
                method,
                body: bodyFormData,
                headers: {
                  authorization: localStorage.getItem(keyToken) ? 'Bearer ' + localStorage.getItem(keyToken) : '',
                  'Accept-Language': localStorage.getItem('i18nextLng') || '',
                },
              },
            );
            if (data) {
              const files = multiple
                ? tmpListFiles.map((item: any) => {
                    if (item.id === dataFile.id) {
                      item = { ...item, ...data, status: 'done' };
                    }
                    return item;
                  })
                : [{ ...data, status: 'done' }];
              tmpListFiles = files;
              onChange && (await onChange(files));
            } else {
              tmpListFiles = tmpListFiles.filter((_item: any) => _item.id !== dataFile.id);
            }
          }

          if (res?.data) {
            const files = multiple
              ? tmpListFiles.map((item: any) => {
                  if (item.id === dataFile.id) {
                    item = { ...item, ...res.data, status: 'done' };
                  }
                  return item;
                })
              : [{ ...res.data, status: 'done' }];
            tmpListFiles = files;
            onChange && (await onChange(files));
          } else {
            tmpListFiles = tmpListFiles.filter((_item: any) => _item.id !== dataFile.id);
          }
        } else {
          // Không cần quan tâm cái dưới
          try {
            const data = await action(file, {
              onUploadProgress: (event: any) => {
                tmpListFiles = tmpListFiles.map((item: any) => {
                  if (item.id === dataFile.id) {
                    item.percent = (event.loaded / event.total) * 100;
                    item.status = item.percent === 100 ? 'done' : 'uploading';
                  }
                  return item;
                });
              },
            });
            const files = multiple
              ? tmpListFiles.map((item: any) => {
                  if (item.id === dataFile.id) {
                    item = { ...item, ...data.data, status: 'done' };
                  }
                  return item;
                })
              : [{ ...data.data, status: 'done' }];
            tmpListFiles = files;
            onChange && (await onChange(files));
          } catch (e: any) {
            tmpListFiles = tmpListFiles.filter((_item: any) => _item.id !== dataFile.id);
          }
        }
        // setTimeout(() => {
        //   // @ts-ignore
        //   // import('glightbox').then(({ default: GLightbox }) => new GLightbox());
        // });
        set_isLoading(false);
      }
    }

    set_listFiles(tmpListFiles);
    ref.current!.value = '';
  };

  return (
    <Fragment>
      <div className={`flex gap-2 w-full ${style} flex-wrap`}>
        <input type="file" className={'!hidden'} accept={accept} multiple={multiple} ref={ref} onChange={onUpload} />
        <>
          {isShowImage && (
            <div className={'flex gap-1 flex-wrap w-full'}>
              {listFiles.length <= 5 ? (
                listFiles.map((file: any) => (
                  <div
                    key={uuidv4()}
                    className={classNames('relative ', {
                      'bg-yellow-100': file.status === 'error',
                    })}
                  >
                    <Image
                      width={150}
                      height={150}
                      src={file[keyImage] ? file[keyImage] : file.thumbUrl}
                      alt={file.name}
                    />
                    {showBtnDelete(file) && (
                      <PopConfirm
                        title={t('components.datatable.areYouSureWant')}
                        onConfirm={async () => {
                          if (deleteFile && file?.id) {
                            const data = await deleteFile(file?.id);
                            if (!data) {
                              return false;
                            }
                          }
                          onChange && onChange(listFiles.filter((_item: any) => _item.id !== file.id));
                        }}
                      >
                        <i
                          className={classNames(
                            'las text-lg la-trash !bg-gray-300 !rounded-full absolute right-1 hover:!bg-red-500 text-white cursor-pointer w-6 h-6 transition-all duration-300 flex items-center justify-center',
                            {
                              'top-1': listFiles.length,
                            },
                          )}
                        ></i>
                      </PopConfirm>
                    )}
                  </div>
                ))
              ) : (
                <div />
              )}
              <Button
                loading={isLoading}
                onClick={() => ref.current.click()}
                className={`h-[150px] w-[150px] relative`}
                type={'dashed'}
              >
                <div className="flex flex-col items-center justify-center">
                  <div>
                    <PlusOutlined style={{ fontSize: '30px' }} className="mb-4 w-full" />
                  </div>
                  <p>Tải lên</p>
                </div>
              </Button>
            </div>
          )}
        </>
      </div>
    </Fragment>
  );
};
type Type = PropsWithChildren<{
  value?: any[];
  text?: string;
  style?: string;
  url?: string;
  onChange?: (values: any[]) => any;
  deleteFile?: any;
  showBtnDelete?: (file: any) => boolean;
  method?: string;
  maxSize?: number;
  multiple?: boolean;
  right?: boolean;
  action?: string | ((file: any, config: any) => any);
  keyImage?: string;
  accept?: string;
  validation?: (file: any, listFiles: any) => Promise<boolean>;
  children?: JSX.Element[] | JSX.Element;
  isShowImage?: boolean;
  params?: any;
}>;
