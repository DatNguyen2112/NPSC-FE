import { SaveOutlined } from '@ant-design/icons';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import { ConstructionFacade, ProductModel, UserFacade, UserModal } from '@store';
import { Avatar, Button, Checkbox, FormInstance, Modal } from 'antd';
import { useEffect, useRef } from 'react';

function UserFollowerManyModal({ title, data }: { title: string; data: any }) {
  const constructionFacade = ConstructionFacade();
  const userFacade = UserFacade();
  const formRef = useRef<FormInstance | undefined>(undefined);

  useEffect(() => {
    userFacade.get({ size: -1 });
    constructionFacade.set({ checkedListPresent: data?.map((item: any) => item?.employeeId), listPresent: data });
  }, []);

  const groupByDepartmentAndTeam = (users: any) => {
    const result: any = {};

    users?.forEach((user: any) => {
      const departmentTitle = user.phongBan?.title || 'OTHERS';
      const teamTitle = user.toThucHien?.title || null;
      const position = user.chucVu?.tenChucVu || 'Other position';

      if (!result[departmentTitle]) {
        result[departmentTitle] = {
          departmentMembers: [],
          teams: {},
        };
      }

      if (!teamTitle) {
        // No team → directly under the department
        result[departmentTitle].departmentMembers.push({
          ...user,
          position,
        });
      } else {
        // Belongs to a team
        if (!result[departmentTitle].teams[teamTitle]) {
          result[departmentTitle].teams[teamTitle] = [];
        }
        result[departmentTitle].teams[teamTitle].push({
          ...user,
          position,
        });
      }
    });

    return result;
  };

  // console.log(groupByDepartmentAndTeam(userFacade.pagination?.content));

  const handleCancel = () => {
    constructionFacade.set({ isChooseUserManyPresentModal: false });
  };

  useEffect(() => {
    const newArr: any = [];

    constructionFacade.set({
      isCheckAll:
        constructionFacade.checkedListPresent?.length ===
          userFacade.pagination?.content?.map((item) => item.id)?.length ||
        constructionFacade.checkedListPresent?.length > 0,
    });

    // set lại vào table
    if (constructionFacade.checkedListPresent?.length > 0) {
      constructionFacade.checkedListPresent?.forEach((item: any) => {
        const obj = userFacade.pagination?.content?.find((items: ProductModel) => items.id === item);

        if (obj) {
          newArr.push(obj);
        }
      });

      constructionFacade.set({ arrChoosePresent: newArr });
    }
  }, [constructionFacade.checkedListPresent]);

  useEffect(() => {
    if (constructionFacade.checkedListPresent?.length > 0) {
      const cloneArr = [...(constructionFacade?.listPresent ?? [])];

      constructionFacade.checkedListPresent?.forEach((item: any, index: number) => {
        if (!cloneArr?.some((items: any) => items.employeeId === item)) {
          cloneArr.push({
            employeeId: item,
            employeeAvatarUrl: userFacade?.pagination?.content?.find((items: UserModal) => items?.id === item)
              ?.avatarUrl,
            userType: 'follower',
          });
        }
      });

      constructionFacade.set({
        listPresent: cloneArr,
      });
    }
  }, [constructionFacade.checkedListPresent]);

  const handleChooseFulfilled = () => {
    constructionFacade.set({ isChooseUserManyPresentModal: false, listPresentArr: constructionFacade?.listPresent });
  };

  // Xử lý khi chọn/deselect từng dòng
  const handleCheck = (id: string | any) => {
    if (constructionFacade.checkedListPresent?.includes(id)) {
      constructionFacade.set({
        checkedListPresent: constructionFacade.checkedListPresent?.filter((item: any) => item !== id),
        listPresent: constructionFacade.listPresent?.filter((item: any) => item?.employeeId !== id),
      }); // Bỏ chọn
    } else {
      constructionFacade.set({ checkedListPresent: [...constructionFacade.checkedListPresent, id] }); // Chọn thêm
    }
  };

  // Xử lý "Chọn tất cả"
  const handleCheckAll = () => {
    const allUsers = userFacade.pagination?.content ?? [];
    const allUserIds = allUsers.map((item) => item.id);
    const currentlyChecked = constructionFacade.checkedListPresent ?? [];

    const isAllChecked = currentlyChecked.length === allUserIds.length;

    if (isAllChecked) {
      // Bỏ chọn tất cả
      constructionFacade.set({
        checkedListPresent: [],
        listPresent: [],
      });
    } else {
      // Chọn tất cả
      constructionFacade.set({
        checkedListPresent: allUserIds,
      });
    }
  };

  return (
    <Modal
      width={500}
      height={700}
      open={constructionFacade.isChooseUserManyPresentModal}
      title={title}
      onCancel={handleCancel}
      footer={
        <div className={'flex justify-end'}>
          <Button icon={<SaveOutlined />} type={'primary'} onClick={handleChooseFulfilled}>
            Lưu lại
          </Button>
        </div>
      }
    >
      <div>
        <SearchWidget
          className="mt-4"
          placeholder="Tìm theo tên nhân sự"
          form={(form) => (formRef.current = form)}
          callback={(value) => {
            userFacade.get({
              size: -1,
              filter: JSON.stringify({
                FullTextSearch: value,
              }),
            });
          }}
        />

        <div className="mt-4 mr-4">
          <Checkbox
            indeterminate={
              constructionFacade.checkedListPresent?.length > 0 &&
              constructionFacade.checkedListPresent?.length < (userFacade.pagination?.content?.length ?? 0)
            }
            checked={constructionFacade.checkedListPresent?.length === (userFacade.pagination?.content?.length ?? 0)}
            onChange={handleCheckAll}
          >
            {constructionFacade.checkedListPresent?.length > 0 ? (
              <p>
                Đã chọn {<span className="font-bold">{constructionFacade.checkedListPresent?.length}</span>} nhân sự
              </p>
            ) : (
              <p>Chọn tất cả nhân sự</p>
            )}
          </Checkbox>
        </div>

        <div className="mt-2 h-[360px] overflow-y-auto miniScroll">
          {Object.keys(groupByDepartmentAndTeam(userFacade.pagination?.content)).length > 0 ? (
            Object.entries(groupByDepartmentAndTeam(userFacade.pagination?.content)).map(([key, value]: any) => {
              return (
                <>
                  <div className={'mt-4'}>
                    <p className={'font-[500] text-[14px]'}>{key}</p>
                    {value?.departmentMembers?.map((item: any, index: number) => (
                      <div key={index} className={'mt-4'}>
                        <div key={item?.id} className="flex gap-2 mr-4 mt-2 items-center">
                          <Checkbox
                            checked={constructionFacade.checkedListPresent?.includes(item?.id)}
                            onChange={() => handleCheck(item?.id)}
                          />

                          <Avatar src={item?.avatarUrl ?? '/assets/images/no-image.jpg'} />

                          <div className="flex-1">
                            <p className="text-[14px] font-[400]">{item?.name}</p>
                            <p className="text-[12px] italic text-gray-500">{item?.chucVu?.tenChucVu}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {Object.entries(value?.teams).map(([keys, values]: any) => {
                    return (
                      <div className={'mt-4'} key={keys}>
                        <p className={'font-[400] text-[14px]'}>{keys}</p>
                        {values?.map((item: any, index: number) => (
                          <div key={index} className={'mt-4'}>
                            <div key={item?.id} className="flex gap-2 mr-4 mt-2 items-center">
                              <Checkbox
                                checked={constructionFacade.checkedListPresent?.includes(item?.id)}
                                onChange={() => handleCheck(item?.id)}
                              />

                              <Avatar src={item?.avatarUrl ?? '/assets/images/no-image.jpg'} />

                              <div className="flex-1">
                                <p className="text-[14px] font-[400]">{item?.name}</p>
                                <p className="text-[12px] italic text-gray-500">{item?.chucVu?.tenChucVu}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </>
              );
            })
          ) : (
            <div>Chưa có dữ liệu</div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default UserFollowerManyModal;
