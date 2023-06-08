<template>
    <div>
        <h1>{{ car.name }}</h1>
        <p>{{ car.description }}</p>
        <p>Price: {{ car.price }}</p>

    </div>
</template>

<script>


export default {
    name: 'CarDetail',
    components: {
        Carousel
    },
    data() {
        return {
            car: {
                id: 1,
                name: 'Toyota Corolla',
                price: 2500,
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                images: [
                    'https://via.placeholder.com/800x400/FF5733/FFFFFF?text=Image+1',
                    'https://via.placeholder.com/800x400/333333/FFFFFF?text=Image+2',
                    'https://via.placeholder.com/800x400/7B2FBE/FFFFFF?text=Image+3',
                    'https://via.placeholder.com/800x400/0099CC/FFFFFF?text=Image+4'
                ]
            }
        }
    }
};
</script>
