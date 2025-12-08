import { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Table,
  Tag,
  TimePicker,
  Card,
  List,
  Popconfirm,
  message,
  Collapse,
} from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import vi from 'dayjs/locale/vi';
import type { Dayjs } from 'dayjs';
import type { DateClickArg } from '@fullcalendar/interaction';
import '../WorkCalender/work-calender.css';
import {
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  HolderOutlined,
  InfoCircleTwoTone,
  LeftOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  SaveOutlined,
  UpOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import WorkSelectionModal from './work-selection-modal';

// Cấu hình dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale(vi);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

interface CalendarEvent {
  id?: string;
  title: string;
  start: Date | string;
  end: Date | string;
  color: string;
  description: string;
}

interface TaskItem {
  id: string;
  name: string;
  type: string;
  startTime: Dayjs;
  endTime: Dayjs;
  color?: string;
}

interface WorkPlan {
  id: string;
  title: string;
  createdDate: Date;
  tasks: TaskItem[];
  events: CalendarEvent[];
  isActive: boolean;
  executionDate: Dayjs; // Thêm trường ngày thực hiện
}

interface DateSelectInfo {
  start: Date;
  end: Date;
  startStr: string;
  endStr: string;
}

// Hàm chuyển đổi dayjs sang Date với timezone Việt Nam (KHÔNG thay đổi timezone)
const toVietnamDate = (date: Dayjs): Date => {
  return date.toDate(); // Giữ nguyên thời gian đã chọn
};

// Hàm chuyển đổi string sang Date với timezone Việt Nam
const toVietnamTime = (date: Date | dayjs.Dayjs | string): Date => {
  return dayjs(date).tz('Asia/Ho_Chi_Minh', true).toDate();
};

// Hàm lấy ngày hiện tại ở múi giờ Việt Nam
const getCurrentVietnamDate = (): Date => {
  return dayjs().tz('Asia/Ho_Chi_Minh').toDate();
};

// Hàm kết hợp ngày được chọn với thời gian được chọn
const combineDateWithTime = (date: Dayjs, time: Dayjs): Dayjs => {
  return date.hour(time.hour()).minute(time.minute()).second(time.second()).millisecond(time.millisecond());
};

const { RangePicker } = DatePicker;
const { Panel } = Collapse;

function WorkCalender() {
  const [form] = Form.useForm();
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Meeting với team',
      start: dayjs().hour(10).minute(0).second(0).toDate(),
      end: dayjs().hour(11).minute(30).second(0).toDate(),
      color: '#4285F4',
      description: 'Thảo luận về dự án mới',
    },
    {
      id: '2',
      title: 'Lunch với đối tác',
      start: dayjs().hour(13).minute(0).second(0).toDate(),
      end: dayjs().hour(14).minute(0).second(0).toDate(),
      color: '#34A853',
      description: 'Nhà hàng ABC',
    },
  ]);

  const [workPlans, setWorkPlans] = useState<WorkPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<WorkPlan | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(getCurrentVietnamDate());
  const [startTime, setStartTime] = useState<Dayjs>(dayjs().hour(9).minute(0));
  const [endTime, setEndTime] = useState<Dayjs>(dayjs().hour(10).minute(0));
  const [showModalChooseTask, setShowModalChooseTask] = useState<boolean>(false);
  const [taskHasChoose, setTaskHasChoose] = useState<TaskItem[]>([]);
  const [planTitle, setPlanTitle] = useState<string>('');
  const [executionDate, setExecutionDate] = useState<Dayjs>(dayjs()); // Ngày thực hiện

  const calendarRef = useRef<any>(null);

  // Effect để cập nhật giá trị khi selectedEvent thay đổi
  useEffect(() => {
    if (selectedEvent) {
      // Sử dụng dayjs trực tiếp từ Date object
      const start = typeof selectedEvent.start === 'string' ? dayjs(selectedEvent.start) : dayjs(selectedEvent.start);
      const end = typeof selectedEvent.end === 'string' ? dayjs(selectedEvent.end) : dayjs(selectedEvent.end);

      setStartTime(start);
      setEndTime(end);
    }
  }, [selectedEvent]);

  // Effect để cập nhật lịch khi thời gian thay đổi trong modal
  useEffect(() => {
    if (showEventModal && selectedEvent) {
      const eventStartDate =
        typeof selectedEvent.start === 'string' ? new Date(selectedEvent.start) : selectedEvent.start;

      setSelectedDate(eventStartDate);

      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.gotoDate(eventStartDate);
      }
    }
  }, [selectedEvent, showEventModal]);

  // Xử lý khi chọn công việc từ modal
  const handleTaskSelection = (selectedTasks: any[]) => {
    console.log('Selected tasks:', selectedTasks);

    // Chuyển đổi dữ liệu từ modal sang định dạng TaskItem
    const tasks: TaskItem[] = selectedTasks.map((task, index) => {
      const startTime =
        task.startTime ||
        dayjs()
          .hour(9 + index)
          .minute(0);
      const endTime =
        task.endTime ||
        dayjs()
          .hour(10 + index)
          .minute(0);

      return {
        id: task.id || `task-${Date.now()}-${index}`,
        name: task.name || task.title || `Công việc ${index + 1}`,
        type: task.type || task.category || 'Khác',
        startTime: startTime,
        endTime: endTime,
        color: task.color || getRandomColor(),
      };
    });

    setTaskHasChoose(tasks);
    setShowModalChooseTask(false);

    // Cập nhật form với các task đã chọn
    form.setFieldsValue({
      listTask: tasks.map((task) => ({
        name: task.name,
        type: task.type,
        startTime: task.startTime,
        endTime: task.endTime,
      })),
    });
  };

  // Hàm tạo màu ngẫu nhiên cho sự kiện
  const getRandomColor = (): string => {
    const colors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#8E44AD', '#2ECC71', '#E74C3C', '#3498DB'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Hàm chuyển đổi task thành calendar event
  const convertTaskToEvent = (task: TaskItem, executionDate: Dayjs): CalendarEvent => {
    const startDateTime = combineDateWithTime(executionDate, task.startTime);
    const endDateTime = combineDateWithTime(executionDate, task.endTime);

    return {
      id: task.id,
      title: task.name,
      start: startDateTime.toDate(),
      end: endDateTime.toDate(),
      color: task.color || getRandomColor(),
      description: `Loại: ${task.type}`,
    };
  };

  // Xử lý khi submit form để thêm các task vào lịch
  const handleSubmitTasks = () => {
    if (taskHasChoose.length === 0) {
      message.warning('Vui lòng chọn ít nhất một công việc');
      return;
    }

    if (!planTitle.trim()) {
      message.warning('Vui lòng nhập tiêu đề kế hoạch');
      return;
    }

    if (!executionDate) {
      message.warning('Vui lòng chọn ngày thực hiện');
      return;
    }

    // Chuyển đổi các task thành events
    const newEvents: CalendarEvent[] = taskHasChoose.map((task) => convertTaskToEvent(task, executionDate));

    // Tạo work plan mới
    const newWorkPlan: WorkPlan = {
      id: `plan-${Date.now()}`,
      title: planTitle,
      createdDate: new Date(),
      tasks: taskHasChoose,
      events: newEvents,
      isActive: true,
      executionDate: executionDate,
    };

    // Thêm work plan vào danh sách
    setWorkPlans((prevPlans) => [newWorkPlan, ...prevPlans]);

    // Thêm các events mới vào danh sách events hiện tại
    setEvents((prevEvents) => [...prevEvents, ...newEvents]);

    // Đóng modal và reset form
    setShowEventModal(false);
    setTaskHasChoose([]);
    setSelectedEvent(null);
    setIsCreatingNew(false);
    setPlanTitle('');
    setExecutionDate(dayjs()); // Reset về ngày hiện tại
    form.resetFields();

    // Hiển thị thông báo thành công
    message.success(`Đã thêm ${newEvents.length} công việc vào lịch cho ngày ${executionDate.format('DD/MM/YYYY')}!`);
  };

  // Xử lý khi click vào kế hoạch đã lưu
  const handlePlanClick = (plan: WorkPlan) => {
    setSelectedPlan(plan);

    // Cập nhật events trên calendar
    setEvents(plan.events);

    // Hiển thị thông báo
    message.info(`Đã hiển thị kế hoạch: ${plan.title} cho ngày ${dayjs(plan.executionDate).format('DD/MM/YYYY')}`);
  };

  // Xử lý cập nhật kế hoạch
  const handleUpdatePlan = (plan: WorkPlan) => {
    setSelectedPlan(plan);
    setPlanTitle(plan.title);
    setTaskHasChoose(plan.tasks);
    setExecutionDate(plan.executionDate);
    setShowEventModal(true);

    // Cập nhật form với dữ liệu hiện tại
    form.setFieldsValue({
      listTask: plan.tasks.map((task) => ({
        name: task.name,
        type: task.type,
        startTime: task.startTime,
        endTime: task.endTime,
      })),
    });
  };

  // Xử lý xóa kế hoạch
  const handleDeletePlan = (planId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    setWorkPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== planId));

    // Nếu đang xem kế hoạch bị xóa, thì clear selection và reset events
    if (selectedPlan?.id === planId) {
      setSelectedPlan(null);
    }

    message.success('Đã xóa kế hoạch thành công');
  };

  // Xử lý khi click vào ngày (thêm sự kiện mới)
  const handleDateClick = (info: DateClickArg) => {
    console.log('Date clicked:', info.dateStr);

    const clickedDate = new Date(info.dateStr);
    setSelectedDate(clickedDate);

    // Tạo sự kiện mới với thời gian mặc định
    const startTime = dayjs(info.dateStr).hour(9).minute(0).second(0);
    const endTime = startTime.add(1, 'hour');

    const newEvent: CalendarEvent = {
      title: '',
      start: startTime.toDate(),
      end: endTime.toDate(),
      color: '#4285F4',
      description: '',
    };

    setSelectedEvent(newEvent);
    setIsCreatingNew(true);
    setShowEventModal(true);
  };

  // Effect để highlight ngày được chọn
  useEffect(() => {
    if (!calendarRef.current) return;

    const allDayCells = document.querySelectorAll('.fc-daygrid-day');

    allDayCells.forEach((cell) => {
      cell.classList.remove('fc-day-selected');
    });

    const selectedDateStr = dayjs(selectedDate).format('YYYY-MM-DD');
    const selectedCell = document.querySelector(`[data-date="${selectedDateStr}"]`);

    if (selectedCell) {
      selectedCell.classList.add('fc-day-selected');
    }
  }, [selectedDate]);

  useEffect(() => {
    if (taskHasChoose?.length) {
      form.setFieldsValue({
        listTask: taskHasChoose.map((task) => ({
          name: task.name,
          type: task.type,
          startTime: task.startTime,
          endTime: task.endTime,
        })),
      });
    }
  }, [taskHasChoose]);

  // Xử lý khi chọn khoảng thời gian (kéo chuột)
  const handleSelect = (selectInfo: DateSelectInfo) => {
    console.log('Date selected:', selectInfo.start, selectInfo.end);

    setSelectedDate(selectInfo.start);

    const newEvent: CalendarEvent = {
      title: '',
      start: selectInfo.start,
      end: selectInfo.end,
      color: '#4285F4',
      description: '',
    };

    setSelectedEvent(newEvent);
    setIsCreatingNew(true);
    setShowEventModal(true);
  };

  // Xử lý khi click vào sự kiện đã có
  const handleEventClick = (info: any) => {
    const event = info.event;

    const clickedEvent: CalendarEvent = {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      color: event.backgroundColor || '#4285F4',
      description: event.extendedProps?.description || '',
    };

    setSelectedDate(event.start);
    setSelectedEvent(clickedEvent);
    setIsCreatingNew(false);
    setShowEventModal(true);
  };

  // Hàm xử lý khi thay đổi thời gian bắt đầu
  const handleStartTimeChange = (time: Dayjs | null, index?: number) => {
    if (time) {
      if (index !== undefined && taskHasChoose.length > 0) {
        // Cập nhật thời gian cho task cụ thể
        const updatedTasks = [...taskHasChoose];
        updatedTasks[index] = {
          ...updatedTasks[index],
          startTime: time,
        };
        setTaskHasChoose(updatedTasks);
      } else {
        // Cập nhật thời gian chung
        setStartTime(time);
      }
    }
  };

  // Hàm xử lý khi thay đổi thời gian kết thúc
  const handleEndTimeChange = (time: Dayjs | null, index?: number) => {
    if (time) {
      if (index !== undefined && taskHasChoose.length > 0) {
        // Cập nhật thời gian cho task cụ thể
        const updatedTasks = [...taskHasChoose];
        updatedTasks[index] = {
          ...updatedTasks[index],
          endTime: time,
        };
        setTaskHasChoose(updatedTasks);
      } else {
        // Cập nhật thời gian chung
        setEndTime(time);
      }
    }
  };

  // Xử lý khi thay đổi ngày thực hiện
  const handleExecutionDateChange = (date: Dayjs | null) => {
    if (date) {
      setExecutionDate(date);
    }
  };

  // Xóa task khỏi danh sách đã chọn
  const handleRemoveTask = (index: number) => {
    const updatedTasks = [...taskHasChoose];
    updatedTasks.splice(index, 1);
    setTaskHasChoose(updatedTasks);
  };

  // Tạo sự kiện mới cho ngày được chọn
  const handleAddEventForSelectedDate = () => {
    const startTimeObj = dayjs().hour(9).minute(0);
    const endTimeObj = dayjs().hour(10).minute(0);

    const newEvent: CalendarEvent = {
      title: '',
      start: combineDateWithTime(dayjs(), startTimeObj).toDate(),
      end: combineDateWithTime(dayjs(), endTimeObj).toDate(),
      color: '#4285F4',
      description: '',
    };

    setSelectedEvent(newEvent);
    setIsCreatingNew(true);
    setShowEventModal(true);
    setExecutionDate(dayjs()); // Set ngày thực hiện mặc định là hôm nay
  };

  // Tạo mini calendar
  const generateMiniCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const monthLength = lastDay.getDate();

    const weeks: (number | null)[][] = [];
    let day = 1;

    for (let i = 0; i < 6; i++) {
      const week: (number | null)[] = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < startingDayOfWeek) || day > monthLength) {
          week.push(null);
        } else {
          week.push(day);
          day++;
        }
      }
      weeks.push(week);
      if (day > monthLength) break;
    }

    return weeks;
  };

  // Xử lý click ngày trong mini calendar
  const handleMiniCalendarDateClick = (day: number | null) => {
    if (day === null) return;

    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    setSelectedDate(newDate);

    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(newDate);
    }
  };

  // Chuyển tháng trong mini calendar
  const handleMiniCalendarMonthChange = (direction: 'prev' | 'next') => {
    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth();
    const currentDay = selectedDate.getDate();

    let newMonth = currentMonth;
    let newYear = currentYear;

    if (direction === 'prev') {
      newMonth = currentMonth - 1;
      if (newMonth < 0) {
        newMonth = 11;
        newYear = currentYear - 1;
      }
    } else {
      newMonth = currentMonth + 1;
      if (newMonth > 11) {
        newMonth = 0;
        newYear = currentYear + 1;
      }
    }

    const daysInNewMonth = new Date(newYear, newMonth + 1, 0).getDate();
    const safeDay = Math.min(currentDay, daysInNewMonth);
    const newDate = new Date(newYear, newMonth, safeDay);

    setSelectedDate(newDate);

    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(newDate);
    }
  };

  // Kiểm tra xem ngày có phải hôm nay không
  const isToday = (day: number | null) => {
    if (day === null) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  // Kiểm tra xem ngày có được chọn không
  const isSelectedDay = (day: number | null) => {
    if (day === null) return false;
    return day === selectedDate.getDate();
  };

  // Lọc sự kiện theo ngày được chọn
  const getEventsForSelectedDate = () => {
    const selectedDateStr = dayjs(selectedDate).format('YYYY-MM-DD');

    return events
      .filter((event) => {
        const eventStart = event.start;
        const eventDateStr = dayjs(eventStart).format('YYYY-MM-DD');
        return eventDateStr === selectedDateStr;
      })
      .sort((a, b) => {
        return new Date(a.start).getTime() - new Date(b.start).getTime();
      });
  };

  // Render header toolbar
  const renderHeaderToolbar = () => {
    return {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek',
    };
  };

  // Đóng modal
  const handleCloseModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
    setIsCreatingNew(false);
    setTaskHasChoose([]);
    setPlanTitle('');
    setSelectedPlan(null);
    setExecutionDate(dayjs()); // Reset về ngày hiện tại
    form.resetFields();
  };

  console.log('Events:', events);
  console.log('Tasks has choose:', taskHasChoose);
  console.log('Work plans:', workPlans);

  return (
    <div className="app">
      {/* Main Content */}
      <div className="main-content">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <button className="add-btn" onClick={handleAddEventForSelectedDate}>
              + Thêm mới
            </button>
          </div>

          {/* Mini Calendar */}
          <div className="mini-calendar">
            <div className="mini-calendar-header">
              <button className="nav-btn" onClick={() => handleMiniCalendarMonthChange('prev')}>
                ‹
              </button>
              <h2>
                Tháng {selectedDate.getMonth() + 1} {selectedDate.getFullYear()}
              </h2>
              <button className="nav-btn" onClick={() => handleMiniCalendarMonthChange('next')}>
                ›
              </button>
            </div>
            <div className="mini-calendar-grid">
              <div className="mini-calendar-weekdays">
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                  <div key={day} className="mini-calendar-weekday">
                    {day}
                  </div>
                ))}
              </div>
              <div className="mini-calendar-days">
                {generateMiniCalendar().map((week, weekIndex) => (
                  <div key={weekIndex} className="mini-calendar-week">
                    {week.map((day, dayIndex) => (
                      <button
                        key={dayIndex}
                        className={`mini-calendar-day ${day === null ? 'empty' : ''} ${isToday(day) ? 'today' : ''} ${
                          isSelectedDay(day) ? 'selected' : ''
                        }`}
                        onClick={() => handleMiniCalendarDateClick(day)}
                        disabled={day === null}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="selected-date-info">
            <div className="date-display">
              <span className="day-number">{selectedDate.getDate()}</span>
              <div className="date-details">
                <span className="day-name">{dayjs(selectedDate).format('dddd')}</span>
                <span className="month-year">{dayjs(selectedDate).format('MMMM YYYY')}</span>
              </div>
            </div>
          </div>

          <div className="events-list">
            <h3>Công việc trong ngày</h3>

            {/* Kế hoạch đã lưu */}
            {workPlans.length > 0 && (
              <div className="saved-plans-section">
                <Collapse size="small" className="saved-plans-collapse" defaultActiveKey={['1']}>
                  <Panel
                    header={
                      <span className="font-semibold">
                        <CalendarOutlined className="mr-2" />
                        Kế hoạch đã lưu ({workPlans.length})
                      </span>
                    }
                    key="1"
                  >
                    <div className="saved-plans-list">
                      {workPlans.map((plan) => (
                        <div
                          key={plan.id}
                          className={`saved-plan-item ${selectedPlan?.id === plan.id ? 'selected' : ''}`}
                          onClick={() => handlePlanClick(plan)}
                        >
                          <div className="plan-header">
                            <div className="plan-title">
                              {plan.title}
                              {selectedPlan?.id === plan.id && (
                                <Tag color="blue" className="ml-1">
                                  Đang hiển thị
                                </Tag>
                              )}
                            </div>
                            <div className="plan-actions">
                              <Button
                                type="text"
                                icon={<EditOutlined />}
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdatePlan(plan);
                                }}
                                title="Cập nhật"
                              />
                              <Popconfirm
                                title="Xóa kế hoạch"
                                description="Bạn có chắc chắn muốn xóa kế hoạch này?"
                                onConfirm={(e) => handleDeletePlan(plan.id, e as any)}
                                okText="Xóa"
                                cancelText="Hủy"
                              >
                                <Button
                                  type="text"
                                  icon={<DeleteOutlined />}
                                  size="small"
                                  danger
                                  onClick={(e) => e.stopPropagation()}
                                  title="Xóa"
                                />
                              </Popconfirm>
                            </div>
                          </div>
                          <div className="plan-info">
                            <div className="text-xs text-gray-500">
                              Ngày: {dayjs(plan.executionDate).format('DD/MM/YYYY')}
                            </div>
                            <div className="text-xs">{plan.tasks.length} công việc</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </Collapse>
              </div>
            )}

            {/* Các sự kiện trong ngày */}
            {/* <div className="daily-events-section">
              {getEventsForSelectedDate().length > 0 ? (
                getEventsForSelectedDate().map((event) => (
                  <div
                    key={event.id}
                    className="event-item"
                    style={{ borderLeftColor: event.color }}
                    onClick={() => {
                      const eventApi: any = {
                        id: event.id || '',
                        title: event.title,
                        start: event.start,
                        end: event.end,
                        backgroundColor: event.color,
                        extendedProps: { description: event.description },
                      };
                      handleEventClick({ event: eventApi });
                    }}
                  >
                    <div className="event-dot" style={{ backgroundColor: event.color }}></div>
                    <div className="event-content">
                      <div className="event-title">{event.title}</div>
                      <div className="event-time">
                        {dayjs(event.start).format('HH:mm')} - {dayjs(event.end).format('HH:mm')}
                      </div>
                      {event.description && <div className="event-description">{event.description}</div>}
                    </div>
                    <button className="star-btn">⭐</button>
                  </div>
                ))
              ) : (
                <div className="no-events">
                  <p>Không có công việc nào trong ngày này</p>
                  <button className="add-event-btn" onClick={handleAddEventForSelectedDate}>
                    + Thêm công việc
                  </button>
                </div>
              )}
            </div> */}
          </div>
        </div>
        {/* Calendar */}
        <div className="calendar-container">
          <FullCalendar
            dragScroll={true}
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={renderHeaderToolbar()}
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            selectable={true}
            select={handleSelect}
            editable={true}
            eventResizableFromStart={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            nowIndicator={true}
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            slotDuration="01:00:00"
            slotLabelInterval="01:00:00"
            height="100%"
            contentHeight="auto"
            locale="vi"
            timeZone="local"
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5],
              startTime: '08:00',
              endTime: '18:00',
            }}
            scrollTime="08:00:00"
            selectLongPressDelay={0}
            dayCellDidMount={(info) => {
              const dateStr = dayjs(info.date).format('YYYY-MM-DD');
              const selectedDateStr = dayjs(selectedDate).format('YYYY-MM-DD');
              if (dateStr === selectedDateStr) {
                info.el.classList.add('fc-day-selected');
              }
            }}
          />
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <Modal
          width={800}
          title={selectedPlan ? 'Cập nhật kế hoạch' : 'Thêm mới kế hoạch - Chọn công việc'}
          open={showEventModal}
          onCancel={handleCloseModal}
          footer={[
            <Button key="cancel" onClick={handleCloseModal}>
              Hủy
            </Button>,
            <Button key="submit" type="primary" onClick={handleSubmitTasks}>
              {selectedPlan ? 'Cập nhật kế hoạch' : 'Lưu kế hoạch'}
            </Button>,
          ]}
        >
          <Form form={form} layout="vertical">
            <Row gutter={12}>
              <Col xs={16}>
                <Form.Item
                  label="Tiêu đề kế hoạch"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập tiêu đề kế hoạch',
                    },
                  ]}
                >
                  <Input
                    placeholder="Nhập tiêu đề kế hoạch"
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col xs={8}>
                <Form.Item
                  label="Ngày thực hiện"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng chọn ngày thực hiện',
                    },
                  ]}
                >
                  <DatePicker
                    value={executionDate}
                    onChange={handleExecutionDateChange}
                    format="DD/MM/YYYY"
                    style={{ width: '100%' }}
                    placeholder="Chọn ngày thực hiện"
                  />
                </Form.Item>
              </Col>
            </Row>

            <div className="flex justify-end mb-3">
              <Button
                color="primary"
                variant="outlined"
                icon={<PlusOutlined />}
                onClick={() => setShowModalChooseTask(true)}
              >
                Chọn công việc
              </Button>
            </div>

            {showModalChooseTask && (
              <WorkSelectionModal
                setTaskHasChoose={handleTaskSelection}
                open={showModalChooseTask}
                setOpen={setShowModalChooseTask}
              />
            )}

            {taskHasChoose.length > 0 && (
              <div className="selected-tasks-section">
                <h4>Danh sách công việc đã chọn ({taskHasChoose.length})</h4>
                <Table dataSource={taskHasChoose} pagination={false} rowKey="id" size="small">
                  <Table.Column title="STT" key="index" width={60} render={(_, __, index) => index + 1} />
                  <Table.Column title="Công việc" dataIndex="name" key="name" width={200} />
                  <Table.Column title="Phân loại" dataIndex="type" key="type" width={120} />
                  <Table.Column
                    title="Thời gian bắt đầu"
                    key="startTime"
                    width={150}
                    render={(_, record: TaskItem, index) => (
                      <TimePicker
                        value={record.startTime}
                        onChange={(time) => handleStartTimeChange(time, index)}
                        format="HH:mm"
                        style={{ width: '100%' }}
                        minuteStep={15}
                        showNow={false}
                        needConfirm={false}
                        placeholder="Chọn giờ bắt đầu"
                      />
                    )}
                  />
                  <Table.Column
                    title="Thời gian kết thúc"
                    key="endTime"
                    width={150}
                    render={(_, record: TaskItem, index) => (
                      <TimePicker
                        value={record.endTime}
                        onChange={(time) => handleEndTimeChange(time, index)}
                        format="HH:mm"
                        style={{ width: '100%' }}
                        minuteStep={15}
                        showNow={false}
                        needConfirm={false}
                        placeholder="Chọn giờ kết thúc"
                      />
                    )}
                  />
                  <Table.Column
                    title="Thao tác"
                    key="action"
                    width={80}
                    render={(_, __, index) => (
                      <Button type="link" danger icon={<CloseOutlined />} onClick={() => handleRemoveTask(index)} />
                    )}
                  />
                </Table>

                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <div className="text-sm text-blue-700">
                    <strong>Lưu ý:</strong> Tất cả công việc sẽ được lên lịch cho ngày{' '}
                    <strong>{executionDate.format('DD/MM/YYYY')}</strong>
                  </div>
                </div>
              </div>
            )}
          </Form>
        </Modal>
      )}
    </div>
  );
}

export default WorkCalender;
