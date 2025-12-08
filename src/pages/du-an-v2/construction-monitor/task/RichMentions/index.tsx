import { useCallback, useEffect, useRef, useState } from 'react';

import RichTextEditor, { BaseKit } from 'reactjs-tiptap-editor';

import { Attachment } from 'reactjs-tiptap-editor/attachment';
import { Bold } from 'reactjs-tiptap-editor/bold';
import { Color } from 'reactjs-tiptap-editor/color';
import { ExportPdf } from 'reactjs-tiptap-editor/exportpdf';
import { ExportWord } from 'reactjs-tiptap-editor/exportword';
import { FontFamily } from 'reactjs-tiptap-editor/fontfamily';
import { FontSize } from 'reactjs-tiptap-editor/fontsize';
import { Highlight } from 'reactjs-tiptap-editor/highlight';
import { HorizontalRule } from 'reactjs-tiptap-editor/horizontalrule';
import { Image as ImageUpload } from 'reactjs-tiptap-editor/image';
// import { ImageGif } from 'reactjs-tiptap-editor/imagegif';
import { ImportWord } from 'reactjs-tiptap-editor/importword';
import { Italic } from 'reactjs-tiptap-editor/italic';
import { LineHeight } from 'reactjs-tiptap-editor/lineheight';
import { Link } from 'reactjs-tiptap-editor/link';
import { Mention } from 'reactjs-tiptap-editor/mention';
import { TextUnderline } from 'reactjs-tiptap-editor/textunderline';
import { Video } from 'reactjs-tiptap-editor/video';

import 'prism-code-editor-lightweight/layout.css';
import 'prism-code-editor-lightweight/themes/github-dark.css';
import 'reactjs-tiptap-editor/style.css';

import 'easydrawer/styles.css';
import 'katex/dist/katex.min.css';
import 'react-image-crop/dist/ReactCrop.css';

import { DeleteOutlined, SmallDashOutlined } from '@ant-design/icons';
import { EStatusState } from '@models';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import { CommentTaskModel, ExecutionTeamsViewModel, GlobalFacade, TaskCommentFacade, TaskFacade } from '@store';
import { EmptyIcon } from '@svgs';
import { Button, Col, Dropdown, FormInstance, Image, Modal, Row, Select } from 'antd';
import dayjs from 'dayjs';
import '../RichMentions/index.less';

