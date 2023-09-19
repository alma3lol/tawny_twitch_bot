import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatUserstate } from "tmi.js";
import _ from "lodash";
import moment from "moment";

export type Channel = {
  joined: boolean;
  mod: boolean;
  channel: string;
  game?: number;
  users: string[];
  messages: { message: string; user: ChatUserstate; timestamp: number }[];
  joinsAndLeaves: { join: boolean; username: string; timestamp: number }[];
};

const testChannels: Channel[] = [
  {
    channel: '#fakechannel',
    joinsAndLeaves: [
      {
        join: true,
        username: 'fakeuser',
        timestamp: moment('1994-09-14').unix(),
      },
      {
        join: true,
        username: 'fakeuser',
        timestamp: moment('1994-09-14').unix(),
      },
      {
        join: true,
        username: 'fakeuser',
        timestamp: moment('1994-09-14').unix(),
      },
      {
        join: true,
        username: 'fakeuser',
        timestamp: moment('1994-09-14').unix(),
      },
      {
        join: true,
        username: 'fakeuser',
        timestamp: moment('1994-09-14').unix(),
      },
      {
        join: true,
        username: 'fakeuser',
        timestamp: moment('1994-09-14').unix(),
      },
      {
        join: true,
        username: 'fakeuser',
        timestamp: moment('1994-09-14').unix(),
      },
    ],
    mod: true,
    users: [
      'fakeuser0',
      'fakeuser1',
      'fakeuser2',
      'fakeuser3',
      'fakeuser4',
      'fakeuser5',
      'fakeuser6',
      'fakeuser7',
      'fakeuser8',
      'fakeuser9',
      'fakeuser10',
      'fakeuser11',
      'fakeuser12',
      'fakeuser13',
      'fakeuser14',
      'fakeuser15',
      'fakeuser16',
      'fakeuser17',
      'fakeuser18',
      'fakeuser19',
    ],
    joined: true,
    messages: [
      {
        timestamp: moment('1994-09-14').add(5, 'm').unix(),
        message: 'Fake message',
        user: {
          username: 'fakeuser',
          "display-name": 'Fake User',
          color: '#000fff',
        }
      }
    ]
  }
];

export const channelsSlicer = createSlice({
  name: "CHANNELS",
  initialState: testChannels, // [] as Channel[],
  reducers: {
    BOT_JOINED: (state, action: PayloadAction<string>) => {
      let channelFound = false;
      state = state.map((channel) => {
        if (channel.channel === action.payload) {
          channelFound = true;
          channel.joined = true;
        }
        return channel;
      });
      if (!channelFound) {
        state.push({
          channel: action.payload,
          joined: true,
          mod: false,
          users: [],
          messages: [],
          joinsAndLeaves: [],
        });
        return state;
      }
    },
    BOT_LEFT: (state, action: PayloadAction<string>) => {
      let channelFound = false;
      state = state.map((channel) => {
        if (channel.channel === action.payload) {
          channelFound = true;
          channel.joined = false;
        }
        return channel;
      });
      if (!channelFound) {
        state.push({
          channel: action.payload,
          joined: false,
          mod: false,
          users: [],
          messages: [],
          joinsAndLeaves: [],
        });
        return state;
      }
    },
    BOT_MOD: (state, action: PayloadAction<[string, boolean]>) => {
      let channelFound = false;
      state = state.map((channel) => {
        if (channel.channel === action.payload[0]) {
          channelFound = true;
          channel.mod = action.payload[1];
        }
        return channel;
      });
      if (!channelFound) {
        state.push({
          channel: action.payload[0],
          joined: false,
          mod: action.payload[1],
          users: [],
          messages: [],
          joinsAndLeaves: [],
        });
        return state;
      }
    },
    USER_JOINED: (state, action: PayloadAction<[string, string]>) => {
      let channelFound = false;
      const joinLeave = {
        join: true,
        username: action.payload[1],
        timestamp: moment().unix(),
      };
      state = state.map((channel) => {
        if (channel.channel === action.payload[0]) {
          channelFound = true;
          let userFound = false;
          channel.users = channel.users.map((user) => {
            if (user === action.payload[1]) userFound = true;
            return user;
          });
          if (!userFound) channel.users.push(action.payload[1]);
          channel.joinsAndLeaves.push(joinLeave);
        }
        return channel;
      });
      if (!channelFound) {
        state.push({
          channel: action.payload[0],
          joined: true,
          mod: false,
          users: [action.payload[1]],
          messages: [],
          joinsAndLeaves: [joinLeave],
        });
        return state;
      }
    },
    USER_LEFT: (state, action: PayloadAction<[string, string]>) => {
      let channelFound = false;
      const joinLeave = {
        join: false,
        username: action.payload[1],
        timestamp: moment().unix(),
      };
      state = state.map((channel) => {
        if (channel.channel === action.payload[0]) {
          channelFound = true;
          let userFound = false;
          channel.users = channel.users.map((user) => {
            if (user === action.payload[1]) userFound = true;
            return user;
          });
          if (!userFound) channel.users.push(action.payload[1]);
          channel.joinsAndLeaves.push(joinLeave);
        }
        return channel;
      });
      if (!channelFound) {
        state.push({
          channel: action.payload[0],
          joined: true,
          mod: false,
          users: [action.payload[1]],
          messages: [],
          joinsAndLeaves: [joinLeave],
        });
        return state;
      }
    },
    CHAT_MESSAGE: (
      state,
      action: PayloadAction<{
        channel: string;
        message: string;
        user: ChatUserstate;
      }>
    ) => {
      const message = {
        user: action.payload.user,
        timestamp: moment().unix(),
        message: action.payload.message,
      };
      let channelFound = false;
      state = state.map((channel) => {
        if (channel.channel === action.payload.channel) {
          channelFound = true;
          channel.messages.push(message);
          let userFound = false;
          channel.users = channel.users.map((user) => {
            if (action.payload.user.username === user) userFound = true;
            return user;
          });
          if (!userFound)
            channel.users.push(action.payload.user.username || "");
        }
        return channel;
      });
      if (!channelFound) {
        state.push({
          channel: action.payload.channel,
          joined: true,
          mod: false,
          users: [action.payload.user.username || ""],
          messages: [message],
          joinsAndLeaves: [],
        });
        return state;
      }
    },
  },
});

export const {
  USER_LEFT,
  USER_JOINED,
  CHAT_MESSAGE,
  BOT_JOINED,
  BOT_LEFT,
  BOT_MOD,
} = channelsSlicer.actions;
