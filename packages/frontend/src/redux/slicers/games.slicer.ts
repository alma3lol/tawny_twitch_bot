import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type GameType = "NONE" | "QUESTIONS";

export type Game = {
  id: number;
  type: GameType;
  ended: boolean;
};

export const gamesSlicer = createSlice({
  name: "GAMES",
  initialState: [] as Game[],
  reducers: {
    ADD_GAME: (state, action: PayloadAction<Game>) => {
      state.push(action.payload);
    },
    END_GAME: (state, action: PayloadAction<number>) => {
      state = state.map((game) => {
        if (game.id === action.payload) {
          game.ended = true;
        }
        return game;
      });
    },
  },
});

export const { ADD_GAME, END_GAME } = gamesSlicer.actions;
