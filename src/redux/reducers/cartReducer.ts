import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItemInterface {
    id: number;
    titulo: string;
    url: string;
    descricao: string
    quantidade: number;
    preco: number;
}

interface CartState {
    cartProdutos: CartItemInterface[];
}

const initialState: CartState = {
    cartProdutos: [],
};

const cartReducer = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart(state, action: PayloadAction<CartItemInterface>) {
            const item = action.payload;
            const existente = state.cartProdutos.find(p => p.id === item.id);

            if (existente) {
                existente.quantidade += item.quantidade;
            } else {
                state.cartProdutos = [...state.cartProdutos, item];
            }
        },

        removeOneFromCart(state, action: PayloadAction<number>) {
            const item = state.cartProdutos.find(p => p.id === action.payload);
            if (item) {
                if (item.quantidade > 1) {
                    item.quantidade -= 1;
                } else {
                    state.cartProdutos = state.cartProdutos.filter(p => p.id !== action.payload);
                }
            }
        },

        removeFromCart(state, action: PayloadAction<number>) {
            state.cartProdutos = state.cartProdutos.filter(
                (item) => item.id !== action.payload
            );
        },

        clearCart(state) {
            state.cartProdutos = [];
        },
    },
});

export const { addToCart, removeOneFromCart, removeFromCart, clearCart } =
    cartReducer.actions;
export default cartReducer.reducer;