function convertBase64ToBlob(base64: string) {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

function debounce(func: any, wait: number) {
  let timeout: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeout);
    // @ts-ignore
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

let userList: any[] = [];

function TaskEditorCustom({ taskId }: { taskId: any }) {
  const formRef = useRef<FormInstance | undefined>(undefined);

  const [content, setContent] = useState('<p></p>');
  const [theme, setTheme] = useState('light');
  const [listUser, setListUser] = useState<ExecutionTeamsViewModel[]>([]);
  const [taggedUsers, setTaggedUsers] = useState<{ id: string | number; label: string }[]>([]);
  const [editorKey, setEditorKey] = useState(0);
  const [modalApi, contextModalApi] = Modal.useModal();

  const taskFacade = TaskFacade();
  const taskCommentFacade = TaskCommentFacade();
  const { user } = GlobalFacade();
  // const [disable, setDisable] = useState(false);

  useEffect(() => {
    taskCommentFacade.get({
      size: -1,
      filter: JSON.stringify({
        taskId: taskId,
      }),
    });

    // if (taskId) {
    // taskFacade.getById({ id: taskId });
    // }
  }, []);

  useEffect(() => {
    if (taskFacade.data?.executionTeams) {
      const handleRemoveDuplicate = (arr: { employeeName: string }[]) => {
        const seen = new Set();
        return arr.filter((item) => {
          if (seen.has(item.employeeName)) {
            return false;
          }
          seen.add(item.employeeName);
          return true;
        });
      };

      setListUser(handleRemoveDuplicate(taskFacade.data?.executionTeams));
    }
  }, [taskFacade.data?.executionTeams]);

  useEffect(() => {
    switch (taskCommentFacade.status) {
      case EStatusState.postFulfilled:
        setContent('<p></p>');
        setEditorKey((prev) => prev + 1); // Force re-render
        taskCommentFacade.get({
          size: -1,
          filter: JSON.stringify({
            taskId: taskId,
          }),
        });
        taskFacade.getById({ id: taskId });
        break;
      case EStatusState.deleteFulfilled:
        taskCommentFacade.get({
          size: -1,
          filter: JSON.stringify({
            taskId: taskId,
          }),
        });
        taskFacade.getById({ id: taskId });
        break;
    }
  }, [taskCommentFacade.status]);

  // User list for mentions
  userList = listUser?.map((item: ExecutionTeamsViewModel) => ({
    id: item?.employeeId,
    label: item?.employeeName,
  }));

  const extensions = [
    BaseKit.configure({
      placeholder: {
        placeholder: 'Nhập nội dung',
        showOnlyCurrent: false,
      },
      characterCount: false,
    }),
    FontFamily,
    // Heading.configure({ spacer: true }),
    FontSize,
    Bold,
    Italic,
    TextUnderline,
    Color.configure({ spacer: true }),
    Highlight,
    LineHeight,
    Link,
    ImageUpload.configure({
      upload: (files: File) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(URL.createObjectURL(files));
          }, 500);
        });
      },
    }),
    Video.configure({
      upload: (files: File) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(URL.createObjectURL(files));
          }, 500);
        });
      },
    }),
    // ImageGif.configure({
    //   GIPHY_API_KEY: process.env.NEXT_PUBLIC_GIPHY_API_KEY as string,
    // }),
    HorizontalRule,
    ExportPdf.configure({ spacer: true }),
    ImportWord.configure({
      upload: (files: File[]) => {
        const f = files.map((file) => ({
          src: URL.createObjectURL(file),
          alt: file.name,
        }));
        return Promise.resolve(f);
      },
    }),
    ExportWord,
    // TextDirection,
    Mention.configure({
      HTMLAttributes: {
        class: 'mention',
      },
      suggestion: {
        items: ({ query }) => {
          return userList.filter((user) => user.label.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
        },
        render: () => {
          let popup: HTMLElement;

          return {
            onStart: (props) => {
              popup = document.createElement('div');
              popup.className = 'mention-items';

              const list = document.createElement('div');
              props.items.forEach((user) => {
                const item = document.createElement('div');
                item.className = 'mention-item';
                item.textContent = user.label;

                item.addEventListener('click', () => {
                  props.command({ id: user.id, label: user.label });

                  setTaggedUsers((prev) => {
                    const alreadyTagged = prev.find((u) => u.id === user.id);
                    if (alreadyTagged) return prev;
                    return [...prev, { id: user.id, label: user.label }];
                  });

                  popup.remove();
                });

                list.appendChild(item);
              });

              popup.appendChild(list);
              document.body.appendChild(popup);

              const coords = props.clientRect?.();
              if (coords) {
                popup.style.position = 'absolute';
                popup.style.left = `${coords.left}px`;
                popup.style.top = `${coords.bottom}px`;
              }
            },
            onUpdate: (props) => {
              const list = popup.querySelector('div');
              if (!list) return;

              while (list.firstChild) list.firstChild.remove();

              props.items.forEach((user) => {
                const item = document.createElement('div');
                item.className = 'mention-item';
                item.textContent = user.label;

                item.addEventListener('click', () => {
                  props.command({ id: user.id, label: user.label });

                  setTaggedUsers((prev) => {
                    const alreadyTagged = prev.find((u) => u.id === user.id);
                    if (alreadyTagged) return prev;
                    return [...prev, { id: user.id, label: user.label }];
                  });

                  popup.remove();
                });

                list.appendChild(item);
              });
            },
            onKeyDown: (props) => {
              if (props.event.key === 'Escape') {
                popup.remove();
                return true;
              }
              return false;
            },
            onExit: () => {
              popup?.remove();
            },
          };
        },
      },
    }),
    Attachment.configure({
      upload: (file: any) => {
        // fake upload return base 64
        const reader = new FileReader();
        reader.readAsDataURL(file);

        return new Promise((resolve) => {
          setTimeout(() => {
            const blob = convertBase64ToBlob(reader.result as string);
            resolve(URL.createObjectURL(blob));
          }, 300);
        });
      },
    }),

    // Katex,
    // Excalidraw,
    // Mermaid.configure({
    //   upload: (file: any) => {
    //     // fake upload return base 64
    //     const reader = new FileReader();
    //     reader.readAsDataURL(file);

    //     return new Promise((resolve) => {
    //       setTimeout(() => {
    //         const blob = convertBase64ToBlob(reader.result as string);
    //         resolve(URL.createObjectURL(blob));
    //       }, 300);
    //     });
    //   },
    // }),
    // Drawer.configure({
    //   upload: (file: any) => {
    //     // fake upload return base 64
    //     const reader = new FileReader();
    //     reader.readAsDataURL(file);

    //     return new Promise((resolve) => {
    //       setTimeout(() => {
    //         const blob = convertBase64ToBlob(reader.result as string);
    //         resolve(URL.createObjectURL(blob));
    //       }, 300);
    //     });
    //   },
    // }),
    // Twitter,
  ];

  const onValueChange = useCallback(
    debounce((value: any) => {
      setContent(value);
    }, 100),
    [],
  );

  const handleDelete = (commentId: string) => {
    modalApi.confirm({
      title: 'Xoá bình luận',
      content: 'Bạn có chắc chắn muốn xoá bình luận này ?',
      onOk: () => {
        taskCommentFacade.delete(commentId);
      },
      onCancel: () => {},
      cancelText: 'Huỷ bỏ',
      okText: 'Xác nhận',
    });
  };

  const onSubmit = () => {
    const values: CommentTaskModel = {
      content: content,
      taskId: taskId,
      tagIds: taggedUsers?.map((item: any) => item?.id),
    };

    taskCommentFacade.post(values);
  };

  return (
    <main
      style={{
        padding: '0 10px',
      }}
    >
      <div>
        <RichTextEditor
          key={editorKey}
          dark={theme === 'dark'}
          hideBubble={true}
          output="html"
          content={content as any}
          onChangeContent={onValueChange}
          extensions={extensions}
        />
        <div className={'flex justify-end mt-2'}>
          <Button onClick={onSubmit} disabled={content === '<p></p>' || content === null} type={'primary'}>
            Gửi
          </Button>
        </div>
      </div>

      <Row gutter={16} className={'mt-4'}>
        <Col xs={12}>
          <SearchWidget
            placeholder={'Tìm kiếm bình luận'}
            form={(form) => (formRef.current = form)}
            callback={(value) => {
              taskCommentFacade.get({
                page: 1,
                size: -1,
                filter: JSON.stringify({
                  FullTextSearch: value,
                  taskId: taskId,
                }),
              });
            }}
          />
        </Col>
        <Col xs={12}>
          <Select
            onChange={(value: string) => {
              if (value) {
                taskCommentFacade.get({
                  size: -1,
                  filter: JSON.stringify({
                    taskId: taskId,
                    participantId: value,
                  }),
                });
              } else {
                taskCommentFacade.get({
                  size: -1,
                  filter: JSON.stringify({
                    taskId: taskId,
                  }),
                });
              }
            }}
            className={'w-full'}
            allowClear
            showSearch
            optionFilterProp={'label'}
            placeholder={'Chọn người bình luận'}
            options={userList?.map((item: any) => ({
              label: item?.label,
              value: item?.id,
            }))}
          />
        </Col>
      </Row>

      <div className={'mt-4 h-[376px] mb-2 overflow-y-auto miniScroll'}>
        {taskCommentFacade.pagination?.content && taskCommentFacade.pagination?.content?.length > 0 ? (
          taskCommentFacade?.pagination?.content?.map((item: CommentTaskModel | any, index: number) => {
            return (
              <div key={index} className={'flex justify-between mt-2'}>
                <div className={'flex gap-4 mb-2'}>
                  <div>
                    <Image className={'rounded-full'} src={item?.avatarUrl} width={40} height={40} />
                  </div>

                  <div>
                    <p className={'font-bold text-[#003A8C]'}>{item?.createdByUserName}</p>

                    <p className={'text-[#ccc]'}>{dayjs(item?.createdOnDate).format('DD/MM/YYYY HH:mm:ss')}</p>

                    <p dangerouslySetInnerHTML={{ __html: item?.content }} />
                  </div>
                </div>

                <Dropdown
                  placement="bottomRight"
                  menu={{
                    items: [
                      // {
                      //   key: 'reply',
                      //   label: (
                      //       <div className={'flex gap-2'}>
                      //         <MessageOutlined />
                      //         Trả lời
                      //       </div>
                      //   ),
                      // },
                      // {
                      //   disabled: user?.userModel?.id !== item?.createdByUserId,
                      //   key: 'edit',
                      //   label: (
                      //       <div className={'flex gap-2'}>
                      //         <EditOutlined />
                      //         Chỉnh sửa
                      //       </div>
                      //   ),
                      // },
                      {
                        disabled: user?.userModel?.id !== item?.createdByUserId,
                        key: 'delete',
                        label: (
                          <div className={'flex gap-2'} onClick={() => handleDelete(item?.id)}>
                            <DeleteOutlined />
                            Xoá
                          </div>
                        ),
                      },
                    ],
                  }}
                >
                  <div className={'h-2 mr-4'}>
                    <SmallDashOutlined />
                  </div>
                </Dropdown>
              </div>
            );
          })
        ) : (
          <div className="mt-20 text-center">
            <div className="flex justify-center mb-2">
              <EmptyIcon />
            </div>
            <p className="font-medium text-stone-400">Chưa có bình luận</p>
          </div>
        )}
      </div>

      {contextModalApi}
    </main>
  );
}

export default TaskEditorCustom;
