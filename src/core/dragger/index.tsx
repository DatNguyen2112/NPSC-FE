import classNames from 'classnames';
import React, { Fragment, PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {PlusOutlined} from '@ant-design/icons';
import { PopConfirm } from '@core/pop-confirm';
import { Arrow } from '@svgs';
import {API, keyToken, linkApi, uuidv4} from '@utils';
import {Upload, Image, Button} from 'antd';
import { Message } from '../message';
import {ProductFacade} from "@store";

export const Dragger = ({
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
                         text = 'Tải lên',
                         params,
                         url,
                         validation = async () => true,
                         isShowImage = true,
                       }: Type) => {
  const { t } = useTranslation();
  // const { formatDate } = useAuth();
  const [isLoading, set_isLoading] = useState(false);
  const ref = useRef<any>();
  const [imageUrl, setImageUrl] = useState<string[]>([]);
  const productFacade = ProductFacade()
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
      set_listFiles(tempData);
    }
  }, [value, multiple]);

  const onUpload = async ({ target }: any) => {
    for (let i = 0; i < target.files.length; i++) {
      const file = target.files[i];
      if (maxSize && file.size > maxSize * 1024 * 1024) {
        await Message.error({
          text: `${file.name} (${(file.size / (1024 * 1024)).toFixed(1)}mb): ${t('components.form.ruleMaxSize', {
            max: maxSize,
          })}`,
        });
        return set_listFiles(listFiles.filter((_item: any) => _item.id !== dataFile.id));
      }

      if (!(await validation(file, listFiles))) {
        return set_listFiles(listFiles.filter((_item: any) => _item.id !== dataFile.id));
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
        listFiles[0] = dataFile;
      } else {
        listFiles.push(dataFile);
      }
      set_listFiles(listFiles);

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
                ? listFiles.map((item: any) => {
                  if (item.id === dataFile.id) {
                    item = { ...item, ...data, status: 'done' };
                  }
                  return item;
                })
                : [{ ...data, status: 'done' }];
              set_listFiles(files);
              onChange && (await onChange(files));
            } else {
              set_listFiles(listFiles.filter((_item: any) => _item.id !== dataFile.id));
            }
          }

          if (res?.data) {
            const files = multiple
              ? listFiles.map((item: any) => {
                if (item.id === dataFile.id) {
                  item = { ...item, ...res.data, status: 'done' };
                }
                return item;
              })
              : [{ ...res.data, status: 'done' }];
            set_listFiles(files);
            onChange && (await onChange(files));
          } else {
            set_listFiles(listFiles.filter((_item: any) => _item.id !== dataFile.id));
          }
        } else {
          // Không cần quan tâm cái dưới
          try {
            const data = await action(file, {
              onUploadProgress: (event: any) => {
                set_listFiles(
                  listFiles.map((item: any) => {
                    if (item.id === dataFile.id) {
                      item.percent = (event.loaded / event.total) * 100;
                      item.status = item.percent === 100 ? 'done' : 'uploading';
                    }
                    return item;
                  }),
                );
              },
            });
            const files = multiple
              ? listFiles.map((item: any) => {
                if (item.id === dataFile.id) {
                  item = { ...item, ...data.data, status: 'done' };
                }
                return item;
              })
              : [{ ...data.data, status: 'done' }];
            set_listFiles(files);
            onChange && (await onChange(files));
          } catch (e: any) {
            set_listFiles(listFiles.filter((_item: any) => _item.id !== dataFile.id));
          }
        }
        // setTimeout(() => {
        //   // @ts-ignore
        //   // import('glightbox').then(({ default: GLightbox }) => new GLightbox());
        // });
        set_isLoading(false);
      }
    }
    ref.current.value = '';
  };
  const moverImage = async (index: number, new_index: number) => {
    if (multiple) {
      const files = array_move(listFiles, index, new_index);
      set_listFiles(files);
      onChange && (await onChange(files));
    }
  };

  const array_move = (arr: any[], old_index: number, new_index: number) => {
    if (new_index >= arr.length) {
      let k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr.filter((item) => !!item);
  };
  return (
    <Fragment>
      <div className={'flex gap-2'}>
        <Upload.Dragger
          className={`${imageUrl.length > 0 ? 'w-40 h-28' : 'w-full h-32'}`}
          accept={'image/*'}
          showUploadList={false}
          action={`${linkApi}/upload/blob/attach`}
          onChange={ (info) => {
            const { status } = info.file;
            if (status !== 'uploading') {
            const data = info.file.response.data;
            const attachment = [
              {
                id: data.id ?? '',
                doctype: data.docType,
                fileUrl: data.fileUrl,
                entityType: 'attach',
                description: data.description
              }
            ]
              productFacade.set({filePath: attachment});
              setImageUrl((prevState) => [
                ...prevState,
                data.fileUrl
                ]
              )


          }}
          }
        >
          <Button
            type={'text'}
            loading={isLoading}
            icon={<PlusOutlined />}
            onClick={() => ref.current?.click()}
            className={`!px-2 !py-0.5 !font-normal ${style}`}
          >
          </Button>
          {
            productFacade.data?.attachments?.length == 0 || productFacade.data === undefined &&
            <p>
              Kéo thả hoặc <a> tải ảnh lên từ thiết bị</a>
            </p>
          }
        </Upload.Dragger>


        {
          imageUrl.length > 0 && imageUrl.map((item, index) =>
            <Image key={index} src={item} width={120} height={110} alt={'image'}/>
          )

        }
      </div>
      <>
        {isShowImage && (
          <div
            className={classNames({
              'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4': multiple,
              'w-24': !multiple,
            })}
          >
            {listFiles.map((file: any, index: number) => (
              <div
                key={uuidv4()}
                className={classNames('relative mt-2', {
                  'bg-yellow-100': file.status === 'error',
                })}
              >
                <Image
                  className={classNames('object-cover object-center !h-24 rounded-md border border-gray-300', {
                    '!w-full': multiple,
                    '!w-24': !multiple,
                  })}
                  src={file[keyImage] ? file[keyImage] : file}
                  alt={file.name}
                />
                {index > 0 && (
                  <div
                    onClick={() => moverImage(index, index - 1)}
                    className={
                      'absolute top-1 right-1 bg-gray-300 hover:bg-teal-900 text-white rounded-full cursor-pointer w-6 h-6 transition-all duration-300 flex items-center justify-center'
                    }
                  >
                    <Arrow className={'h-3 w-3 fill-teal-700 hover:fill-white rotate-180'} />
                  </div>
                )}

                {index < listFiles.length - 1 && (
                  <div
                    onClick={() => moverImage(index, index + 1)}
                    className={classNames(
                      'absolute right-1 bg-gray-300 hover:bg-teal-900 text-white rounded-full cursor-pointer w-6 h-6 transition-all duration-300 flex items-center justify-center',
                      {
                        'top-8': index > 0,
                        'top-1': index === 0,
                      },
                    )}
                  >
                    <Arrow className={'h-3 w-3 fill-teal-700 hover:fill-white'} />
                  </div>
                )}

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
                          'top-16 ': listFiles.length > 1 && index > 0 && index < listFiles.length - 1,
                          'top-8': listFiles.length > 1 && (index === 0 || index === listFiles.length - 1),
                          'top-1': listFiles.length === 1,
                        },
                      )}
                    ></i>
                  </PopConfirm>
                )}
              </div>
            ))}
          </div>
        )}
      </>
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
