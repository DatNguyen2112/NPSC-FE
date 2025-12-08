import { Tag, Typography } from 'antd';
import React from 'react';

type T_TagCheck = {
  label: string;
  value: any;
};

type _T_CTF = {
  key: string;
  label: string;
  check?: T_TagCheck[];
};
export const CommonTagFilter = (props: {
  is: boolean;
  onClose: (key: string) => void;
  data: any;
  items: _T_CTF[];
  className?: string;
}) => {
  return props.is && props.items.length > 0 ? (
    <div className={`flex flex-wrap gap-2 pb-4 ${props.className}`}>
      {props.items.map((element, index) => {
        const key = element.key.split('.');

        let isTag: any;
        let value: any;

        if (key.length > 1) {
          isTag =
            props.data.hasOwnProperty(key[0]) &&
            props.data[key[0]].hasOwnProperty(key[1]) &&
            props.data[key[0]][key[1]].length > 0;

          if (isTag) {
            if (element.check && element.check.length > 1) {
              const search = element.check.find((o) => o.value == props.data[key[0]][key[1]]);

              if (search) {
                value = search.label;
              }
            }

            if (!value) {
              value = props.data[key[0]][key[1]];
            }
          }
        } else {
          isTag = typeof props.data[element.key] !== 'undefined' && props.data[element.key].length > 0;

          if (isTag) {
            if (element.check && element.check.length > 1) {
              const search = element.check.find((o) => o.value === props.data[element.key]);

              if (search) {
                value = search.label;
              }
            }

            if (!value) {
              value = props.data[element.key];
            }
          }
        }

        return isTag && value !== undefined ? (
          <Tag
            className={'tag-main flex text-center items-center'}
            key={index}
            closable
            onClose={() => props.onClose(element.key)}
            color={'blue'}
          >
            <Typography className={'flex text-sm justify-center'}>{element.label}</Typography>: &nbsp;
            <Typography>{value}</Typography>
          </Tag>
        ) : null;
      })}
    </div>
  ) : null;
};
