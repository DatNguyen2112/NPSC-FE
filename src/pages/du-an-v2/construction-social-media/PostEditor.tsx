import {
  useRef,
  MouseEvent as ReactMouseEvent,
  useEffect,
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import Editor from './Editor';
import {
  CameraOutlined,
  CloseOutlined,
  DeleteOutlined,
  LoadingOutlined,
  SaveOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { T_Attachment } from '@models';
import { API, keyToken, uuidv4 } from '@utils';
import { SocialMediaFacade, SocialMediaPostModel } from '@store';
import { Editor as TiptapEditor } from '@tiptap/react';
import { customMessage } from 'src';

interface PostEditorProps {
  onClose?: () => void;
  post?: SocialMediaPostModel;
}

export type PostEditorRef = {
  focus: () => void;
};

const PostEditor = forwardRef<PostEditorRef, PostEditorProps>(({ onClose, post }, ref) => {
  const socialMediaFacade = SocialMediaFacade();
  const [attachments, setAttachments] = useState<T_Attachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState<string[]>([]);
  const [isContentEmpty, setIsContentEmpty] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const editorRef = useRef<TiptapEditor>(null);
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = x - startX.current;
    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.userSelect = 'auto';
    }
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeft.current = scrollContainerRef.current.scrollLeft;
    scrollContainerRef.current.style.userSelect = 'none';

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleSelectImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    input.onchange = (e) => {
      input.onchange = null;
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      [...files].forEach(async (file) => {
        const tmpId = uuidv4();
        setAttachments((x) => [
          ...x,
          {
            id: tmpId,
            fileName: file.name,
            fileUrl: URL.createObjectURL(file),
            fileType: file.type,
            fileSize: file.size,
          },
        ]);
        setLoadingAttachments((prev) => [...prev, tmpId]);

        const formData = new FormData();
        formData.set('file', file);

        const res = await API.responsible<T_Attachment>(
          '/upload/blob/attach',
          {},
          {
            ...API.init(),
            method: 'post',
            body: formData,
            headers: {
              authorization: localStorage.getItem(keyToken) ? 'Bearer ' + localStorage.getItem(keyToken) : '',
              'Accept-Language': localStorage.getItem('i18nextLng') || '',
            },
          },
        );

        if (res.data) {
          setAttachments((prev) => {
            const index = prev.findIndex((y) => y.id === tmpId);
            if (index !== -1) {
              prev[index] = { ...res.data };
            }
            return [...prev];
          });
          setLoadingAttachments((prev) => prev.filter((x) => x !== tmpId));
        }
      });
    };
    input.click();
  };

  const handleSendPost = () => {
    if (!editorRef.current) return;
    if (!editorRef.current.getText()?.trim()) {
      customMessage.error({ content: 'Vui lòng nhập nội dung bài viết' });
      return;
    }

    const data: Partial<SocialMediaPostModel> = {
      content: JSON.stringify(editorRef.current.getJSON()),
      attachments: attachments.filter((x) => !loadingAttachments.includes(x.id!)),
    };

    if (post) {
      socialMediaFacade.updatePost({ ...data, id: post.id }).finally(() => {
        editorRef.current?.commands.clearContent(true);
        setAttachments([]);
        onClose?.();
      });
    } else {
      socialMediaFacade.createPost(data).finally(() => {
        editorRef.current?.commands.clearContent(true);
        setAttachments([]);
        onClose?.();
      });
    }
  };

  useEffect(() => {
    if (post) {
      editorRef.current?.commands.setContent(JSON.parse(post.content ?? '{}'));
      setAttachments(post.attachments ?? []);
    }
  }, [post]);

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useImperativeHandle(ref, () => ({
    focus: () => {
      editorRef.current?.commands.focus('end', { scrollIntoView: true });
    },
  }));

  return (
    <div className="space-y-2">
      <Editor
        ref={editorRef}
        minHeight={80}
        placeholder="Nhập nội dung bài viết..."
        onEmptyChange={setIsContentEmpty}
      />
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto miniScroll pb-0.5 -mb-0.5 rounded"
        hidden={attachments.length === 0}
        onMouseDown={handleMouseDown}
      >
        <div className="flex gap-1 min-w-max">
          {attachments.map((att) => (
            <div key={att.id} className="flex shrink-0 rounded overflow-hidden min-w-14 relative">
              <img
                draggable={false}
                height={128}
                src={att.fileUrl}
                alt=""
                className="h-32 w-full object-cover relative"
              />
              {loadingAttachments.includes(att.id ?? '') && (
                <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center">
                  <LoadingOutlined className="text-white text-2xl animate-spin" />
                </div>
              )}
              <Button
                icon={<DeleteOutlined />}
                variant="text"
                color="danger"
                className="absolute top-1 right-1 rounded-full !size-8"
                onClick={() => {
                  setAttachments((prev) => prev.filter((x) => x.id !== att.id));
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <Button icon={<CameraOutlined />} type="text" className="!size-8 rounded-full" onClick={handleSelectImage} />
        <div className="flex gap-2">
          {(!isContentEmpty || !!attachments.length || !!post) && (
            <Button
              icon={<CloseOutlined />}
              variant="outlined"
              color="default"
              className="!h-8 rounded-full"
              onClick={() => {
                if (post) {
                  onClose?.();
                } else {
                  editorRef.current?.commands.clearContent(true);
                  setAttachments([]);
                }
              }}
            >
              Huỷ
            </Button>
          )}
          <Button
            icon={post ? <SaveOutlined /> : <SendOutlined />}
            variant="solid"
            color="primary"
            className="!h-8 rounded-full"
            onClick={handleSendPost}
          >
            {post ? 'Lưu' : 'Đăng bài'}
          </Button>
        </div>
      </div>
    </div>
  );
});

export default PostEditor;
