import { App, Avatar, Button, Dropdown } from 'antd';
import { FC, useMemo, useRef, useState } from 'react';
import { DeleteOutlined, EditOutlined, EllipsisOutlined } from '@ant-design/icons';
import ReactionPopup from './ReactionPopup';
import Editor from './Editor';
import { GlobalFacade, reactions, SocialMediaCommentModel, SocialMediaFacade } from '@store';
import { formatDayjsDate } from '@utils';
import CommentEditor, { CommentEditorRef } from './CommentEditor';
import dayjs from 'dayjs';
import { maxCommentDepth } from './constants';

interface CommentProps {
  comment: SocialMediaCommentModel;
  route: string[];
  depth: number;
}

const Comment: FC<CommentProps> = ({ comment, route, depth }) => {
  const { modal } = App.useApp();
  const globalFacade = GlobalFacade();
  const socialMediaFacade = SocialMediaFacade();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const commentEditorRef = useRef<CommentEditorRef>(null);
  const replyCommentEditorRef = useRef<CommentEditorRef>(null);
  const content = useMemo(() => JSON.parse(comment.content ?? '{}'), [comment.content]);
  const currentRoute = [...route, comment.id];
  const comments = useMemo(() => {
    if (!comment.childComments) return [];
    return [...comment.childComments].sort((a, b) => dayjs(a.createdOnDate).diff(dayjs(b.createdOnDate)));
  }, [comment.childComments]);

  const ownReaction = useMemo(() => {
    const reaction = comment.reactions.find((x) => x.userId === globalFacade.user?.userModel?.id);
    return reaction ? reactions[reaction.reaction] : undefined;
  }, [comment.reactions]);

  const topReactions = useMemo(() => {
    const counter = comment.reactions.reduce(
      (acc, { reaction }) => {
        acc[reaction] = (acc[reaction] ?? 0) + 1;
        return acc;
      },
      {} as Record<keyof typeof reactions, number>,
    );
    return Object.entries(counter)
      .map(([key, count]) => ({ reaction: key as keyof typeof reactions, count }))
      .sort((a, b) => b.count - a.count)
      .map((x) => reactions[x.reaction])
      .slice(0, 3);
  }, [comment.reactions]);

  const handleReaction = (reaction: keyof typeof reactions | undefined, isAdd: boolean) => {
    socialMediaFacade.updateReaction({
      targetId: comment.id,
      isPost: false,
      reaction,
      isAdd,
      route: currentRoute,
    });
  };

  const handleDeleteComment = () => {
    modal.confirm({
      title: 'Xoá bình luận',
      centered: true,
      content: 'Bạn có chắc chắn muốn xoá bình luận này không?',
      onOk: () => {
        socialMediaFacade.deleteComment(comment.id, currentRoute);
      },
    });
  };

  const handleReply = (replyTo: SocialMediaCommentModel) => {
    setIsReplying(true);
    setTimeout(() => {
      replyCommentEditorRef.current?.setContent({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'mention',
                attrs: {
                  id: replyTo.createdByUser.id,
                  label: replyTo.createdByUser.name,
                },
              },
              {
                type: 'text',
                text: ' ',
              },
            ],
          },
        ],
      });
      replyCommentEditorRef.current?.focus();
    }, 0);
  };

  return (
    <div className="relative">
      {comment.childComments.length > 0 && <div className="absolute left-4 top-11 bottom-0 w-[3px] bg-gray-200"></div>}
      <div className="flex justify-start gap-2 group">
        <Avatar size={36} src={comment.createdByUser.avatarUrl} className="shrink-0" />
        <div style={{ flex: isEditing ? 1 : undefined }}>
          <div className="rounded-xl bg-gray-200 py-2 px-3">
            {isEditing ? (
              <>
                <div className="flex gap-2 items-baseline font-bold">{comment.createdByUser.name}</div>
                <CommentEditor
                  ref={commentEditorRef}
                  postId={comment.postId}
                  comment={comment}
                  onClose={() => setIsEditing(false)}
                  route={currentRoute}
                />
              </>
            ) : (
              <>
                <div className="flex gap-2 items-baseline">
                  <span className="font-bold">{comment.createdByUser.name}</span>
                  <span className="text-xs text-gray-500">
                    {formatDayjsDate(comment.createdOnDate, 'HH:mm DD/MM/YYYY')}
                  </span>
                </div>
                <Editor content={content} editable={false} />
                {comment.attachments.length > 0 && (
                  <div className="w-fit relative rounded overflow-hidden mt-1">
                    <img
                      draggable={false}
                      src={comment.attachments[0].fileUrl}
                      alt=""
                      className="max-h-64 object-cover relative"
                    />
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex mt-1 ml-3 gap-3">
            <ReactionPopup onSelect={(reaction) => handleReaction(reaction, true)}>
              <div
                className={`font-medium hover:underline text-xs cursor-pointer ${ownReaction?.color}`}
                onClick={() => handleReaction(reactions.Like.value, ownReaction == null)}
              >
                {ownReaction ? ownReaction.label : reactions.Like.label}
              </div>
            </ReactionPopup>
            <div className="font-medium hover:underline text-xs cursor-pointer" onClick={() => handleReply(comment)}>
              Phản hồi
            </div>
            <div className="flex">
              <span className="text-xs text-gray-500 mr-1">{comment.reactions.length || ''}</span>
              {topReactions.map((reaction, index) => (
                <img
                  key={reaction.value}
                  src={reaction.staticImage}
                  alt={reaction.value}
                  style={{
                    zIndex: topReactions.length - index - 1,
                    marginRight: topReactions.length === 1 ? 0 : -4,
                  }}
                  className="size-4 rounded-full outline outline-2 bg-white outline-white relative"
                />
              ))}
            </div>
          </div>
        </div>
        {!isEditing && (
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mb-4 pb-1">
            <Dropdown
              overlayStyle={{ width: '100px' }}
              menu={{
                items: [
                  {
                    label: 'Sửa',
                    key: 'edit',
                    icon: <EditOutlined />,
                    onClick: () => {
                      setIsEditing(true);
                      setTimeout(() => {
                        commentEditorRef.current?.focus();
                      }, 0);
                    },
                  },
                  {
                    label: 'Xoá',
                    key: 'delete',
                    icon: <DeleteOutlined />,
                    onClick: handleDeleteComment,
                  },
                ],
              }}
            >
              <Button
                icon={<EllipsisOutlined />}
                type="text"
                className="rounded-full text-xl"
                hidden={
                  globalFacade.user?.userModel?.id !== comment.createdByUserId &&
                  !globalFacade.user?.userModel?.roleListCode?.includes('ADMIN')
                }
              />
            </Dropdown>
          </div>
        )}
      </div>
      {isReplying && depth >= maxCommentDepth && (
        <div className="flex justify-start gap-2 mt-2">
          <Avatar size={36} src={globalFacade.user?.userModel?.avatarUrl} className="shrink-0" />
          <div className="rounded-xl bg-gray-100 py-2 px-3 flex-1 border border-gray-200">
            <CommentEditor
              ref={replyCommentEditorRef}
              postId={comment.postId}
              parentCommentId={comment.parentCommentId}
              route={currentRoute.slice(0, -1)}
              onClose={() => setIsReplying(false)}
            />
          </div>
        </div>
      )}
      <div className="pl-11 mt-2 space-y-2">
        {comments.map((comment, index) => (
          <div key={comment.id} className="relative">
            <div className={`absolute w-5 top-0 -left-7 bottom-0 ${index === comments.length - 1 ? 'bg-white' : ''}`}>
              <div className="w-full h-5 border-b-[3px] border-l-[3px] border-gray-200 rounded-bl-xl"></div>
            </div>
            <Comment key={comment.id} comment={comment} route={currentRoute} depth={depth + 1} />
          </div>
        ))}
        {isReplying && depth < maxCommentDepth && (
          <div className="flex justify-start gap-2">
            <Avatar size={36} src={globalFacade.user?.userModel?.avatarUrl} className="shrink-0" />
            <div className="rounded-xl bg-gray-100 py-2 px-3 flex-1 border border-gray-200">
              <CommentEditor
                ref={replyCommentEditorRef}
                postId={comment.postId}
                parentCommentId={comment.id}
                route={currentRoute}
                onClose={() => setIsReplying(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;
