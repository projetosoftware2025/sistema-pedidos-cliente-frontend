import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserInterface } from "../../app/models/interfaces/UserInterface";
import {emptyUser} from "../../data/userEmpty";
import { ClienteInterface } from "../../app/models/interfaces/ClienteInterface";
import { emptyCliente } from "../../data/clienteEmpty";

interface AuthState {
  user: UserInterface;
  cliente: ClienteInterface;
}

const initialState: AuthState = {
  user: emptyUser,
  cliente: emptyCliente
};

const authReducer = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserInterface>) {
      state.user = action.payload;
    },
    resetAuth(state) {
      state.user = initialState.user;
    },
    setCliente(state, action: PayloadAction<ClienteInterface>){
      state.cliente = action.payload;
    },
    resetCliente(state) {
      state.cliente = initialState.cliente;
    },
  },
});

export const { setUser, resetAuth, setCliente, resetCliente } = authReducer.actions;

export default authReducer.reducer;
