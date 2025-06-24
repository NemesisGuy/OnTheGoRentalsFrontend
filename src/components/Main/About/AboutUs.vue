<template>
  <div class="content-container">
    <div class="page-header">
      <h1><i class="fas fa-info-circle"></i> About Us</h1>
      <p>Get to know On The Go Rentals and how to contact us.</p>
    </div>

    <!-- Loading State with Shimmer -->
    <div v-if="!about" class="about-us-card shimmer-card">
      <div class="shimmer shimmer-map"></div>
      <div class="info-panel">
        <div class="shimmer shimmer-line" style="width: 40%; height: 24px; margin-bottom: 2rem;"></div>
        <div class="shimmer shimmer-line" style="width: 90%;"></div>
        <div class="shimmer shimmer-line" style="width: 70%;"></div>
        <div class="shimmer shimmer-line" style="width: 80%;"></div>
        <div class="shimmer shimmer-line" style="width: 75%;"></div>
        <div class="shimmer shimmer-line" style="width: 60%;"></div>
      </div>
    </div>

    <!-- Main Content Card -->
    <div v-else class="about-us-card">
      <!-- Left Column: Map -->
      <div class="map-container">
        <!--
          HOW TO UPDATE THE MAP:
          1. Go to Google Maps and find your business location.
          2. Click "Share", then "Embed a map".
          3. Copy the HTML and paste the 'src' attribute's URL into the :src binding below.
        -->
        <iframe
            :src="googleMapsUrl"
            width="100%"
            height="100%"
            style="border:0;"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>

      <!-- Right Column: Info -->
      <div class="info-panel">
        <h3 class="panel-title">Contact Information</h3>
        <div class="detail-item">
          <i class="fas fa-map-marker-alt"></i>
          <div>
            <strong>Address</strong>
            <span>{{ about.address }}</span>
          </div>
        </div>
        <div class="detail-item">
          <i class="fas fa-clock"></i>
          <div>
            <strong>Office Hours</strong>
            <span>{{ about.officeHours }}</span>
          </div>
        </div>
        <div class="detail-item">
          <i class="fas fa-envelope"></i>
          <div>
            <strong>Email</strong>
            <a :href="'mailto:' + about.email">{{ about.email }}</a>
          </div>
        </div>
        <div class="detail-item">
          <i class="fas fa-phone"></i>
          <div>
            <strong>Telephone</strong>
            <a :href="'tel:' + about.telephone">{{ about.telephone }}</a>
          </div>
        </div>
        <div class="detail-item">
          <i class="fab fa-whatsapp"></i>
          <div>
            <strong>WhatsApp</strong>
            <a :href="'https://wa.me/' + about.whatsApp.replace(/\D/g,'')" target="_blank">{{ about.whatsApp }}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api";

export default {
  name: 'AboutUs',
  data() {
    return {
      about: null,
      // You can also fetch this URL from your settings API if you want it to be dynamic
      googleMapsUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3310.395782725227!2d18.46363081521207!3d-33.93116848063901!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1dcc5dce63b8e079%3A0x8030f8b91d27e8cf!2sCape%20Peninsula%20University%20of%20Technology!5e0!3m2!1sen!2sza!4v1633020081234!5m2!1sen!2sza",
    };
  },
  mounted() {
    this.fetchAboutUs();
  },
  methods: {
    fetchAboutUs() {
      api.get('/api/v1/about-us/latest')
          .then(response => {
            this.about = response.data.data || response.data; // Handles both wrapped and direct data
          })
          .catch(error => {
            console.error('Error fetching about us data:', error);
            // Optionally, set an error state to show a message to the user
          });
    },
  },
};
</script>

<style scoped>
.content-container {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}
.page-header h1 {
  font-weight: 700;
  color: #343a40;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}
.page-header p {
  color: #6c757d;
  font-size: 1.1rem;
}

.about-us-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.1);
  overflow: hidden;
  min-height: 450px;
}

.map-container {
  width: 100%;
  height: 100%;
}
.map-container iframe {
  width: 100%;
  height: 100%;
  border: 0;
}

.info-panel {
  padding: 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.panel-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #343a40;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.detail-item:last-child {
  margin-bottom: 0;
}
.detail-item i {
  font-size: 1.5rem;
  color: #007bff;
  width: 30px;
  text-align: center;
  margin-top: 5px;
}
.detail-item div {
  display: flex;
  flex-direction: column;
}
.detail-item strong {
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}
.detail-item span, .detail-item a {
  font-size: 1rem;
  font-weight: 500;
  color: #343a40;
  text-decoration: none;
}
.detail-item a:hover {
  text-decoration: underline;
  color: #0056b3;
}

/* Responsive Stacking */
@media (max-width: 992px) {
  .about-us-card {
    grid-template-columns: 1fr; /* Stack columns */
  }
  .map-container {
    height: 300px; /* Give map a fixed height on mobile */
  }
}

/* Shimmer Styles */
.shimmer-card {
  min-height: 450px;
  padding: 0;
}
.shimmer {
  background-image: linear-gradient(to right, #f0f0f0 8%, #e0e0e0 18%, #f0f0f0 33%);
  background-size: 1200px 100%;
  animation: shimmerAnimation 1.8s infinite linear;
}
.shimmer-map {
  width: 100%;
  height: 100%;
}
.shimmer-line {
  height: 16px;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}
@keyframes shimmerAnimation { 0% { background-position: -1200px 0; } 100% { background-position: 1200px 0; } }
</style>