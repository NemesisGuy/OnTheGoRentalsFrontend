<template>
    <div id="carouselExampleControls" class="carousel slide" data-ride="carousel">
        <div class="carousel-inner">
            <div class="carousel-item active">
                <img src="https://via.placeholder.com/800x400/FF5733/FFFFFF?text=Image+1 About Us" class="d-block w-100" alt="Slide 1">
                <div class="carousel-caption">
                    <h5>Slide 1</h5>
                    <p>Some text for slide 1.</p>
                    <router-link to="/about-us">
                        <button class="btn btn-primary">About Us</button>
                    </router-link>
                </div>
            </div>
            <div class="carousel-item">
                <img src="https://via.placeholder.com/800x400/333333/FFFFFF?text=Image+2 + Login" class="d-block w-100" alt="Slide 2">
                <div class="carousel-caption">
                    <h5>Slide 2</h5>
                    <p>Some text for slide 2.</p>

                        <div>
                            <button @click="login">Login with Google</button>
                        </div>
                        
                        <button class="btn btn-primary">Login</button>

                </div>
            </div>
            <div class="carousel-item">
                <img src="https://via.placeholder.com/800x400/7B2FBE/FFFFFF?text=Image+3 Home" class="d-block w-100" alt="Slide 3">
                <div class="carousel-caption">
                    <h5>Slide 3</h5>
                    <p>Some text for slide 3.</p>
                    <router-link to="/home">
                        <button class="btn btn-primary">Home</button>
                    </router-link>
                </div>
            </div>
            <div class="carousel-item">
                <img src="https://via.placeholder.com/800x400/0099CC/FFFFFF?text=Image+4 Cars" class="d-block w-100" alt="Slide 4">
                <div class="carousel-caption">
                    <h5>Slide 4</h5>
                    <p>Some text for slide 4.</p>
                    <router-link to="cars">
                        <button class="btn btn-primary">Cars</button>
                    </router-link>
                </div>
            </div>
        </div>
        <a class="carousel-control-prev" href="#carouselExampleControls" role="button" data-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="sr-only">Previous</span>
        </a>
        <a class="carousel-control-next" href="#carouselExampleControls" role="button" data-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="sr-only">Next</span>
        </a>
    </div>
</template>



<script>

import $ from 'jquery';
$.noConflict()
export default {
    methods: {
        login() {
            window.location.href = '/oauth2/authorization/google';
        }
    },
    name: 'Carousel',
    props: {
        images: {
            type: Array,
            required: true
        }
    },
    mounted() {
        this.$nextTick(() => {
            $('#carCarousel').carousel(
                {
                interval: 5000,
                pause: 'hover',
                wrap: true,
            });
        });
    }
};
</script>
<style >
.my-carousel .carousel .slide  img{
    width: 100%;
    margin: 0 auto;
}

.my-carousel .slide img {
    max-width: 100%;
    max-height: 400px; /* or any height that suits your needs */
    margin: 0 auto;
}
.carousel-item img {
    max-height: 100%;
}
.carousel  ,.carousel-item ,.carousel ,.slide ,.carousel {
    height: 400px; /* change the value as needed */
    max-height: 400px; /* or any height that suits your needs */
    margin: 0 auto;
}

.carousel-item img {
    max-width: 100%;
    height: auto;
}

.carousel-item {
    height: 600px; /* Change the value as needed */
}
</Style>
