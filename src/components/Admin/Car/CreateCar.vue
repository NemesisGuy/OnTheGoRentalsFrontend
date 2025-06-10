<template>
  <div class="card-container card-container-admin">
    <div class="form-container">
      <LoadingModal v-if="loading" show :message="loadingMessage"/>

      <form @submit.prevent="addCar">
        <div class="form-header">
          <h2><i class="fas fa-plus-circle"></i> Add New Car</h2>
        </div>
        <hr/>

        <!-- Car Details Section -->
        <h3 class="form-section-header">Car Details</h3>
        <div class="form-grid">
          <div class="form-group">
            <label for="make">Make:</label>
            <input id="make" v-model="car.make" placeholder="e.g., Toyota" required type="text">
          </div>
          <div class="form-group">
            <label for="model">Model:</label>
            <input id="model" v-model="car.model" placeholder="e.g., Corolla" required type="text">
          </div>
          <div class="form-group">
            <label for="year">Year:</label>
            <input id="year" v-model.number="car.year" placeholder="e.g., 2023" required type="number" min="1900" :max="new Date().getFullYear() + 1">
          </div>
          <div class="form-group">
            <label for="category">Category:</label>
            <input id="category" v-model="car.category" placeholder="e.g., Sedan" required type="text">
          </div>
          <div class="form-group">
            <label for="priceGroup">Price Group:</label>
            <select id="priceGroup" v-model="car.priceGroup" required>
              <option disabled value="">Please select a group</option>
              <option v-for="group in priceGroups" :key="group" :value="group">{{ group }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="licensePlate">License Plate:</label>
            <input id="licensePlate" v-model="car.licensePlate" placeholder="e.g., CA 123-456" required type="text">
          </div>
          <div class="form-group">
            <label for="vin">VIN (Vehicle Identification Number):</label>
            <input id="vin" v-model="car.vin" placeholder="Enter 17-digit VIN" type="text">
          </div>
        </div>
        <hr/>

        <!-- Image Upload Section -->
        <h3 class="form-section-header">Upload Images</h3>
        <div class="form-group">
          <label for="carImages" class="file-input-label button">
            <i class="fas fa-upload"></i> Choose Images...
          </label>
          <input id="carImages" type="file" @change="handleFileChange" accept="image/jpeg, image/png, image/gif" multiple>
          <p class="form-help-text">You can select multiple images at once.</p>
        </div>

        <!-- Previews for selected images -->
        <div v-if="imagePreviews.length > 0" class="new-image-previews">
          <div v-for="(preview, index) in imagePreviews" :key="index" class="image-thumbnail-wrapper">
            <img :src="preview" class="gallery-thumbnail" alt="New car image preview">
          </div>
        </div>

        <div class="button-container">
          <button class="confirm-button button" type="submit" :disabled="loading"><i class="fas fa-check"></i> Create Car</button>
          <button class="back-button button" type="button" @click="goBack"><i class="fas fa-arrow-left"></i> Back</button>
        </div>
      </form>
    </div>

    <!-- Modals for feedback -->
    <SuccessModal :show="successModal.show" :message="successModal.message" @close="closeModalAndGoBack" />
    <FailureModal :show="failModal.show" :message="failModal.message" @close="closeModal" />
  </div>
</template>

<script>
import api from "@/api";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import { PriceGroup } from "@/enums/PriceGroup"; // Assuming you have enums defined

/**
 * AddCar.vue
 * Component for administrators to create a new car entry.
 * This form allows setting car details and uploading one or more images simultaneously.
 * The process is a two-step API call: first create the car, then upload images to it.
 */
export default {
  name: "AddCar",
  components: { LoadingModal, FailureModal, SuccessModal },
  data() {
    return {
      /**
       * The car object holding the form data.
       * @type {object}
       */
      car: {
        make: '',
        model: '',
        year: new Date().getFullYear(),
        category: '',
        priceGroup: PriceGroup.STANDARD, // Default to a standard value
        licensePlate: '',
        vin: ''
      },
      /**
       * An array to hold the File objects selected by the user.
       * @type {File[]}
       */
      imageFiles: [],
      /**
       * An array to hold the temporary URLs for previewing selected images.
       * @type {string[]}
       */
      imagePreviews: [],
      /**
       * Enum values for the price group dropdown.
       * @type {string[]}
       */
      priceGroups: Object.values(PriceGroup),
      // --- Modal and loading state management ---
      loading: false,
      loadingMessage: "",
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
    };
  },
  methods: {
    /**
     * Handles the user selecting image files from the file input.
     * Updates the component's state with the selected files and generates preview URLs.
     * @param {Event} event - The file input change event.
     */
    handleFileChange(event) {
      this.imageFiles = Array.from(event.target.files);
      // Revoke old object URLs to prevent memory leaks before creating new ones
      this.imagePreviews.forEach(url => URL.revokeObjectURL(url));
      this.imagePreviews = this.imageFiles.map(file => URL.createObjectURL(file));
      console.log(`Selected ${this.imageFiles.length} file(s) for upload.`);
    },

    /**
     * Handles the form submission to create a new car and upload its images.
     * This is a robust two-step process.
     */
    addCar() {
      this.loading = true;
      this.loadingMessage = "Creating car details...";
      console.log("Attempting to add car with details:", this.car);

      let newCarUuid = null;

      // Step 1: POST the car details (as JSON) to create the car record.
      api.post('/api/v1/admin/cars', this.car)
          .then(response => {
            if (response.data?.status !== 'success' || !response.data.data?.uuid) {
              throw new Error("Failed to create car or received invalid response.");
            }
            newCarUuid = response.data.data.uuid;
            console.log(`Car created successfully with UUID: ${newCarUuid}`);

            // Step 2: If car creation was successful AND there are images to upload, proceed.
            if (this.imageFiles.length > 0) {
              this.loadingMessage = `Uploading ${this.imageFiles.length} image(s)...`;

              const formData = new FormData();
              this.imageFiles.forEach(file => {
                formData.append('images', file); // The backend expects a list with the key "images"
              });

              // Return the next promise in the chain for image upload.
              return api.post(`/api/v1/admin/cars/${newCarUuid}/images`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              });
            } else {
              // If no images, the process is done. Return a resolved promise to skip the next .then block.
              return Promise.resolve(null);
            }
          })
          .then(imageResponse => {
            // This block runs after both car creation and (optional) image upload are complete.
            if (imageResponse) { // This will be null if no images were uploaded
              console.log("Images uploaded successfully:", imageResponse.data);
              this.successModal = { show: true, message: "Car and images added successfully!" };
            } else {
              this.successModal = { show: true, message: "Car details added successfully!" };
            }
          })
          .catch(error => {
            const errorMsg = error.response?.data?.errors?.map(e => e.message).join(', ') || error.message || 'An unexpected error occurred.';
            this.failModal = { show: true, message: errorMsg };
            console.error("Failed to add car:", error.response || error);
          })
          .finally(() => {
            this.loading = false;
          });
    },

    /**
     * Closes any active feedback modal.
     */
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
    },

    /**
     * Closes the success modal and navigates back to the car management list.
     */
    closeModalAndGoBack() {
      this.closeModal();
      this.$router.push({ name: 'CarManagement' });
    },

    /**
     * Navigates to the previous page in the browser's history.
     */
    goBack() {
      this.$router.go(-1);
    }
  },
  beforeUnmount() {
    // Clean up object URLs when the component is destroyed to prevent memory leaks
    this.imagePreviews.forEach(url => URL.revokeObjectURL(url));
  }
};
</script>

<style scoped>

/* --- New styles for image uploads and previews --- */
.form-section-header {
  margin-top: 30px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 5px;
  margin-bottom: 20px;
  font-size: 1.2rem;
  color: #343a40;
}

input[type="file"] {
  display: none; /* Hide the default ugly file input */
}

.file-input-label {
  display: inline-block;
  padding: 10px 15px;
  cursor: pointer;
  background-color: #5a6268;
  color: white;
  border-radius: 5px;
  font-size: 0.9rem;
}
.file-input-label:hover {
  background-color: #474d52;
}
.form-help-text {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 5px;
}

.new-image-previews {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}
.image-thumbnail-wrapper {
  position: relative;
}
.gallery-thumbnail {
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid #ddd;
}
/* --- End of new styles --- */

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

hr {
  margin: 30px 0;
  border: 0;
  border-top: 1px solid #e9ecef;
}
</style>