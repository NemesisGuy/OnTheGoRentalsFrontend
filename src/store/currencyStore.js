// currencyStore.js

import { ref } from 'vue';

const currencySymbol = ref('');

const setCurrencySymbol = (symbol) => {
    currencySymbol.value = symbol;
    // Save to localStorage or send to backend for persistence
};

export { currencySymbol, setCurrencySymbol };
