<template>
    <div class="slide">
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: "Slide"
}
</script>

<style scoped>
.slide {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
    width: 100%;
    background-color: #f5f5f5;
}
</style>