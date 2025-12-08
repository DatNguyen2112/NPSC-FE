import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, Spin, Tree } from 'antd';
import { Button } from '@core/button';
import { DataTable } from '@core/data-table';
import { mapTreeObject, renderTitleBreadcrumbs } from '@utils';
import { PostFacade, PostTypeFacade } from '@store';
import { Arrow, Edit, Plus, Trash } from '@svgs';
import { EStatusState, TableRefObject } from '@models';
import classNames from 'classnames';
import { ToolTip } from '@core/tooltip';
import { PopConfirm } from '@core/pop-confirm';
import _column from '@column/post';
import _columnType from '@column/post/type';
import { DrawerForm } from '@core/drawer';

const Page = () => {
  const postTypeFacade = PostTypeFacade();
  useEffect(() => {
    if (!postTypeFacade.tree) postTypeFacade.get({});
    return () => {
      postFacade.set({ isLoading: true, status: EStatusState.idle });
    };
  }, []);

  const postFacade = PostFacade();
  useEffect(() => {
    renderTitleBreadcrumbs(t('pages.Post'), [
      { title: t('titles.Setting'), link: '' },
      { title: t('titles.Post'), link: '' },
    ]);
    switch (postFacade.status) {
      case EStatusState.putFulfilled:
      case EStatusState.putDisableFulfilled:
      case EStatusState.postFulfilled:
      case EStatusState.deleteFulfilled:
        dataTableRef?.current?.onChange(request);
        break;
    }
  }, [postFacade.status]);
  useEffect(() => {
    switch (postTypeFacade.status) {
      case EStatusState.deleteFulfilled:
        postTypeFacade.get({});
        break;
    }
  }, [postTypeFacade.status]);

  const request = JSON.parse(postFacade.queryParams || '{}');
  if (!request.filter || typeof request?.filter === 'string') request.filter = JSON.parse(request?.filter || '{}');
  const { t } = useTranslation();
  const dataTableRef = useRef<TableRefObject>(null);

  return (
    <div className={'grid grid-cols-12 gap-3 px-2.5 pt-2.5'}>
      <DrawerForm
        facade={postTypeFacade}
        title={t(postTypeFacade.data ? 'pages.Post/Edit' : 'pages.Post/Add', { type: '' })}
        onSubmit={(values) => {
          if (postTypeFacade.data) postTypeFacade.put({ ...values, id: postTypeFacade.data.id });
          else postTypeFacade.post({ ...values });
        }}
        columns={_columnType.form()}
      ></DrawerForm>
      <DrawerForm
        size={'large'}
        facade={postFacade}
        title={t(postFacade.data ? 'pages.Post/Edit' : 'pages.Post/Add', { type: request.filter.type })}
        onSubmit={(values) => {
          if (postFacade.data)
            postFacade.put({ ...values, id: postFacade.data.id, categoryId: request.filter.categoryId });
          else postFacade.post({ ...values, categoryId: request.filter.categoryId });
        }}
        columns={_column.form()}
      ></DrawerForm>
      <div className="col-span-12 md:col-span-4 lg:col-span-3 -intro-x">
        <div className="shadow rounded-xl w-full bg-white overflow-hidden">
          <div className="h-14 flex justify-between items-center border-b border-gray-100 px-4 py-2">
            <h3 className={'font-bold text-lg'}>Post Type</h3>
            <div className="flex items-center">
              <Button
                icon={<Plus className="icon-cud !h-5 !w-5" />}
                text={t('routes.admin.Code.New Type')}
                onClick={() => postTypeFacade.set({ data: undefined, isVisible: true })}
              />
            </div>
          </div>
          <Spin spinning={postTypeFacade.isLoading}>
            <div className="h-[calc(100vh-12rem)] overflow-y-auto relative scroll hidden sm:block">
              <Tree
                blockNode
                showLine
                autoExpandParent
                defaultExpandAll
                switcherIcon={<Arrow className={'w-4 h-4'} />}
                treeData={mapTreeObject(postTypeFacade.pagination?.content)}
                titleRender={(data: any) => (
                  <div
                    className={classNames(
                      { 'bg-gray-100': request.filter.categoryId === data.value },
                      'item text-gray-700 font-medium hover:bg-gray-100 flex justify-between items-center border-b border-gray-100 w-full text-left  group',
                    )}
                  >
                    <div
                      onClick={() => {
                        request.filter.categoryId = data.value;
                        dataTableRef?.current?.onChange(request);
                      }}
                      className="truncate cursor-pointer flex-1 hover:text-teal-900 item-text px-3 py-1"
                    >
                      {data.title}
                    </div>
                    <div className="w-16 flex justify-end gap-1">
                      <ToolTip title={t('routes.admin.Layout.Edit')}>
                        <button
                          className={'opacity-0 group-hover:opacity-100 transition-all duration-300 '}
                          title={t('routes.admin.Layout.Edit') || ''}
                          onClick={() => postTypeFacade.getById({ id: data.value })}
                        >
                          <Edit className="icon-cud bg-teal-900 hover:bg-teal-700" />
                        </button>
                      </ToolTip>
                      <ToolTip title={t('routes.admin.Layout.Delete')}>
                        <PopConfirm
                          title={t('components.datatable.areYouSureWant')}
                          onConfirm={() => postTypeFacade.delete(data.value!)}
                        >
                          <button
                            className={'opacity-0 group-hover:opacity-100 transition-all duration-300'}
                            title={t('routes.admin.Layout.Delete') || ''}
                          >
                            <Trash className="icon-cud bg-red-600 hover:bg-red-400" />
                          </button>
                        </PopConfirm>
                      </ToolTip>
                    </div>
                  </div>
                )}
              />
            </div>
            <div className="p-2 sm:p-0 block sm:hidden">
              <Select
                value={request.filter.type}
                className={'w-full'}
                options={postFacade.pagination?.content.map((data: any) => ({
                  label: data.title,
                  value: data.id,
                }))}
                onChange={(e) => {
                  request.filter.categoryId = e;
                  dataTableRef?.current?.onChange(request);
                }}
              />
            </div>
          </Spin>
        </div>
      </div>
      <div className="col-span-12 md:col-span-8 lg:col-span-9 intro-x">
        <div className="shadow rounded-xl w-full overflow-auto bg-white">
          <div className="sm:min-h-[calc(100vh-8.5rem)] overflow-y-auto p-3">
            <DataTable
              facade={postFacade}
              ref={dataTableRef}
              paginationDescription={(from: number, to: number, total: number) =>
                t('routes.admin.Layout.Pagination', { from, to, total })
              }
              columns={_column.table()}
              rightHeader={
                <div className={'flex gap-2'}>
                  <Button
                    icon={<Plus className="icon-cud !h-5 !w-5" />}
                    text={t('components.button.New')}
                    onClick={() => postFacade.set({ data: undefined, isVisible: true })}
                  />
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Page;
