<template>
    <div class="home">
        <div class="jumbotron">
            <h1 class="display-4">Welcome to Go Rentals!</h1>
            <p class="lead">We offer affordable car rental services to meet your needs.</p>
            <hr class="my-4">
            <p>Explore our wide range of cars and book your rental today.</p>
            <a class="btn btn-primary btn-lg" href="#" role="button">Learn more</a>
        </div>
        <div class="container">
            <h2>Our Services</h2>
            <div class="row">
                <div class="col-md-4">
                    <div class="card mb-4 shadow-sm">
                        <div class="card-body">
                            <h3 class="card-title">Economy Cars</h3>
                            <p class="card-text">Affordable cars for your everyday needs.</p>
                            <div class="d-flex justify-content-between align-items-center">
                              <router-link :to="{ name: 'CarList', params: { category: 'economy' } }">
                                  View details
                              </router-link>
                                <small class="text-muted">Starting at $25/day</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card mb-4 shadow-sm">
                        <div class="card-body">
                            <h3 class="card-title">Luxury Cars</h3>
                            <p class="card-text">Experience the thrill of driving in style.</p>
                            <div class="d-flex justify-content-between align-items-center">
                              <router-link :to="{ name: 'CarList', params: { category: 'luxury' } }" class="btn btn-sm btn-outline-secondary">
                                  View details
                              </router-link>
                                <small class="text-muted">Starting at $100/day</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card mb-4 shadow-sm">
                        <div class="card-body">
                            <h3 class="card-title">Special Offers</h3>
                            <p class="card-text">Check out our latest deals and discounts.</p>
                            <div class="d-flex justify-content-between align-items-center">
                              <router-link :to="{ name: 'CarList', params: { category: 'special' } }" class="btn btn-sm btn-outline-secondary">
                                  View details
                              </router-link>
                                <small class="text-muted">Limited time only</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Home',
};
</script>

<style>
.jumbotron {
    background-image: url('../assets/paralax-stars.jpg');

    background-size: cover;
    height: 500px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #fff;
}
.card {
    min-height: 250px;
    background: #a5a1ff;
    background-color: #a5a1ff;
    --bs-card-bg: #a5a1ff !important;


}
</style>
