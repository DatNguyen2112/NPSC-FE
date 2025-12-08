import { App, Avatar, Button, Card, Divider, Dropdown } from 'antd';
import { FC, useMemo, useRef, useState } from 'react';
import Editor from './Editor';
import {
  CaretUpOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  LikeFilled,
  LikeOutlined,
  MessageOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import ReactionPopup from './ReactionPopup';
import Comment from './Comment';
import PostEditor, { PostEditorRef } from './PostEditor';
import { GlobalFacade, reactions, SocialMediaFacade, SocialMediaPostModel } from '@store';
import { formatDayjsDate } from '@utils';
import CommentEditor, { CommentEditorRef } from './CommentEditor';
import dayjs from 'dayjs';
import LightGallery from 'lightgallery/react';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';

interface PostProps {
  post: SocialMediaPostModel;
}

const Post: FC<PostProps> = ({ post }) => {
  const { modal } = App.useApp();
  const globalFacade = GlobalFacade();
  const socialMediaFacade = SocialMediaFacade();
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const content = useMemo(() => JSON.parse(post.content ?? '{}'), [post.content]);
  const postEditorRef = useRef<PostEditorRef>(null);
  const commentEditorRef = useRef<CommentEditorRef>(null);
  const comments = useMemo(() => {
    if (!post.comments) return [];
    return [...post.comments].sort((a, b) => dayjs(b.createdOnDate).diff(dayjs(a.createdOnDate)));
  }, [post.comments]);

  const gridLayout: [number, number][] = useMemo(() => {
    switch (post.attachments.length) {
      case 1:
        return [[6, 5]];
      case 2:
        return [
          [3, 5],
          [3, 5],
        ];
      case 3:
        return [
          [6, 3],
          [3, 2],
          [3, 2],
        ];
      case 4:
        return [
          [3, 3],
          [3, 3],
          [3, 2],
          [3, 2],
        ];
      default:
        return [
          [3, 3],
          [3, 3],
          [2, 2],
          [2, 2],
          [2, 2],
        ];
    }
  }, [post.attachments.length]);

  const ownReaction = useMemo(() => {
    const reaction = post.reactions.find((x) => x.userId === globalFacade.user?.userModel?.id);
    return reaction ? reactions[reaction.reaction] : undefined;
  }, [post.reactions]);

  const topReactions = useMemo(() => {
    const counter = post.reactions.reduce(
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
  }, [post.reactions]);

  const handleReaction = (reaction: keyof typeof reactions | undefined, isAdd: boolean) => {
    socialMediaFacade.updateReaction({
      targetId: post.id,
      isPost: true,
      reaction,
      isAdd,
      route: [post.id],
    });
  };

  const handleDeletePost = () => {
    modal.confirm({
      title: 'Xoá bài viết',
      centered: true,
      content: 'Bạn có chắc chắn muốn xoá bài viết này không?',
      onOk: () => {
        socialMediaFacade.deletePost(post.id);
      },
    });
  };

  return (
    <Card styles={{ body: { padding: 0 } }} className="rounded-2xl py-3">
      <div className="px-4 flex items-center gap-2">
        <Avatar size={36} src={post.createdByUser.avatarUrl} />
        <div className="flex-1">
          <p className="font-bold">{post.createdByUser.name}</p>
          <p className="text-xs text-gray-500">{formatDayjsDate(post.createdOnDate, 'HH:mm DD/MM/YYYY')}</p>
        </div>
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
                    postEditorRef.current?.focus();
                  }, 0);
                },
                disabled: isEditing,
              },
              {
                label: 'Xoá',
                key: 'delete',
                icon: <DeleteOutlined />,
                onClick: handleDeletePost,
              },
            ],
          }}
        >
          <Button
            icon={<EllipsisOutlined />}
            type="text"
            className="rounded-full text-xl"
            hidden={
              globalFacade.user?.userModel?.id !== post.createdByUserId &&
              !globalFacade.user?.userModel?.roleListCode?.includes('ADMIN')
            }
          />
        </Dropdown>
      </div>
      {isEditing ? (
        <div className="mt-3 px-4">
          <div className="outline outline-1 outline-gray-300 rounded-md p-2">
            <PostEditor ref={postEditorRef} onClose={() => setIsEditing(false)} post={post} />
          </div>
        </div>
      ) : (
        <>
          <div className="mt-3 mb-2 px-4">
            <Editor content={content} editable={false} />
          </div>
          {!!post.attachments.length && (
            <div
              style={{
                aspectRatio: post.attachments.length > 1 && !isExpanded ? 5 / 4 : undefined,
                maxHeight: post.attachments.length === 1 && !isExpanded ? 480 : undefined,
              }}
            >
              <LightGallery
                selector=".img-item"
                speed={200}
                plugins={[lgThumbnail, lgZoom]}
                elementClassNames={`grid grid-cols-6 gap-0.5 max-h-full ${!isExpanded ? 'grid-rows-5' : ''}`}
              >
                {post.attachments.slice(0, post.attachments.length > 5 ? 4 : 5).map((attachment, index) => (
                  <a
                    href={attachment.fileUrl}
                    key={attachment.id}
                    style={{
                      gridColumn: isExpanded
                        ? 'span 2 / span 2'
                        : `span ${gridLayout[index][0]} / span ${gridLayout[index][0]}`,
                      gridRow: isExpanded
                        ? 'span 1 / span 1'
                        : `span ${gridLayout[index][1]} / span ${gridLayout[index][1]}`,
                      aspectRatio: isExpanded ? 1 : undefined,
                    }}
                    className="block relative img-item col-span-2"
                  >
                    <img
                      src={attachment.fileUrl}
                      style={{
                        objectFit: post.attachments.length === 1 ? 'contain' : 'cover',
                      }}
                      className="size-full relative"
                    />
                  </a>
                ))}
                {post.attachments.length > 5 && !isExpanded && (
                  <div
                    style={{
                      gridColumn: `span ${gridLayout[4][0]} / span ${gridLayout[4][0]}`,
                      gridRow: `span ${gridLayout[4][1]} / span ${gridLayout[4][1]}`,
                    }}
                    className="block relative"
                  >
                    <img
                      src={post.attachments[4].fileUrl}
                      style={{ objectFit: post.attachments.length === 1 ? 'contain' : 'cover' }}
                      className="size-full relative"
                    />
                    <div
                      className="absolute top-0 left-0 w-full h-full cursor-pointer select-none bg-black/70 hover:bg-black/80 transition-all flex justify-center items-center text-white font-bold text-5xl hover:text-6xl"
                      onClick={() => {
                        setIsExpanded(true);
                      }}
                    >
                      +{post.attachments.length - 4}
                    </div>
                  </div>
                )}
                {post.attachments.slice(post.attachments.length > 5 ? 4 : 5).map((attachment, index) => (
                  <a
                    href={attachment.fileUrl}
                    key={attachment.id}
                    style={{
                      gridColumn: isExpanded
                        ? 'span 2 / span 2'
                        : `span ${gridLayout[index][0]} / span ${gridLayout[index][0]}`,
                      gridRow: isExpanded
                        ? 'span 1 / span 1'
                        : `span ${gridLayout[index][1]} / span ${gridLayout[index][1]}`,
                      aspectRatio: isExpanded ? 1 : undefined,
                      display: isExpanded ? 'block' : 'none',
                    }}
                    className="block relative img-item col-span-2"
                  >
                    <img
                      src={attachment.fileUrl}
                      style={{
                        objectFit: post.attachments.length === 1 ? 'contain' : 'cover',
                      }}
                      className="size-full relative"
                    />
                  </a>
                ))}
              </LightGallery>
              {isExpanded && (
                <Button icon={<CaretUpOutlined />} className="my-2 block mx-auto" onClick={(x) => setIsExpanded(false)}>
                  Thu gọn
                </Button>
              )}
            </div>
          )}
        </>
      )}
      <div className="px-4 py-2 flex justify-between items-center">
        <div className="flex gap-1">
          <div className="flex pr-1">
            {topReactions.map((reaction, index) => (
              <img
                key={reaction.value}
                src={reaction.staticImage}
                alt={reaction.value}
                style={{
                  zIndex: topReactions.length - index - 1,
                  marginRight: topReactions.length === 1 ? 0 : -4,
                }}
                className="size-5 rounded-full outline outline-2 bg-white outline-white relative"
              />
            ))}
          </div>
          <span className="text-gray-500">{post.reactions.length || ''}</span>
        </div>
        <span className="text-gray-500">{post.comments.length} bình luận</span>
      </div>
      <div className="px-4">
        <Divider style={{ margin: '0' }} />
        <div className="grid grid-cols-3 py-1">
          <ReactionPopup onSelect={(reaction) => handleReaction(reaction, true)}>
            <Button
              icon={
                !ownReaction ? (
                  <LikeOutlined className="text-xl" />
                ) : ownReaction.value === reactions.Like.value ? (
                  <LikeFilled className="text-xl text-blue-500" />
                ) : (
                  <img src={ownReaction.staticImage} className="size-5" alt="" />
                )
              }
              onClick={() => handleReaction(reactions.Like.value, ownReaction == null)}
              type="text"
            >
              <span className={ownReaction?.color}>{ownReaction?.label ?? reactions.Like.label}</span>
            </Button>
          </ReactionPopup>
          <Button
            icon={<MessageOutlined className="text-xl text-gray-500" />}
            type="text"
            onClick={() => {
              setTimeout(() => {
                commentEditorRef.current?.focus();
              }, 0);
            }}
          >
            Bình luận
          </Button>
          <Button icon={<ShareAltOutlined className="text-xl text-gray-500" />} type="text">
            Chia sẻ
          </Button>
        </div>
      </div>
      <div className="px-4">
        <Divider style={{ margin: '0' }} />
        <div className="mt-3 space-y-3">
          <div className="flex justify-start gap-2 group">
            <Avatar size={36} src={globalFacade.user?.userModel?.avatarUrl} className="shrink-0" />
            <div className="rounded-xl bg-gray-100 py-2 px-3 flex-1 border border-gray-200">
              <CommentEditor ref={commentEditorRef} postId={post.id} route={[post.id]} />
            </div>
          </div>
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} route={[post.id]} depth={1} />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default Post;
