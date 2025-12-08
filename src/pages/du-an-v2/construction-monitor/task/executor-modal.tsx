import { SaveOutlined } from '@ant-design/icons';
import { ProductModel, TaskFacade, UserModal } from '@store';
import { Avatar, Button, Checkbox, Empty, Flex, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { FaCaretDown, FaCaretRight } from 'react-icons/fa';

function TaskExecutorModal({
  title,
  data,
  listUser,
  autoSubmit,
}: {
  title: string;
  data: any;
  listUser: any;
  autoSubmit?: boolean;
}) {
  const taskExecutor = TaskFacade();
  const [expandedDepartments, setExpandedDepartments] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    taskExecutor.set({ checkedListPresent: data?.map((item: any) => item?.employeeId), listPresent: data });
    return () => {
      taskExecutor.set({
        isChooseUserManyParticipantsModal: false,
        isChooseUserManyPresentModal: false,
        checkedListParticipants: [],
        checkedListPresent: [],
        isCheckAll: false,
        arrChooseParticipants: [],
        arrChoosePresent: [],
        listParticipants: [],
        listParticipantsArr: [],
        listPresent: [],
        listItems: [],
      });
    };
  }, []);

  useEffect(() => {
    const newArr: any = [];

    taskExecutor.set({
      isCheckAll:
        taskExecutor.checkedListPresent?.length === listUser?.map((item: any) => item.id)?.length ||
        taskExecutor.checkedListPresent?.length > 0,
    });

    // set lại vào table
    if (taskExecutor.checkedListPresent?.length > 0) {
      taskExecutor.checkedListPresent?.forEach((item: any) => {
        const obj = listUser?.find((items: ProductModel) => items.id === item);

        if (obj) {
          newArr.push(obj);
        }
      });

      taskExecutor.set({ arrChoosePresent: newArr });
    }
  }, [taskExecutor.checkedListPresent]);

  useEffect(() => {
    if (taskExecutor.checkedListPresent?.length > 0) {
      const cloneArr = [...(taskExecutor?.listPresent ?? [])];

      taskExecutor.checkedListPresent?.forEach((item: any, index: number) => {
        if (!cloneArr?.some((items: any) => items.employeeId === item)) {
          cloneArr.push({
            employeeId: item,
            employeeAvatarUrl: listUser?.find((items: UserModal) => items?.id === item)?.avatarUrl,
            userType: 'follower',
            employeeName: listUser?.find((items: UserModal) => items?.id === item)?.name,
          });
        }
      });

      taskExecutor.set({
        listPresent: cloneArr,
      });
    }
  }, [taskExecutor.checkedListPresent]);

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

  const handleChooseFulfilled = () => {
    taskExecutor.set({ isChooseUserManyPresentModal: false, listExecutor: taskExecutor?.listPresent, autoSubmit });
  };

  // Xử lý khi chọn/deselect từng dòng
  const handleCheck = (id: string | any) => {
    if (taskExecutor.checkedListPresent?.includes(id)) {
      taskExecutor.set({
        checkedListPresent: taskExecutor.checkedListPresent?.filter((item: any) => item !== id),
        listPresent: taskExecutor.listPresent?.filter((item: any) => item?.employeeId !== id),
      }); // Bỏ chọn
    } else {
      taskExecutor.set({ checkedListPresent: [...(taskExecutor.checkedListPresent || []), id] }); // Chọn thêm
    }
  };

  // Xử lý "Chọn tất cả"
  const handleCheckAll = () => {
    if (taskExecutor.isCheckAll) {
      taskExecutor.set({ checkedListPresent: [], listPresent: [] }); // Bỏ chọn tất cả
    } else {
      taskExecutor.set({
        checkedListPresent: listUser?.map((item: any) => item.id),
      }); // Chọn tất cả
    }
    taskExecutor.set({ isCheckAll: !taskExecutor.isCheckAll });
  };

  return (
    <Modal
      width={500}
      height={700}
      open={taskExecutor.isChooseUserManyPresentModal}
      title={title}
      onCancel={() => taskExecutor.set({ isChooseUserManyPresentModal: false })}
      footer={
        <div className={'flex justify-end'}>
          <Button icon={<SaveOutlined />} type={'primary'} onClick={handleChooseFulfilled}>
            Lưu lại
          </Button>
        </div>
      }
    >
      <div className="mt-4 mr-4">
        <Checkbox
          indeterminate={
            taskExecutor.checkedListPresent?.length > 0 && listUser?.length !== taskExecutor.checkedListPresent?.length
          }
          checked={taskExecutor.isCheckAll}
          onChange={handleCheckAll}
        >
          {taskExecutor.checkedListPresent?.length > 0 ? (
            <>
              Đã chọn <span className="font-medium">{taskExecutor.checkedListPresent?.length}</span> nhân sự
            </>
          ) : (
            'Chọn tất cả nhân sự'
          )}
        </Checkbox>
      </div>

      <div className="mt-2 h-[360px] overflow-y-auto miniScroll">
        {Object.keys(groupByDepartmentAndTeam(listUser)).length > 0 ? (
          Object.entries(groupByDepartmentAndTeam(listUser)).map(([key, value]: any) => {
            const isDeptExpanded = expandedDepartments[key] ?? true;
            return (
              <div key={key}>
                <div className={'mt-4'}>
                  <Flex gap="small" align="center">
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
                  </Flex>
                  {isDeptExpanded &&
                    value?.departmentMembers?.map((item: any, index: number) => (
                      <div key={index} className={'mt-4'}>
                        <div key={item?.id} className="flex gap-2 mr-4 mt-2 items-center">
                          <Checkbox
                            checked={taskExecutor.checkedListPresent?.includes(item?.id)}
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
                {isDeptExpanded &&
                  Object.entries(value?.teams).map(([keys, values]: any) => {
                    return (
                      <div className={'mt-4'} key={keys}>
                        <Flex gap={'small'}>
                          <Checkbox
                            checked={values.every((item: any) => taskExecutor.checkedListPresent?.includes(item?.id))}
                            indeterminate={
                              values.some((item: any) => taskExecutor.checkedListPresent?.includes(item?.id)) &&
                              !values.every((item: any) => taskExecutor.checkedListPresent?.includes(item?.id))
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                // Select all users in this team
                                const newChecked = [
                                  ...(taskExecutor.checkedListPresent || []),
                                  ...values
                                    .map((item: any) => item.id)
                                    .filter((id: any) => !taskExecutor.checkedListPresent?.includes(id)),
                                ];
                                taskExecutor.set({ checkedListPresent: newChecked });
                              } else {
                                // Deselect all users in this team
                                const newChecked = (taskExecutor.checkedListPresent || []).filter(
                                  (id: any) => !values.some((item: any) => item.id === id),
                                );
                                taskExecutor.set({
                                  checkedListPresent: newChecked,
                                  listPresent: taskExecutor.listPresent?.filter(
                                    (item: any) => !values.some((v: any) => v.id === item?.employeeId),
                                  ),
                                });
                              }
                            }}
                          />
                          <p className={'font-medium text-[14px]'}>{keys}</p>
                        </Flex>
                        {values?.map((item: any, index: number) => (
                          <div key={index} className={'mt-4'}>
                            <div key={item?.id} className="flex gap-2 mr-4 mt-2 items-center ml-6">
                              <Checkbox
                                checked={taskExecutor.checkedListPresent?.includes(item?.id)}
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
              </div>
            );
          })
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="h-4"
            description="Chưa có người theo dõi trong dự án"
          />
        )}
      </div>
    </Modal>
  );
}

export default TaskExecutorModal;
