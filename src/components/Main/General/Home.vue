<template>
  <div class="home-page">
    <!-- 1. Hero Section -->
    <div class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content text-center">
        <i class="fas fa-car-alt hero-icon"></i>
        <h1 class="display-3 font-weight-bold">On The Go Rentals</h1>
        <p class="lead mt-3">Your journey, your car, your price. Seamless rentals for every adventure.</p>
        <hr class="my-4 hr-light">
        <router-link :to="{ name: 'CarList', params: { pricegroup: 'all'} }" class="btn btn-primary btn-lg custom-button">
          <i class="fas fa-search-dollar"></i> Browse Our Fleet
        </router-link>
      </div>
    </div>

    <!-- 2. Services Section -->
    <div class="container services-container">
      <h2 class="section-title text-center">Find the Perfect Ride</h2>
      <div class="row justify-content-center">
        <div v-for="service in services" :key="service.name" class="col-lg-4 col-md-6 mb-4 d-flex align-items-stretch">
          <!-- THE FIX IS HERE: The inline style no longer has max-width, allowing the card to fill its column -->
          <div class="card service-card h-100 shadow-sm" style="width: 100%;">
            <img :src="service.image" class="card-img-top" :alt="service.name">
            <div class="card-body d-flex flex-column">
              <h3 class="card-title"><i :class="service.icon"></i> {{ service.name }}</h3>
              <p class="card-text">{{ service.description }}</p>
              <p class="card-text font-weight-bold mt-2">{{ service.price }}</p>
              <div class="mt-auto text-center">
                <router-link :to="service.link" class="btn btn-outline-primary custom-button-outline">
                  {{ service.name }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Features Section -->
    <div class="features-section">
      <div class="container">
        <h2 class="section-title text-center">Why Choose Us?</h2>
        <div class="row text-center">
          <div v-for="feature in features" :key="feature.title" class="col-md-4 mb-4">
            <div class="feature-item">
              <div class="feature-icon">
                <i :class="feature.icon"></i>
              </div>
              <h4 class="feature-title">{{ feature.title }}</h4>
              <p class="feature-description">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import economyCarImage from '@/assets/Images/services/economy.jpg';
import luxuryCarImage from '@/assets/Images/services/luxury.jpg';
import specialOfferImage from '@/assets/Images/services/special.jpg';

export default {
  name: 'Home',
  data() {
    return {
      services: [
        {
          name: 'Economy Cars',
          description: 'Affordable, reliable cars for your everyday needs and city trips.',
          price: 'Starting at R550.00/day',
          icon: 'fas fa-car-side',
          image: economyCarImage,
          link: { name: 'CarList', params: { pricegroup: 'economy' } }
        },
        {
          name: 'Luxury Cars',
          description: 'Experience the thrill of driving in style with our premium selection.',
          price: 'Starting at R800.00/day',
          icon: 'fas fa-gem',
          image: luxuryCarImage,
          link: { name: 'CarList', params: { pricegroup: 'luxury' } }
        },
        {
          name: 'Special Offers',
          description: 'View our current deals and exclusive discounts for great value.',
          price: 'Starting at R450.00/day',
          icon: 'fas fa-tags',
          image: specialOfferImage,
          link: { name: 'CarList', params: { pricegroup: 'special' } }
        }
      ],
      features: [
        {
          icon: 'fas fa-check-circle',
          title: 'Easy Booking',
          description: 'Our simple, streamlined process gets you on the road in just a few clicks.'
        },
        {
          icon: 'fas fa-car-alt',
          title: 'Wide Selection',
          description: 'From compact city cars to luxury sedans, find the perfect vehicle for any occasion.'
        },
        {
          icon: 'fas fa-headset',
          title: '24/7 Support',
          description: 'Our dedicated support team is always here to help you, day or night.'
        }
      ]
    };
  }
};
</script>

<style scoped>

/* Hero Section Styles */
.hero-section {
  position: relative;
  height: 50vh;
  min-height: 450px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('@/assets/Images/Backgrounds/hero-background.jpeg');
  background-size: cover;
  background-position: center 70%;
  border-radius: 1.5rem;
  margin: 2rem;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
}
.hero-content {
  position: relative;
  z-index: 1;
  padding: 2rem;
}
.hero-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  color: #007bff;
  text-shadow: 0 0 15px rgba(0, 123, 255, 0.5);
}
.hr-light {
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  width: 50%;
  margin-left: auto;
  margin-right: auto;
}

/* Services Section Styles */
.services-container {
  padding: 40px 15px;
}
.section-title {
  margin-bottom: 40px;
  font-weight: 700;
  color: #343a40;
}
.service-card {
  border: none;
  border-radius: 15px;
  overflow: hidden;
  background-color: var(--background-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.service-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15) !important;
}
.card-img-top {
  height: 200px;
  object-fit: cover;
}
.card-body {
  padding: 25px;
}
.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-black);
}
.card-title i {
  color: #007bff;
  margin-right: 10px;
}
.card-text {
  color: var(--color-text-black);
}

/* Features Section Styles */
.features-section {
  background-color: #ffffff;
  padding: 60px 15px;
  border-radius: 1.5rem;
  margin: 2rem;
}
.feature-icon {
  font-size: 3rem;
  color: #007bff;
  margin-bottom: 20px;
}
.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 10px;
}
.feature-description {
  color: var(--color-text-black);
}

/* Custom Button Styles */
.custom-button, .custom-button-outline {
  padding: 8px 20px;
  font-weight: 500;
  border-radius: 20px;
  text-decoration: none;
  transition: all 0.3s ease;
  border-width: 2px;
}
.custom-button {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}
.custom-button:hover {
  background-color: #0056b3;
  border-color: #0056b3;
  transform: scale(1.05);
}
.custom-button-outline {
  border-color: #007bff;
  color: #007bff;
}
.custom-button-outline:hover {
  background-color: #007bff;
  color: white;
}
</style>