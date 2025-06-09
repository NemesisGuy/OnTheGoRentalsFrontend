<template>
  <div class="carousel-container" v-if="images && images.length > 0">
    <div class="carousel-main-image">
      <!-- The main image display, its src is controlled by currentIndex -->
      <img :src="images[currentIndex]" alt="Carousel Image" class="main-image" @error="onImageError">
    </div>

    <!-- Navigation Buttons: Only show if there's more than one image -->
    <button v-if="images.length > 1" @click="prevImage" class="carousel-nav prev">
      <i class="fas fa-chevron-left"></i>
    </button>
    <button v-if="images.length > 1" @click="nextImage" class="carousel-nav next">
      <i class="fas fa-chevron-right"></i>
    </button>

    <!-- Optional: Thumbnail strip for direct navigation -->
    <div class="carousel-thumbnails" v-if="images.length > 1">
      <img
          v-for="(image, index) in images"
          :key="index"
          :src="image"
          :class="{ 'thumbnail': true, 'active': index === currentIndex }"
          @click="goToImage(index)"
          alt="Thumbnail"
      />
    </div>
  </div>
  <!-- Fallback display if no images are provided to the component -->
  <div v-else class="carousel-container no-image">
    <img :src="fallbackImage" alt="Placeholder Image" class="main-image">
  </div>
</template>

<script>
import defaultPlaceholder from '@/assets/Images/Defaults/default-car-image.png';

/**
 * @file Carousel.vue
 * @description A reusable image carousel component.
 * It displays a series of images with navigation controls (next/previous buttons)
 * and an optional thumbnail strip for direct image selection.
 * It also handles cases where no images are provided or if an image fails to load,
 * by displaying a fallback image.
 * @component Carousel
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'Carousel',
  /**
   * Props accepted by the component.
   * @type {object}
   * @property {Array<string>} images - An array of image URLs to display in the carousel. Required.
   * @property {string} fallbackImage - URL for a fallback image. Displayed if `images` is empty or an image fails to load.
   *                                    Defaults to a predefined placeholder image.
   */
  props: {
    images: {
      type: Array,
      required: true,
      default: () => []
    },
    fallbackImage: {
      type: String,
      default: defaultPlaceholder
    }
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {number} currentIndex - The index of the currently displayed image in the `images` array.
   */
  data() {
    return {
      currentIndex: 0,
    };
  },
  methods: {
    /**
     * Navigates to the next image in the carousel.
     * If the current image is the last one, it loops back to the first image.
     * @returns {void}
     */
    nextImage() {
      if (!this.images || this.images.length === 0) return;
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    },
    /**
     * Navigates to the previous image in the carousel.
     * If the current image is the first one, it loops to the last image.
     * @returns {void}
     */
    prevImage() {
      if (!this.images || this.images.length === 0) return;
      this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    },
    /**
     * Navigates directly to the image at the specified index.
     * Typically called when a thumbnail is clicked.
     * @param {number} index - The index of the image to navigate to.
     * @returns {void}
     */
    goToImage(index) {
      if (!this.images || this.images.length === 0) return;
      if (index >= 0 && index < this.images.length) {
        this.currentIndex = index;
      }
    },
    /**
     * Handles errors when an image fails to load.
     * It sets the source of the failed image element to the `fallbackImage`.
     * @param {Event} event - The error event object from the image element.
     * @returns {void}
     */
    onImageError(event) {
      console.warn("Carousel image failed to load, using fallback:", event.target.src);
      event.target.src = this.fallbackImage;
    }
  }
};
</script>

<style scoped>
.carousel-container {
  position: relative;
  width: 100%;
  max-width: 700px; /* Or adjust as needed */
  margin: auto;
}
.no-image {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
}
.carousel-main-image {
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  position: relative;
  background-color: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}
.main-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* Use 'contain' if you don't want cropping */
}
.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  border: none;
  cursor: pointer;
  padding: 10px 15px;
  border-radius: 50%;
  z-index: 10;
  font-size: 1.2rem;
}
.carousel-nav:hover {
  background-color: rgba(0, 0, 0, 0.7);
}
.prev {
  left: 10px;
}
.next {
  right: 10px;
}
.carousel-thumbnails {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}
.thumbnail {
  width: 80px;
  height: 50px;
  object-fit: cover;
  cursor: pointer;
  border-radius: 4px;
  border: 2px solid transparent;
  transition: border-color 0.3s ease;
}
.thumbnail:hover {
  border-color: #007bff;
}
.thumbnail.active {
  border-color: #0056b3;
  box-shadow: 0 0 8px rgba(0, 86, 179, 0.5);
}
</style>