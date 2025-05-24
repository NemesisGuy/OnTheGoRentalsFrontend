<template>
  <div class="home">
    <div class="jumbotron text-center">
      <h1 class="display-4"><i class="fas fa-car"></i></h1>
      <h1 class="responsive-heading">Welcome to On The Go Rentals!</h1>
      <p class="lead">We offer affordable car rental services to meet your needs.</p>
      <hr class="my-4">
      <p>Explore our wide range of cars and book your rental today.</p>
      <div class="button-container button-container-margin">
        <router-link :to="{ name: 'CarList', params: { category: 'all'} }" class="custom-button">
          <i class="fas fa-search"></i> View details
        </router-link>
      </div>
    </div>

    <div class="container">
      <h2 class="responsive-heading text-center mb-4">Our Services</h2>
      <div class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-6 col-lg-4 d-flex justify-content-center mb-3">
          <div class="card shadow-lg home-card h-100" style="width: 100%; max-width: 330px;">
            <div class="card-body d-flex flex-column">
              <h3 class="card-title content-header"><i class="fas fa-car-side"></i> Economy Cars</h3>
              <p class="card-text">Affordable cars for your everyday needs.</p>
              <p class="card-text mt-2">Starting at 550.00/day</p>
              <div class="mt-auto button-container button-container-margin">
                <router-link :to="{ name: 'CarList', params: { category: 'economy'} }" class="custom-button">
                  <i class="fas fa-info-circle"></i> View
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-10 col-md-6 col-lg-4 d-flex justify-content-center mb-3">
          <div class="card shadow-sm home-card h-100" style="width: 100%; max-width: 330px;">
            <div class="card-body d-flex flex-column">
              <h3 class="card-title content-header"><i class="fas fa-gem"></i> Luxury Cars</h3>
              <p class="card-text">Experience the thrill of driving in style.</p>
              <p class="card-text mt-2">Starting at 800.00/day</p>
              <div class="mt-auto button-container button-container-margin">
                <router-link :to="{ name: 'CarList', params: { category: 'luxury' } }" class="custom-button">
                  <i class="fas fa-info-circle"></i> View
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-10 col-md-6 col-lg-4 d-flex justify-content-center mb-3">
          <div class="card shadow-sm home-card h-100" style="width: 100%; max-width: 330px;">
            <div class="card-body d-flex flex-column">
              <h3 class="card-title content-header"><i class="fas fa-tags"></i> Special Offers</h3>
              <p class="card-text">View our current deals and discounts.</p>
              <p class="card-text mt-2">Starting at 450.00/day</p>
              <div class="mt-auto button-container button-container-margin">
                <router-link :to="{ name: 'CarList', params: { category: 'special' } }" class="custom-button">
                  <i class="fas fa-info-circle"></i> View
                </router-link>
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

<style scoped>
.responsive-heading {
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
}

@media (min-width: 768px) {
  .responsive-heading {
    font-size: 2.5rem;
  }
}

.custom-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.2s;
}

.custom-button:hover {
  background-color: #0056b3;
  color: white;
}

.button-container {
  text-align: center;
}

.button-container-margin {
  margin-top: 1rem;
}
.jumbotron{
  max-height: 450px;
}
</style>
