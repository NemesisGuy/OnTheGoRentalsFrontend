<template>
  <div class="home">
    <div class="jumbotron">
      <!-- Jumbotron content -->
      <h1 class="display-4"><i class="fas fa-car"></i></h1>
      <h1 class="display-4"> Welcome to On The Go Rentals!</h1>
      <p class="lead">We offer affordable car rental services to meet your needs.</p>
      <hr class="my-4">
      <p>Explore our wide range of cars and book your rental today.</p>
      <!-- Link to view all cars -->
      <div class="button-container button-container-margin">
        <router-link :to="{ name: 'CarList', params: { category: 'all', available: true } }" class="custom-button">
          <i class="fas fa-search"></i> View details
        </router-link>
      </div>
    </div>
    <div class="container">
      <h2 class="content-header display-4">Our Services</h2>
      <div class="row">
        <div class="col-md-4">
          <div class="card mb-4 shadow-lg home-card card" >
            <div class="card-body box-shadow">
              <h3 class="card-title content-header"><i class="fas fa-car-side"></i> Economy Cars</h3>
              <p class="card-text">Affordable cars for your everyday needs.</p>
              <p class="card-text mt-2">Starting at {{ currencyData.currencySymbol }}550.00/day</p>
              <div class="justify-content-between align-items-center">
                <!-- Link to view available economy cars -->
                <div class="button-container button-container-margin" >
                  <router-link :to="{ name: 'CarList', params: { category: 'economy', available: true } }" class="custom-button">
                    <i class="fas fa-info-circle"></i> View
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card mb-4 shadow-sm home-card">
            <div class="card-body box-shadow">
              <h3 class="card-title content-header"><i class="fas fa-gem"></i> Luxury Cars</h3>
              <p class="card-text">Experience the thrill of driving in style.</p>
              <p class="card-text mt-2">Starting at {{ currencyData.currencySymbol }}800.00/day</p>
              <div class="justify-content-between align-items-center">
                <!-- Link to view available luxury cars -->
                <div class="button-container button-container-margin">
                  <router-link :to="{ name: 'CarList', params: { category: 'luxury', available: true } }"
                               class="custom-button">
                    <i class="fas fa-info-circle"></i> View
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card mb-4 shadow-sm home-card">
            <div class="card-body box-shadow">
              <h3 class="card-title content-header"><i class="fas fa-tags"></i> Special Offers</h3>
              <p class="card-text">View our current deals and discounts.</p>
              <p class="card-text mt-2">Starting at {{ currencyData.currencySymbol }}450.00/day </p>
              <div class="justify-content-between align-items-center">
                <!-- Link to view available special cars -->
                <div class="button-container button-container-margin">
                  <router-link :to="{ name: 'CarList', params: { category: 'special', available: true } }"
                               class="custom-button button">
                    <i class="fas fa-info-circle"></i> View
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import store, {currencySymbol} from "@/store/store";
/*import {currencySymbol} from "@/store/currencyStore";*/

export default {
  name: 'Home',
  props: ['currencyData'],
  mounted() {
    console.log("Current token:  " + store.state.token); // Output the value of the token

    console.log("Currency Symbol : " + currencySymbol.value); // Output the value of the currency symbol

  }

};
</script>

<style>

</style>
