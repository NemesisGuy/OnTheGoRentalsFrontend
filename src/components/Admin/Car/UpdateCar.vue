<template>
  <div class="card-container card-container-admin">
    <div class="form-container">
      <LoadingModal v-if="loading" show :message="loadingMessage"/>

      <form v-if="carData" @submit.prevent="submitUpdate">
        <h2 class="form-header">Edit Car: {{ carData.make }} {{ carData.model }}</h2>

        <!-- NEW: Image Management Section -->
        <div class="form-group">
          <label>Manage Images:</label>
          <div v-if="carData.imageUrls && carData.imageUrls.length > 0" class="image-gallery">
            <div v-for="(url, index) in carData.imageUrls" :key="url" class="image-thumbnail-wrapper">
              <img :src="url" alt="Car Image" class="gallery-thumbnail">
              <button @click="confirmDeleteImage(index)" type="button" class="delete-image-btn" title="Delete Image">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <p v-else class="no-images-text">This car has no images yet.</p>
        </div>

        <!-- NEW: Multiple File Upload Section -->
        <div class="form-group">
          <label for="carImages">Upload New Images:</label>
          <input id="carImages" type="file" @change="handleFileChange" accept="image/jpeg, image/png, image/gif" multiple>
          <label for="carImages" class="file-input-label button">
            <i class="fas fa-upload"></i> Choose Files...
          </label>
          <!-- Display previews of newly selected files -->
          <div v-if="newImagePreviews.length > 0" class="new-image-previews">
            <div v-for="preview in newImagePreviews" :key="preview" class="image-thumbnail-wrapper">
              <img :src="preview" class="gallery-thumbnail" alt="car image preview">
            </div>
          </div>
        </div>
        <hr>

        <!-- Car Details Form (unchanged) -->
        <h3 class="form-section-header">Car Details</h3>
        <div class="form-grid">
          <div class="form-group">
            <label for="make">Make:</label>
            <input id="make" v-model="carData.make" required type="text">
          </div>
          <!-- ... all other form inputs for car details remain the same ... -->
          <div class="form-group">
            <label for="model">Model:</label>
            <input id="model" v-model="carData.model" required type="text">
          </div>
          <div class="form-group">
            <label for="year">Year:</label>
            <input id="year" v-model.number="carData.year" required type="number">
          </div>
          <div class="form-group">
            <label for="category">Category:</label>
            <input id="category" v-model="carData.category" required type="text">
          </div>
          <div class="form-group">
            <label for="priceGroup">Price Group:</label>
            <select id="priceGroup" v-model="carData.priceGroup" required>
              <option v-for="group in priceGroups" :key="group" :value="group">{{ group }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="licensePlate">License Plate:</label>
            <input id="licensePlate" v-model="carData.licensePlate" required type="text">
          </div>
          <div class="form-group">
            <label for="vin">VIN:</label>
            <input id="vin" v-model="carData.vin" type="text">
          </div>
          <div class="form-group form-group-checkbox">
            <label for="available">Available for Rent:</label>
            <input id="available" v-model="carData.available" type="checkbox">
          </div>
        </div>

        <div class="button-container">
          <button class="confirm-button button" type="submit">
            <i class="fas fa-check"></i> Save All Changes
          </button>
          <button class="back-button button" type="button" @click="goBack()">
            <i class="fas fa-arrow-left"></i> Back
          </button>
        </div>
      </form>
      <div v-else-if="!loading" class="error-container">
        <p>{{ errorMessage || "Could not load car data." }}</p>
        <button class="back-button button" @click="goBack">Go Back</button>
      </div>
    </div>

    <!-- Modals -->
    <ConfirmationModal :show="showDeleteConfirmModal" message="Are you sure you want to delete this image? This action cannot be undone." @confirm="deleteImage" @cancel="cancelDeleteImage" />
    <SuccessModal v-if="successModal.show" :message="successModal.message" :show="successModal.show" @close="closeModalAndGoBack" />
    <FailureModal v-if="failModal.show" :message="failModal.message" :show="failModal.show" @close="closeModal" />
  </div>
</template>

<script>
import api from "@/api";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";

export default {
  name: 'EditCar',
  components: { LoadingModal, SuccessModal, FailureModal, ConfirmationModal },
  data() {
    return {
      carData: null,
      carUuid: this.$route.params.uuid,
      newImageFiles: [], // Store multiple new files
      newImagePreviews: [], // Store URLs for previewing new files
      imageToDelete: null, // Stores index and URL of image to delete
      showDeleteConfirmModal: false,
      loading: false,
      loadingMessage: "",
      errorMessage: "",
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
      priceGroups: ["ECONOMY", "STANDARD", "LUXURY", "PREMIUM", "EXOTIC", "SPECIAL", "OTHER", "NONE"],
    };
  },
  /**
   * Lifecycle hook that runs when the component is mounted.
   * It fetches the car details using the car UUID from the route parameters.
   */
  mounted() {
    this.fetchCarDetails();
  },

  computed: {
    /**
     * Returns the car's image URLs for display.
     * If no images are available, returns an empty array.
     */
    carImageUrls() {
      return this.carData?.imageUrls || [];
    }
  },
  methods: {
    /**
     * Fetches the car details from the API using the car UUID.
     * This method is called when the component is mounted.
     */
    fetchCarDetails() {
      // Logic remains the same
      if (!this.carUuid) { this.errorMessage = "Car UUID is missing."; return; }
      this.loading = true;
      api.get(`/api/v1/admin/cars/${this.carUuid}`)
          .then(response => {
            if (response.data?.status === 'success') {
              this.carData = response.data.data;
            } else { throw new Error("Invalid data structure received."); }
          })
          .catch(err => this.errorMessage = err.response?.data?.message || err.message)
          .finally(() => this.loading = false);
    },
    /**
     * Handles file selection for new images.
     * This method is called when the user selects files using the file input.
     * @param {Event} event - The change event from the file input.
     */

    handleFileChange(event) {
      // Handle multiple files
      this.newImageFiles = Array.from(event.target.files);
      this.newImagePreviews = this.newImageFiles.map(file => URL.createObjectURL(file));
    },

    /**
     * Submits the updated car details and handles image uploads.
     * This method is called when the user clicks the "Save All Changes" button.
     */
    submitUpdate() {
      this.loading = true;
      this.loadingMessage = "Saving car details...";

      // Step 1: Update the car's text data
      api.put(`/api/v1/admin/cars/${this.carUuid}`, this.carData)
          .then(() => {
            // Step 2: If details are saved, check if new images need to be uploaded
            if (this.newImageFiles.length === 0) {
              this.loading = false;
              this.successModal = { show: true, message: "Car details updated successfully! No new images were uploaded." };
              return; // Finished if no files to upload
            }

            this.loadingMessage = `Uploading ${this.newImageFiles.length} new image(s)...`;
            const formData = new FormData();
            this.newImageFiles.forEach(file => {
              // The backend endpoint expects a list with the key "images"
              formData.append('images', file);
            });

            // Return the promise for the next .then() block
            return api.post(`/api/v1/admin/cars/${this.carUuid}/images`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          })
          .then(imageResponse => {
            if (imageResponse) { // This block only runs if images were uploaded
              this.successModal = { show: true, message: "Car details and new images saved successfully!" };
            }
          })
          .catch(error => {
            const errorMsg = error.response?.data?.errors?.map(e => e.message).join(', ') || 'An error occurred during the update.';
            this.failModal = { show: true, message: errorMsg };
          })
          .finally(() => this.loading = false);
    },
    /**
     * Opens a confirmation modal to delete an image.
     * This method is called when the user clicks the delete button on an image thumbnail.
     * @param {number} index - The index of the image in the carData.imageUrls array.
     */

    confirmDeleteImage(index) {
      const imageUrl = this.carData.imageUrls[index];
      const imageUuid = imageUrl.split('/').pop().split('.')[0]; // Assumes UUID is the filename
      this.imageToDelete = { index, uuid: imageUuid };
      this.showDeleteConfirmModal = true;
    },
    /**
     * Cancels the image deletion process and closes the confirmation modal.
     * This method is called when the user clicks "Cancel" in the delete confirmation modal.
     */
    cancelDeleteImage() {
      this.imageToDelete = null;
      this.showDeleteConfirmModal = false;
    },
    /**
     * Deletes the selected image from the car's image list.
     * This method is called when the user confirms deletion in the modal.
     */
    deleteImage() {
      if (!this.imageToDelete) return;

      this.loading = true;
      this.loadingMessage = "Deleting image...";
      const { index, uuid } = this.imageToDelete;

      api.delete(`/api/v1/admin/cars/${this.carUuid}/images/${uuid}`)
          .then(() => {
            this.carData.imageUrls.splice(index, 1);
            this.failModal = {show: true, message: "Image deleted successfully."}; // Using fail modal for info
          })
          .catch(error => {
            const errorMsg = error.response?.data?.message || "Failed to delete image.";
            this.failModal = { show: true, message: errorMsg };
          })
          .finally(() => {
            this.loading = false;
            this.cancelDeleteImage();
          });
    },
    /**
     * Closes the success or failure modal.
     * This method can be called from the close button in the modals.
     */
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
    },
    /**
     * Closes the success modal and refreshes the car details.
     * This method can be called from the success modal's close button.
     */
    closeModalAndRefresh() {
      this.successModal.show = false;
      this.fetchCarDetails(); // Refresh data to show final state
    },
    /**
     * Navigates back to the car management page.
     */
    closeModalAndGoBack() {
      this.closeModal();
      this.goBack();
    },
    /**
     * Navigates back to the car management page.
     * This method can be called from the "Back" button in the form.
     */
    goBack() {
      this.$router.push({ name: 'CarManagement' });
    }
  }
};
</script>

<style scoped>

/* Image Gallery Styles */
.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
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
.delete-image-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}
.no-images-text {
  font-style: italic;
  color: #6c757d;
}
.new-image-previews {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

/* Form Styles */
.form-section-header {
  margin-top: 30px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 5px;
  margin-bottom: 20px;
}
input[type="file"] { display: none; }
.file-input-label {
  display: inline-block;
  padding: 10px 15px;
  cursor: pointer;
  background-color: #28a745; /* Green for uploading */
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}
.form-group-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
}
.error-container { text-align: center; padding: 40px; }
hr { margin: 25px 0; border-top: 1px solid #e9ecef; }
</style>