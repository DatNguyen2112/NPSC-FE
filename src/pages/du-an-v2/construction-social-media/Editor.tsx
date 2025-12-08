import { useEditor, EditorContent, ReactRenderer, Editor as TiptapEditor, JSONContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import { FC, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import tippy from 'tippy.js';
import { SuggestionProps } from '@tiptap/suggestion';
import { UserFacade, UserModal } from '@store';
import { Avatar, Card } from 'antd';
import { formatPhoneNumber } from '@utils';

interface EditorProps {
  minHeight?: number;
  placeholder?: string;
  content?: JSONContent;
  editable?: boolean;
  onEmptyChange?: (isEmpty: boolean) => void;
}

const MentionList: FC<SuggestionProps<UserModal>> = ({ items, command }) => {
  return (
    <Card styles={{ body: { padding: 0 } }} className="p-1 rounded-md">
      <div className="flex flex-col gap-1 overflow-auto h-fit max-h-72 miniScroll pr-1">
        {items.length ? (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 cursor-pointer rounded transition-all"
              onClick={() => command({ id: item.id, label: item.name, data: 'user' })}
            >
              <Avatar size={28} className={`${!item.avatarUrl ? 'bg-green-500' : ''}`} src={item.avatarUrl}>
                {!item.avatarUrl && item.name?.charAt(0)}
              </Avatar>
              <div className="flex-1 pr-2">
                <div className="flex justify-between">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-500 text-xs">{item.chucVu?.tenChucVu}</span>
                </div>
                <div className="text-gray-500 text-xs flex flex-wrap gap-1">
                  <span className="font-medium">SĐT:</span>
                  {formatPhoneNumber(item.phoneNumber ?? '')}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="item">No result</div>
        )}
      </div>
    </Card>
  );
};

const Editor = forwardRef<TiptapEditor | null, EditorProps>(
  ({ minHeight, placeholder, content, editable = true, onEmptyChange }, ref) => {
    const userFacade = UserFacade();
    const userList = useRef<UserModal[]>(userFacade.pagination?.content ?? []);
    const mentionPlugin = useRef(
      Mention.configure({
        renderHTML: ({ node }) => {
          return [
            'span',
            { 'data-type': 'mention', class: 'font-medium text-blue-500 hover:underline cursor-default' },
            node.attrs.label ?? node.attrs.id,
          ];
        },
        suggestion: {
          items: ({ query }) => {
            return userList.current.filter((x) => x.name?.toLowerCase().includes(query.toLowerCase())) ?? [];
          },
          render: () => {
            let reactRenderer: any;
            let popup: any;

            return {
              onStart: (props) => {
                reactRenderer = new ReactRenderer(MentionList, {
                  props,
                  editor: props.editor,
                });

                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect as any,
                  appendTo: () => document.body,
                  content: reactRenderer.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                });
              },

              onUpdate(props) {
                reactRenderer.updateProps(props);

                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                });
              },

              onKeyDown(props) {
                if (props.event.key === 'Escape') {
                  popup[0].hide();

                  return true;
                }

                return reactRenderer.ref?.onKeyDown(props);
              },

              onExit() {
                popup[0].destroy();
                reactRenderer.destroy();
              },
            };
          },
        },
      }),
    );

    useEffect(() => {
      userList.current = userFacade.pagination?.content ?? [];
    }, [userFacade.pagination?.content]);

    const editor = useEditor(
      {
        onUpdate: ({ editor }) => {
          onEmptyChange?.(editor.isEmpty);
        },
        extensions: [
          Document,
          Paragraph,
          Text,
          Placeholder.configure({
            placeholder,
            emptyEditorClass:
              'cursor-text before:content-[attr(data-placeholder)] before:absolute before:top-0 before:left-0 before:opacity-50 before-pointer-events-none',
          }),
          mentionPlugin.current,
        ],
        content,
        editable,
      },
      [placeholder, content, editable],
    );

    useImperativeHandle(ref, () => editor as TiptapEditor, [editor]);

    return (
      <div style={{ minHeight: minHeight }} className="flex flex-col">
        <EditorContent
          onChange={(e) => {
            console.log(e);
          }}
          className="focus-visible:*:outline-0"
          editor={editor}
        />
        <div
          className="flex-1 cursor-text"
          onClick={() => {
            if (editor?.isEditable) {
              editor?.commands.focus('end', { scrollIntoView: true });
            }
          }}
        ></div>
      </div>
    );
  },
);

export default Editor;
