import { SaveOutlined } from '@ant-design/icons';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import { ConstructionFacade, ProductModel, UserFacade, UserModal } from '@store';
import { Avatar, Button, Checkbox, FormInstance, Modal } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { FaCaretDown, FaCaretRight } from 'react-icons/fa';

function UserParticipantsManyModal({ title, data }: { title: string; data: any }) {
  const constructionFacade = ConstructionFacade();
  const userFacade = UserFacade();
  const formRef = useRef<FormInstance | undefined>(undefined);
  const [expandedTeams, setExpandedTeams] = useState<{ [key: string]: boolean }>({});
  const [expandedDepartments, setExpandedDepartments] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    userFacade.get({ size: -1 });
    constructionFacade.set({
      checkedListParticipants: data?.map((item: any) => item?.employeeId),
      listParticipants: data,
    });
  }, []);

  const groupByDepartmentAndTeam = (users: any) => {
    const result: any = {};

    users.forEach((user: any) => {
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

  const handleCancel = () => {
    constructionFacade.set({ isChooseUserManyParticipantsModal: false });
  };

  useEffect(() => {
    const newArr: any = [];

    constructionFacade.set({
      isCheckAll:
        constructionFacade.checkedListParticipants?.length ===
          userFacade.pagination?.content?.map((item) => item.id)?.length ||
        constructionFacade.checkedListParticipants?.length > 0,
    });

    // set lại vào table
    if (constructionFacade.checkedListParticipants?.length > 0) {
      constructionFacade.checkedListParticipants?.forEach((item: any) => {
        const obj = userFacade.pagination?.content?.find((items: ProductModel) => items.id === item);

        if (obj) {
          newArr.push(obj);
        }
      });

      constructionFacade.set({ arrChooseParticipants: newArr });
    }
  }, [constructionFacade.checkedListParticipants]);

  useEffect(() => {
    if (constructionFacade.checkedListParticipants?.length > 0) {
      const cloneArr = [...(constructionFacade?.listParticipants ?? [])];

      constructionFacade.checkedListParticipants?.forEach((item: any) => {
        if (!cloneArr?.some((items: any) => items.employeeId === item)) {
          cloneArr.push({
            employeeId: item,
            employeeAvatarUrl: userFacade?.pagination?.content?.find((items: UserModal) => items?.id === item)
              ?.avatarUrl,
            userType: 'participants',
          });
        }
      });

      constructionFacade.set({
        listParticipants: cloneArr,
      });
    }
  }, [constructionFacade.checkedListParticipants]);

  const handleChooseFulfilled = () => {
    constructionFacade.set({
      isChooseUserManyParticipantsModal: false,
      listParticipantsArr: constructionFacade?.listParticipants,
    });
  };

  // Xử lý khi chọn/deselect từng dòng
  const handleCheck = (id: string | any) => {
    if (constructionFacade.checkedListParticipants?.includes(id)) {
      constructionFacade.set({
        checkedListParticipants: constructionFacade.checkedListParticipants?.filter((item: any) => item !== id),
        listParticipants: constructionFacade.listParticipants?.filter((item: any) => item?.employeeId !== id),
      }); // Bỏ chọn
    } else {
      constructionFacade.set({ checkedListParticipants: [...constructionFacade.checkedListParticipants, id] }); // Chọn thêm
    }
  };

  // Xử lý "Chọn tất cả"
  const handleCheckAll = () => {
    const allUsers = userFacade.pagination?.content ?? [];
    const allUserIds = allUsers.map((item) => item.id);
    const currentlyChecked = constructionFacade.checkedListParticipants ?? [];

    const isAllChecked = currentlyChecked.length === allUserIds.length;

    if (isAllChecked) {
      // Bỏ chọn tất cả
      constructionFacade.set({
        checkedListParticipants: [],
        listParticipants: [],
      });
    } else {
      // Chọn tất cả
      constructionFacade.set({
        checkedListParticipants: allUserIds,
      });
    }
  };

  // Thêm hàm xử lý chọn tổ/phòng
  const handleCheckTeam = (teamKey: string, userIds: string[]) => {
    const checked = userIds.every((id) => constructionFacade.checkedListParticipants?.includes(id));
    if (checked) {
      // Bỏ chọn tất cả trong tổ
      constructionFacade.set({
        checkedListParticipants: constructionFacade.checkedListParticipants?.filter((id: any) => !userIds.includes(id)),
        listParticipants: constructionFacade.listParticipants?.filter(
          (item: any) => !userIds.includes(item?.employeeId),
        ),
      });
    } else {
      // Chọn tất cả trong tổ
      const newChecked = Array.from(new Set([...(constructionFacade.checkedListParticipants ?? []), ...userIds]));
      constructionFacade.set({ checkedListParticipants: newChecked });
    }
  };

  return (
    <Modal
      width={500}
      open={constructionFacade.isChooseUserManyParticipantsModal}
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
              constructionFacade.checkedListParticipants?.length > 0 &&
              constructionFacade.checkedListParticipants?.length < (userFacade.pagination?.content?.length ?? 0)
            }
            checked={
              constructionFacade.checkedListParticipants?.length === (userFacade.pagination?.content?.length ?? 0)
            }
            onChange={handleCheckAll}
          >
            {constructionFacade.checkedListParticipants?.length > 0 ? (
              <p>
                Đã chọn {<span className="font-[500]">{constructionFacade.checkedListParticipants?.length}</span>} nhân
                sự
              </p>
            ) : (
              <p>Chọn tất cả nhân sự</p>
            )}
          </Checkbox>
        </div>

        <div className="mt-2 h-[360px] overflow-y-auto miniScroll">
          {/*Tag filter*/}
          {Object.keys(groupByDepartmentAndTeam(userFacade.pagination?.content)).length > 0 ? (
            Object.entries(groupByDepartmentAndTeam(userFacade.pagination?.content)).map(([key, value]: any) => {
              const isDeptExpanded = expandedDepartments[key] ?? true;
              return (
                <>
                  <div className={'mt-4'}>
                    {/* Phòng/Đội cấp cha */}
                    <div className="flex items-center gap-2">
                      <span
                        style={{ cursor: 'pointer' }}
                        onClick={() => setExpandedDepartments((prev) => ({ ...prev, [key]: !isDeptExpanded }))}
                      >
                        {isDeptExpanded ? (
                          <FaCaretDown className="text-[14px]" />
                        ) : (
                          <FaCaretRight className="text-[14px]" />
                        )}
                      </span>

                      <p className={'font-[500] text-[14px]'}>{key}</p>
                    </div>
                    {/* Nhân sự không thuộc tổ, cách lề 0px */}
                    {isDeptExpanded && (
                      <div>
                        {value?.departmentMembers?.map((item: any, index: number) => (
                          <div key={index} className={'mt-4'}>
                            <div key={item?.id} className="flex gap-2 mr-4 mt-2 items-center" style={{ marginLeft: 0 }}>
                              <Checkbox
                                checked={constructionFacade.checkedListParticipants?.includes(item?.id)}
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
                        {/* Các tổ thuộc phòng/đội */}
                        {Object.entries(value?.teams).map(([teamKey, teamMembers]: any) => {
                          const isExpanded = expandedTeams[teamKey] ?? true;
                          return (
                            <div className={'mt-4'} key={teamKey}>
                              <div className="flex items-center gap-2">
                                {/* <span
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => setExpandedTeams((prev) => ({ ...prev, [teamKey]: !isExpanded }))}
                                >
                                  {isExpanded ? <FaCaretDown className="text-[14px]" /> : <FaCaretRight className="text-[14px]" />}
                                </span> */}
                                <Checkbox
                                  checked={
                                    teamMembers.every((item: any) =>
                                      constructionFacade.checkedListParticipants?.includes(item.id),
                                    ) && teamMembers.length > 0
                                  }
                                  indeterminate={
                                    teamMembers.some((item: any) =>
                                      constructionFacade.checkedListParticipants?.includes(item.id),
                                    ) &&
                                    !teamMembers.every((item: any) =>
                                      constructionFacade.checkedListParticipants?.includes(item.id),
                                    )
                                  }
                                  onChange={() =>
                                    handleCheckTeam(
                                      teamKey,
                                      teamMembers.map((item: any) => item.id),
                                    )
                                  }
                                  style={{ marginRight: 8 }}
                                />
                                <p className={'font-[500] text-[14px]'}>{teamKey}</p>
                              </div>
                              {isExpanded && (
                                <div>
                                  {teamMembers?.map((item: any, index: number) => (
                                    <div key={index} className={'mt-4'}>
                                      <div
                                        key={item?.id}
                                        className="flex gap-2 mr-4 mt-2 items-center"
                                        style={{ marginLeft: 24 }}
                                      >
                                        <Checkbox
                                          checked={constructionFacade.checkedListParticipants?.includes(item?.id)}
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
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
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

export default UserParticipantsManyModal;
