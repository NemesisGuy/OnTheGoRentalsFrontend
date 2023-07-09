<template>
  <div class="home">
    <div class="jumbotron">
      <!-- Jumbotron content -->
        <h1 class="display-4"><i class="fas fa-car"></i> Welcome to On The Go Rentals!</h1>
        <p class="lead">We offer affordable car rental services to meet your needs.</p>
        <hr class="my-4">
        <p>Explore our wide range of cars and book your rental today.</p>
      <!-- Link to view all cars -->
      <router-link :to="{ name: 'CarList', params: { category: 'all', available: true } }" class="custom-button">
        <i class="fas fa-search"></i> View details
      </router-link>
    </div>
    <div class="container">
      <h2>Our Services</h2>
      <div class="row">
        <div class="col-md-4">
          <div class="card mb-4 shadow-sm">
            <div class="card-body box-shadow">
              <h3 class="card-title"><i class="fas fa-car-side"></i> Economy Cars</h3>
              <p class="card-text">Affordable cars for your everyday needs.</p>
              <div class="justify-content-between align-items-center">
                <!-- Link to view available economy cars -->
                <router-link :to="{ name: 'CarList', params: { category: 'economy', available: true } }" class="custom-button">
                  <i class="fas fa-info-circle"></i> View
                </router-link>
                <p class="card-text mt-2">Starting at $25/day</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card mb-4 shadow-sm">
            <div class="card-body box-shadow">
              <h3 class="card-title"><i class="fas fa-gem"></i> Luxury Cars</h3>
              <p class="card-text">Experience the thrill of driving in style.</p>
              <div class="justify-content-between align-items-center">
                <!-- Link to view available luxury cars -->
                <router-link :to="{ name: 'CarList', params: { category: 'luxury', available: true } }" class="custom-button">
                  <i class="fas fa-info-circle"></i> View
                </router-link>
                <p class="card-text mt-2">Starting at $100/day</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card mb-4 shadow-sm">
            <div class="card-body box-shadow">
              <h3 class="card-title"><i class="fas fa-tags"></i> Special Offers</h3>
              <p class="card-text">Check out our latest deals and discounts.</p>
              <div class="justify-content-between align-items-center">
                <!-- Link to view available special cars -->
                <router-link :to="{ name: 'CarList', params: { category: 'special', available: true } }" class="custom-button">
                  <i class="fas fa-info-circle"></i> View
                </router-link>
                <p class="card-text mt-2">Limited time only</p>
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
  background-image: url('../../assets/paralax-stars.jpg');
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

.custom-button {

  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 0.25rem;
  transition: background-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  text-decoration: none;

}

.custom-button:hover {
  background-color: #0069d9;
}

.custom-button i {
  margin: 0.5rem;
}
</style>
