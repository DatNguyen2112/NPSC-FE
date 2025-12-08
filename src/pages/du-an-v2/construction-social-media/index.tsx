import { FC, useEffect, useState, useRef } from 'react';
import Post from './Post';
import PostEditor from './PostEditor';
import { Card, Spin } from 'antd';
import { SocialMediaFacade, UserFacade } from '@store';
import { isLoadAllData } from '@utils';

const PAGE_SIZE = 10;

const ConstructionSocialMediaPage: FC = () => {
  const socialMediaFacade = SocialMediaFacade();
  const userFacade = UserFacade();
  const hasMoreRef = useRef(false);
  const loadedPostCountRef = useRef(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoadAllData(userFacade.data)) {
      userFacade.get({ size: -1 });
    }
    socialMediaFacade.getPosts({ size: PAGE_SIZE, skip: 0 });

    const loadMoreEl = loadMoreRef.current;

    if (loadMoreEl) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current) {
          socialMediaFacade.getPosts({ size: PAGE_SIZE, skip: loadedPostCountRef.current });
        }
      });

      observer.observe(loadMoreEl);

      return () => {
        observer.unobserve(loadMoreEl);
      };
    }
  }, []);

  useEffect(() => {
    hasMoreRef.current = socialMediaFacade.hasMore ?? false;
    loadedPostCountRef.current = socialMediaFacade.posts?.length ?? 0;
  }, [socialMediaFacade.hasMore, socialMediaFacade.posts?.length]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-2 relative">
      <Card styles={{ body: { padding: 0 } }} className="rounded-2xl px-4 py-3">
        <p className="text-lg font-bold mb-2 text-gray-400">Tạo bài viết mới</p>
        <PostEditor />
      </Card>
      {socialMediaFacade.posts?.map((post) => <Post key={post.id} post={post} />)}
      {socialMediaFacade.hasMore ? (
        <div className="flex justify-center py-4">
          <Spin size="large" />
        </div>
      ) : (
        <div>
          <p className="text-center text-gray-400 text-xl py-2 font-bold">Không còn bài viết nào</p>
        </div>
      )}
      <div ref={loadMoreRef} className="absolute left-0 bottom-0 w-full h-[600px] pointer-events-none max-h-full"></div>
    </div>
  );
};

export default ConstructionSocialMediaPage;
