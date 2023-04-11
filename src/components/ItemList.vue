<template>
    <div>
        <h1>Items</h1>
        <ul>
            <li v-for="item in items" :key="item.id">{{ item.name }}</li>
        </ul>
    </div>
</template>

<script>
import api from '../api';

export default {
    data() {
        return {
            items: []
        };
    },

    created() {
        api.getItems().then(response => {
            this.items = response.data;
        });
    }
}
</script>
