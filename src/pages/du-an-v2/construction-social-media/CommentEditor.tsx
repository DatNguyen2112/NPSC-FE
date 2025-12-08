import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
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
import { API, keyToken } from '@utils';
import { SocialMediaCommentModel, SocialMediaFacade } from '@store';
import { Content, Editor as TiptapEditor } from '@tiptap/react';
import { customMessage } from 'src';

interface CommentEditorProps {
  onClose?: () => void;
  postId: string;
  parentCommentId?: string;
  comment?: SocialMediaCommentModel;
  route: string[];
}

export type CommentEditorRef = {
  focus: () => void;
  setContent: (content: Content) => void;
};

const CommentEditor = forwardRef<CommentEditorRef, CommentEditorProps>(
  ({ onClose, comment, postId, parentCommentId, route }, ref) => {
    const socialMediaFacade = SocialMediaFacade();
    const [attachment, setAttachment] = useState<T_Attachment | null>(null);
    const [attachmentLoading, setAttachmentLoading] = useState(false);
    const [isContentEmpty, setIsContentEmpty] = useState(true);
    const editorRef = useRef<TiptapEditor>(null);

    const handleSelectImage = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        input.onchange = null;
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        setAttachment(() => ({
          fileName: file.name,
          fileUrl: URL.createObjectURL(file),
          fileType: file.type,
          fileSize: file.size,
        }));
        setAttachmentLoading(true);

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
          setAttachment(res.data);
          setAttachmentLoading(false);
        }
      };
      input.click();
    };

    const handleSendComment = () => {
      if (!editorRef.current) return;
      if (!editorRef.current.getText()?.trim()) {
        customMessage.error({ content: 'Vui lòng nhập nội dung bình luận' });
        return;
      }

      const data: Partial<SocialMediaCommentModel> = {
        postId: comment?.postId ?? postId,
        parentCommentId: comment?.parentCommentId ?? parentCommentId,
        content: JSON.stringify(editorRef.current.getJSON()),
        attachments: attachment ? [attachment] : [],
      };

      if (comment) {
        socialMediaFacade.updateComment({ ...data, id: comment.id, route }).finally(() => {
          editorRef.current?.commands.clearContent(true);
          setAttachment(null);
          onClose?.();
        });
      } else {
        socialMediaFacade.createComment({ ...data, route }).finally(() => {
          editorRef.current?.commands.clearContent(true);
          setAttachment(null);
          onClose?.();
        });
      }
    };

    useEffect(() => {
      if (comment) {
        editorRef.current?.commands.setContent(JSON.parse(comment.content ?? '{}'));
        setAttachment(comment.attachments[0]);
      }
    }, [comment]);

    useImperativeHandle(ref, () => ({
      focus: () => {
        editorRef.current?.commands.focus('end', { scrollIntoView: true });
      },
      setContent: (content) => {
        editorRef.current?.commands.setContent(content);
      },
    }));

    return (
      <div className="space-y-2">
        <Editor ref={editorRef} placeholder="Nhập nội dung bình luận..." onEmptyChange={setIsContentEmpty} />
        {attachment && (
          <div className="w-fit relative rounded overflow-hidden">
            <img draggable={false} src={attachment.fileUrl} alt="" className="max-h-64 object-cover relative" />
            {attachmentLoading && (
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
                setAttachment(null);
              }}
            />
          </div>
        )}
        <div className="flex justify-between">
          <Button
            icon={<CameraOutlined />}
            type="text"
            className="!size-8 rounded-full"
            onClick={handleSelectImage}
            style={{ visibility: attachment ? 'hidden' : 'visible' }}
          />
          <div className="flex gap-2">
            {(!isContentEmpty || !!attachment || !!comment || !!parentCommentId) && (
              <Button
                icon={<CloseOutlined />}
                variant="outlined"
                color="default"
                className="!h-8 rounded-full"
                onClick={() => {
                  if (comment || parentCommentId) {
                    onClose?.();
                  } else {
                    editorRef.current?.commands.clearContent(true);
                    setAttachment(null);
                  }
                }}
              >
                Huỷ
              </Button>
            )}
            <Button
              icon={comment ? <SaveOutlined /> : <SendOutlined />}
              variant="solid"
              color="primary"
              className="!h-8 rounded-full"
              onClick={handleSendComment}
            >
              {comment ? 'Lưu' : 'Gửi'}
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

export default CommentEditor;
