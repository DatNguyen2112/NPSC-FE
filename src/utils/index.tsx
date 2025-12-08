import { CheckboxOptionType, TreeDataNode } from 'antd';
import { keyToken, language, languages, linkApi } from './variable';
// @ts-ignore
import { Message } from '@core/message';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { State } from '@store';
import { Pagination } from '@models';

export * from '../router-links';
export * from './api';
export * from './convertFormValue';
export * from './init/reportWebVitals';
export * from './variable';

export const socket = io(import.meta.env.VITE_URL_SOCKET, { autoConnect: false });
export const cleanObjectKeyNull = (obj: { [selector: string]: any }) => {
  for (const propName in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, propName)) {
      if (
        obj[propName] === null ||
        obj[propName] === undefined ||
        (typeof obj[propName] === 'object' && Object.keys(obj[propName]).length === 0)
      ) {
        delete obj[propName];
      } else if (typeof obj[propName] === 'object') {
        const keys = Object.keys(obj[propName]);
        let check = true;
        keys.forEach((key: string) => {
          if (check && obj[propName][key] !== undefined) {
            check = false;
          }
        });
        if (check) {
          delete obj[propName];
        }
      }
    }
  }
  return obj;
};

export const getSizePageByHeight = (height = 39, minusNumber = 3) =>
  Math.floor(
    (document.body.getBoundingClientRect().height -
      document.getElementsByTagName('tbody')[0].getBoundingClientRect().top) /
      height,
  ) - minusNumber;
export const getFilter = (queryParams = '{}', key = 'id') =>
  JSON.parse(JSON.parse(queryParams || '{}').filter || '{}')[key] || null;

export const loopMapSelect = (array?: any[], label = 'name', value = 'id'): CheckboxOptionType[] =>
  array?.length
    ? array.map((item) => ({
        label: item[label],
        value: item[value],
        isLeaf: !item.children.length,
        children: item.children ? loopMapSelect(item.children, label, value) : undefined,
      }))
    : [];

export const lang = languages?.indexOf(location.hash.split('/')[1]) > -1 ? location.hash.split('/')[1] : language;

export const arrayUnique = (array: any, key?: string) => {
  const a = array.concat();
  for (let i = 0; i < a.length; ++i) {
    for (let j = i + 1; j < a.length; ++j) {
      if (key && a[i][key] === a[j][key]) a.splice(j--, 1);
      else if (JSON.stringify(a[i]) === JSON.stringify(a[j])) a.splice(j--, 1);
    }
  }
  return a;
};

export const handleDownloadCSV = async (url: string, name: string = 'file-csv') => {
  const res = await fetch(linkApi + url, {
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      authorization: 'Bearer ' + (localStorage.getItem(keyToken) || ''),
      'Accept-Language': localStorage.getItem('i18nextLng') || '',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  });
  if (res.status < 300) {
    const text = await res.text();
    const link = window.document.createElement('a');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(text));
    link.setAttribute('download', name + '.csv');
    link.click();
  }
};
export const download = async (url: string) => {
  const res = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      authorization: localStorage.getItem(keyToken) ? 'Bearer ' + localStorage.getItem(keyToken) : '',
      'Accept-Language': localStorage.getItem('i18nextLng') || '',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  });
  if (res.status == 200) {
    const blob = await res.blob();
    console.log('filename: ', res.headers.get('Content-Disposition'));
    const fileName = decodeURIComponent(
      res.headers.get('Content-Disposition')?.split("filename*=UTF-8''")[1] ?? new Date().toISOString().slice(0, 10),
    );
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.download = fileName;
    downloadLink.click();
    window.URL.revokeObjectURL(downloadLink.href);
  } else {
    await Message.error({ text: res.statusText });
  }
};

