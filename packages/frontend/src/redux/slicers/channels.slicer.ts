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

export const channelsSlicer = createSlice({
  name: "CHANNELS",
  initialState: [] as Channel[],
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
