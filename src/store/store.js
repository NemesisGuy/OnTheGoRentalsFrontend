/*
// store.js

import { createStore } from 'vuex';
import { ref } from 'vue';

const state = {
    token: null,
    currencySymbol: 'USD', // Set a default value for currencySymbol
};

const mutations = {
    setToken(state, token) {
        state.token = token;
    },
    clearToken(state) {
        state.token = null;
    },
    setCurrencySymbol(state, symbol) {
        state.currencySymbol = symbol;
    },
};

export default createStore({
    state,
    mutations,
});

export const currencySymbol = ref(state.currencySymbol); // Use ref with default value
export const setCurrencySymbol = (symbol) => {
    currencySymbol.value = symbol;
    // Save to localStorage or send to backend for persistence
};
*/