export const uuidv4 = () => {
  let d = new Date().getTime(); //Timestamp
  let d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0; //Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};
export const renderTitleBreadcrumbs = (title: string, _breadcrumbs?: { title: string; link: string }[]) => {
  document.title = title;
  document.querySelectorAll('.title-page').forEach((e) => (e.innerHTML = title));
  // document.querySelectorAll('.breadcrumbs-page').forEach(
  //   (e) =>
  //     (e.innerHTML = ReactDOMServer.renderToStaticMarkup(
  //       breadcrumbs.map((item, i) => (
  //         <Fragment key={i}>
  //           <span className={classNames({ 'text-gray-400': i < breadcrumbs.length - 1 })}>{item.title}</span>{' '}
  //           {i < breadcrumbs.length - 1 && <Arrow className={'w-2.5 h-2.5 mx-1.5'} />}
  //         </Fragment>
  //       )),
  //     )),
  // );
};
export const isNumeric = (str: string) => {
  return !isNaN(Number(str)) && !isNaN(parseFloat(str));
};

export const mapTreeObject = (item: any, options: { groupKey?: string; expanded?: boolean } = {}) => {
  if (!item) return [];
  const { groupKey, expanded } = options;
  if (groupKey) {
    item = item.reduce((acc: any, cur: any) => {
      const index = acc.findIndex((find: any) => find.title === cur[groupKey]);
      if (index === -1) acc.push({ title: cur[groupKey], code: cur[groupKey], children: [cur] });
      else acc[index]['children'].push(cur);
      return acc;
    }, []);
  }
  return item.map((item: any) => ({
    title: item.name || item?.title,
    key: item.code || item?.id,
    value: item.code || item?.id,
    isLeaf: !item.children?.length,
    expanded: expanded ?? true,
    children: !item.children ? null : mapTreeObject(item.children),
  })) as TreeDataNode[];
};
export const textWidth = (text?: string, fontProp?: string) => {
  if (text) {
    const tag = document.createElement('div');
    tag.style.position = 'absolute';
    tag.style.left = '-999em';
    tag.style.whiteSpace = 'nowrap';
    if (fontProp) tag.style.font = fontProp;
    tag.innerHTML = text;
    document.body.appendChild(tag);
    const result = tag.clientWidth;
    document.body.removeChild(tag);
    return result;
  }
  return 0;
};
export const getLongTextInArray = (arr: string[]) => arr.reduce((a, b) => (a.length > b.length ? a : b));
export const reorderArray = (list: any[], startIndex: any, endIndex: any) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};
export const cssInObject = (styles: string) =>
  styles
    .trim()
    .split(';')
    .map((cur) =>
      cur
        .trim()
        .split(':')
        .map((i) => i.trim()),
    )
    .filter((i) => i.length === 2)
    .reduce((acc: any, val) => {
      const [key, value] = val;
      const newKey = key.replace(/-./g, (css) => css.toUpperCase()[1]);
      acc[newKey] = value;
      return acc;
    }, {});

