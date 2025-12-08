import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useAppDispatch, useTypedSelector, Action, Slice, State } from '@store';
import { CommonEntity, Responses } from '@models';
import { keyToken, linkApi, routerLinks, uuidv4 } from '@utils';

interface StateNhaCungCap<T> extends State<T, EStatusChatbot> {
  messages?: MessageModel[];
  isOpen?: boolean;
  messageStore?: Record<string, MessageModel[]>;
  currentCustomerId?: string;
  isWaitingForResponse?: boolean;
  customStatus?: string;
}

export class MessageModel extends CommonEntity {
  constructor(
    public id: string,
    public content: string,
    public isUser: boolean,
    public isLoading: boolean,
    public isError: boolean,
    public timestamp?: Date,
  ) {
    super();
  }
}

export enum EStatusChatbot {
  idle = 'idle',
  sendChatPending = 'sendChatPending',
  sendChatPlaceholder = 'sendChatPlaceholder',
  sendChatAppending = 'sendChatAppending',
  sendChatFulfilled = 'sendChatFulfilled',
  sendChatRejected = 'sendChatRejected',
}

function resolve(func: () => unknown) {
  return (func() as any)[name] as StateNhaCungCap<MessageModel>;
}

const name = 'Chatbot';
const action = {
  ...new Action<MessageModel, EStatusChatbot>(name),
  sendChat: createAsyncThunk<void, string>(
    name + 'sendChat',
    async (prompt, { getState, dispatch, requestId }) => {
      const { isWaitingForResponse, currentCustomerId: customerId } = resolve(getState);

      if (!prompt.trim() || isWaitingForResponse || !customerId) return;

      const userMessage: MessageModel = {
        id: uuidv4(),
        content: prompt,
        isUser: true,
        timestamp: new Date(),
        isLoading: false,
        isError: false,
      };
      const assistantMessage: MessageModel = {
        id: requestId,
        content: '',
        isUser: false,
        isLoading: true,
        isError: false,
      };

      dispatch(
        action.setCallback((prev) => ({
          isWaitingForResponse: true,
          messages: [...prev.messages!, userMessage, assistantMessage],
          status: EStatusChatbot.sendChatPlaceholder,
        })),
      );

      const response = await fetch(`${linkApi}${routerLinks(name, 'api')}/chat`, {
        headers: {
          'Content-Type': 'application/json',
          authorization: localStorage.getItem(keyToken) ? 'Bearer ' + localStorage.getItem(keyToken) : '',
        },
        method: 'POST',
        body: JSON.stringify({
          customerId: customerId,
          prompt: prompt.trim(),
        }),
      });

      if (!response.ok) {
        const result: Responses<string> = await response.json();

        dispatch(
          action.setCallback((prev) => ({
            isWaitingForResponse: false,
            customStatus: new String(EStatusChatbot.sendChatPlaceholder),
            messages: prev.messages.map((x: MessageModel) => {
              if (x.id !== assistantMessage.id) return x;

              return {
                ...x,
                isLoading: false,
                isError: true,
                content: result.message ?? 'Đã có lỗi xảy ra',
                timestamp: new Date(),
              };
            }),
          })),
        );
      }

      const decoder = new TextDecoder();
      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const decodedText = decoder.decode(value, { stream: true });
          console.log(decodedText);

          const appendText = JSON.parse(decodedText) as string;
          const words = appendText.match(/[^\s]*\s*/g);

          for (const word of words ?? []) {
            dispatch(
              action.setCallback((prev) => ({
                isWaitingForResponse: true,
                customStatus: new String(EStatusChatbot.sendChatAppending),
                messages: prev.messages.map((x: MessageModel) => {
                  if (x.id !== assistantMessage.id) return x;

                  return {
                    ...x,
                    isLoading: false,
                    isError: false,
                    content: x.content + word,
                    timestamp: x.timestamp ?? new Date(),
                  };
                }),
              })),
            );

            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }
      } finally {
        reader.cancel();
        dispatch(
          action.set({
            isWaitingForResponse: false,
          }),
        );
      }
    },
    { idGenerator: () => uuidv4() },
  ),
};

export const chatbotSlice = createSlice({
  ...new Slice<MessageModel, EStatusChatbot>(
    action,
    {
      messages: [],
      isOpen: false,
      messageStore: {},
      isWaitingForResponse: false,
    },
    (builder) => {
      builder
        .addCase(action.sendChat.pending, (state) => {
          state.isLoading = true;
          state.status = EStatusChatbot.sendChatPending;
        })
        .addCase(action.sendChat.fulfilled, (state) => {
          state.isLoading = false;
          state.status = EStatusChatbot.sendChatFulfilled;
        })
        .addCase(action.sendChat.rejected, (state) => {
          state.isLoading = false;
          state.status = EStatusChatbot.sendChatRejected;
        });
    },
  ),
  reducers: {
    saveChat: (
      state: StateNhaCungCap<MessageModel>,
      action: PayloadAction<{ customerId: string; messages: MessageModel[] }>,
    ) => {
      state.messageStore = {
        ...state.messageStore,
        [action.payload.customerId]: action.payload.messages,
      };
    },
  },
});
export const ChatbotFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateNhaCungCap<MessageModel>),
    set: (values: StateNhaCungCap<MessageModel>) => dispatch(action.set(values)),
    sendChat: (prompt: string) => dispatch(action.sendChat(prompt)),
    saveChat: (customerId: string, messages: MessageModel[]) =>
      dispatch(chatbotSlice.actions.saveChat({ customerId, messages })),
  };
};