export const debounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value]);
  return debouncedValue;
};
// export const formatDataChart = (
//   obj: any,
//   type: ETypeChart = ETypeChart.pie,
//   title: string,
//   level = 1,
//   list?: string[],
// ) => {
//   const listXy = [ETypeChart.scatter, ETypeChart.bubble];
//   const listNumber = [ETypeChart.pie, ETypeChart.ring];
//   let series: any[] = [];
//   const category = obj.data
//     .filter((i: any) => !level || (i.level === level && !i.isSummary))
//     .map((i: any) => i.content);
//   if (listXy.indexOf(type) > -1) {
//     const listField: any[] = [];
//     obj.meta
//       .filter((i: any) => i.type === 'number' && (!list?.length || list.indexOf(i.field) > -1))
//       .forEach((i: any, j: number, array: any[]) => {
//         switch (type) {
//           case ETypeChart.bubble:
//             if (j % 3 === 2)
//               listField.push({
//                 name: array[j - 1].fullName + ' vs ' + array[j - 2].fullName + ' vs ' + i.fullName,
//                 field: array[j - 1].field + '|' + array[j - 2].field + '|' + i.field,
//                 value: [],
//               });
//             break;
//           default:
//             if (j % 2 === 1)
//               listField.push({
//                 name: array[j - 1].fullName + ' vs ' + i.fullName,
//                 field: array[j - 1].field + '|' + i.field,
//                 value: [],
//               });
//         }
//       });
//     obj.data
//       .filter((i: any) => !level || (i.level === level && !i.isSummary))
//       .forEach((e: any) => {
//         series.push({ name: e.content, value: [] });
//         listField.forEach((i: any, index: number) => {
//           const arrayField = listField[index].field.split('|');
//           const value: number[] = [];
//           arrayField.forEach((i: string) => {
//             value.push(isNumeric(e[i]) ? parseFloat(e[i]) : 0);
//           });
//           series[series.length - 1].value.push([...value, ...listField[index].name.split(' vs ')]);
//         });
//       });
//   } else {
//     let listField = obj.meta
//       .filter((i: any) => i.type === 'number')
//       .map((i: any) => ({
//         value: listNumber.indexOf(type) > -1 ? 0 : [],
//         name: i.fullName,
//         field: i.field,
//         formula: i.formula,
//       }));
//     obj.data
//       .filter((i: any) => !level || (i.level === level && !i.isSummary))
//       .forEach((e: any) => {
//         listField.forEach((i: any, index: number) => {
//           if (listNumber.indexOf(type) > -1 && isNumeric(e[i.field])) listField[index].value += parseFloat(e[i.field]);
//           else listField[index].value.push(isNumeric(e[i.field]) ? parseFloat(e[i.field]) : 0);
//         });
//       });
//     const data = JSON.parse(JSON.stringify(listField));
//     listField = listField
//       .map((item: any) => {
//         if (item.formula && listNumber.indexOf(type) > -1) {
//           let formula = item.formula;
//           data?.forEach((i: any) => {
//             if (i.field && formula.indexOf(i.field) > -1) {
//               formula = formula.replaceAll(i.field, i.value);
//             }
//           });
//           item.value = eval(formula);
//           item.value =
//             !!item.value && item.value !== Infinity && !isNaN(item.value)
//               ? /^\d+$/.test(item.value)
//                 ? item.value
//                 : parseFloat(item.value.toFixed(2))
//               : 0;
//         }
//         return item;
//       })
//       .filter((i: any) => !list?.length || list.indexOf(i.field) > -1);
//     series = listNumber.indexOf(type) > -1 ? [{ data: listField }] : listField;
//   }
//   return { title, type, series, category };
// };

export const scrollLeftWhenChanging = (el: string) => {
  const elementToScrollLeft = document.querySelector(el);
  if (elementToScrollLeft) elementToScrollLeft.scrollLeft = 0;
};
export const scrollTopWhenChanging = (el: string) => {
  const elementToScrollTop = document.querySelector(el);
  if (elementToScrollTop) elementToScrollTop.scrollTop = 0;
};

export const lowercaseFirstLetter = (value?: string) => {
  if (!value) return value;
  return value.charAt(0).toLowerCase() + value.slice(1);
};

// format
// export function formatCurrency(value: number | string): string {
//   // Ensure the value is a string
//   let strValue: string = value.toString();

//   // Remove any non-numeric characters (optional, depending on input)
//   strValue = strValue.replace(/[^0-9]/g, '');

//   // Format the number with periods separating thousands
//   return strValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
// }

export function formatCurrencyNumber(value: number | string): string {
  if (typeof value === 'number') {
    // Format value as a currency string with dot separators for thousands
    return value.toLocaleString('de-DE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  } else {
    {
      // Parse string to number first
      {
        const numberValue = parseFloat(value.replace(/,/g, '').replace(/\./g, ''));
        {
          if (isNaN(numberValue)) {
            throw new Error('Chuỗi nhập vào không phải là số hợp lệ.');
          }
          return numberValue.toLocaleString('de-DE', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          });
        }
      }
    }
  }
}

// Hàm chuyển đổi số thành chữ
const UNITS = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const TENS = ['', '', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const HUNDREDS = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const SCALE = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];

function capitalizeFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function convertThreeDigitsToWords(number: number): string {
  const hundreds = Math.floor(number / 100);
  const tens = Math.floor((number % 100) / 10);
  const units = number % 10;

  let result = '';

  if (hundreds !== 0) {
    result += `${HUNDREDS[hundreds]} trăm `;
    if (tens === 0 && units !== 0) {
      result += 'lẻ ';
    }
  }

  if (tens !== 0) {
    result += tens === 1 ? 'mười ' : `${TENS[tens]} mươi `;
    if (units === 5) {
      result += 'lăm ';
    } else if (units !== 0) {
      result += `${UNITS[units]} `;
    }
  } else if (units !== 0) {
    result += `${UNITS[units]} `;
  }

  return result.trim();
}

export function formatCurrency(value: number | string): string {
  // Ensure the value is a string
  let strValue: string = value.toString();

  // Remove any non-numeric characters (optional, depending on input)
  strValue = strValue.replace(/[^0-9]/g, '');

  // Format the number with periods separating thousands
  return strValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function convertNumberToWords(amount: number): string {
  if (amount === 0) return 'không đồng';

  let words = '';
  let scaleIndex = 0;
  const isRoundNumber = amount % 1000 === 0;

  while (amount > 0) {
    const threeDigits = amount % 1000;
    if (threeDigits !== 0) {
      const threeDigitsWords = convertThreeDigitsToWords(threeDigits);
      words = `${threeDigitsWords} ${SCALE[scaleIndex]} ${words}`.trim();
    }
    amount = Math.floor(amount / 1000);
    scaleIndex++;
  }

  // Capitalize the first letter of the final result and add "chẵn" if it's a round number
  return capitalizeFirstLetter(`${words} đồng${isRoundNumber ? ' chẵn' : ''}`.trim());
}

// Format ngày theo định dạng tiếng Việt
export function formatVietnameseDate(dateInput: string | Date | Dayjs, capitalize: boolean = true): string {
  const date = dayjs(dateInput).toDate(); // Chuyển đổi về đối tượng Date để xử lý

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  const dayText = capitalize ? 'Ngày' : 'ngày';
  return `${dayText} ${day} tháng ${month} năm ${year}`;
}

export function formatAmount(value?: number): string {
  return value?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'; // Chỉ format với dấu phẩy
}

// Format ngày theo định dạng của thư viện dayjs
export function formatDayjsDate(
  dateString?: string | null | Dayjs,
  format: string = 'DD/MM/YYYY',
  includeTime: boolean = false,
): string {
  if (!dateString) {
    return ''; // Trả về nếu dateString không được cung cấp
  }

  // Kết hợp định dạng ngày và giờ
  const formatString = includeTime ? `${format} HH:mm` : format;

  // Kiểm tra tính hợp lệ của dateString
  const parsedDate = dayjs(dateString);
  if (!parsedDate.isValid()) {
    return ''; // Trả về nếu dateString không hợp lệ
  }

  // Trả về chuỗi ngày định dạng theo yêu cầu
  return parsedDate.format(formatString);
}

export function isLoadAllData(state: { pagination?: Pagination<any>; queryParams?: string }) {
  return !!(state?.queryParams && JSON.parse(state?.queryParams).size == -1 && state.pagination?.content);
}

export function scrollToBottom(el: Element | null | undefined, smooth = true, onlyBottom = false) {
  if (!el || (onlyBottom && el.scrollHeight - el.clientHeight - 10 > el.scrollTop)) {
    return;
  }

  setTimeout(() => {
    el.scroll({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'instant',
    });
  }, 0);
}

export const formatPhoneNumber = (phone?: string | null): string => {
  const cleaned = phone?.replace(/\D/g, ''); // Sử dụng optional chaining

  if (!cleaned) return ''; // Kiểm tra nếu cleaned là undefined

  if (cleaned.startsWith('84')) {
    const match = cleaned.match(/^84(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+84 ${match[1]} ${match[2]} ${match[3]}`;
    }
  }

  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }

  return phone || ''; // Trả về chuỗi rỗng nếu phone không hợp lệ
};
export const getFileIcon = (fileType?: string) => {
  switch (fileType) {
    case 'WEBP':
    case 'JPEG':
    case 'JPG':
    case 'PNG':
    case 'IMAGE':
      return './assets/svgs/photo-image.svg';
    case 'TEXT':
    case 'TXT':
      return './assets/svgs/text.svg';
    case 'CSV':
      return './assets/svgs/text.svg';
    default:
      return './assets/svgs/attach-file.png';
  }
};
export const formatTreeData: any = (data: any[] = []) => {
  return data.map((item) => ({
    title: item.name,
    value: item.id,
    children: item?.children?.length > 0 ? formatTreeData(item.children) : [],
  }));
};
