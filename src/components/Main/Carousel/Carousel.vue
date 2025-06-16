<template>
  <div
      class="carousel-container"
      v-if="images && images.length > 0"
      @mouseenter="stopAutoPlay"
      @mouseleave="startAutoPlay"
  >
    <div class="carousel-main-image">
      <transition name="fade" mode="out-in">
        <img :key="currentIndex" :src="images[currentIndex]" alt="Carousel Image" class="main-image" @error="onImageError">
      </transition>
    </div>

    <!-- Navigation Buttons -->
    <button v-if="images.length > 1" @click="prevImage" class="carousel-nav prev" aria-label="Previous Image">
      <i class="fas fa-chevron-left"></i>
    </button>
    <button v-if="images.length > 1" @click="nextImage" class="carousel-nav next" aria-label="Next Image">
      <i class="fas fa-chevron-right"></i>
    </button>

    <!-- Thumbnail strip -->
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

  <div v-else class="carousel-container no-image">
    <img :src="fallbackImage" alt="Placeholder Image" class="main-image">
  </div>
</template>

<script>
import defaultPlaceholder from '@/assets/Images/Defaults/default-car-image.png';

export default {
  name: 'Carousel',
  props: {
    images: { type: Array, required: true, default: () => [] },
    fallbackImage: { type: String, default: defaultPlaceholder },
    autoPlay: { type: Boolean, default: true },
    interval: { type: Number, default: 4000 }
  },
  data() {
    return {
      currentIndex: 0,
      timer: null,
      visibilityChangeHandler: null
    };
  },
  // *** THE FIX IS HERE ***
  watch: {
    /**
     * Watch for changes on the 'images' prop. This is crucial for when
     * the images are loaded asynchronously by the parent component.
     */
    images(newImages, oldImages) {
      // If we are receiving a populated list of images for the first time...
      if (newImages.length > 0 && oldImages.length === 0) {
        console.log("Carousel: Images have arrived. Resetting and starting autoplay.");
        // Reset the state and start the autoplay logic from scratch.
        this.currentIndex = 0;
        this.resetAutoPlay();
      }
    }
  },
  mounted() {
    // We still run this in mounted() for cases where images are available immediately.
    this.startAutoPlay();
    this.setupVisibilityListener();
  },
  beforeUnmount() {
    this.stopAutoPlay();
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
    }
  },
  methods: {
    setupVisibilityListener() {
      this.visibilityChangeHandler = () => {
        if (document.visibilityState === 'visible') {
          this.startAutoPlay();
        } else {
          this.stopAutoPlay();
        }
      };
      document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    },
    startAutoPlay() {
      // Only start if autoPlay is enabled, there's more than one image,
      // a timer isn't already running, AND the tab is visible.
      if (this.autoPlay && this.images.length > 1 && !this.timer && document.visibilityState === 'visible') {
        this.timer = setInterval(this.nextImage, this.interval);
      }
    },
    stopAutoPlay() {
      clearInterval(this.timer);
      this.timer = null;
    },
    resetAutoPlay() {
      this.stopAutoPlay();
      this.startAutoPlay();
    },
    nextImage() {
      if (!this.images || this.images.length === 0) return;
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    },
    prevImage() {
      if (!this.images || this.images.length === 0) return;
      this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
      this.resetAutoPlay();
    },
    goToImage(index) {
      if (index >= 0 && index < this.images.length) {
        this.currentIndex = index;
        this.resetAutoPlay();
      }
    },
    onImageError(event) {
      console.warn("Carousel image failed to load, using fallback:", event.target.src);
      event.target.src = this.fallbackImage;
    }
  }
};
</script>

<style scoped>
/* All styles remain the same */
.carousel-container { position: relative; width: 100%; max-width: 700px; margin: auto; overflow: hidden; }
.no-image { border: 2px dashed #e0e0e0; border-radius: 8px; }
.carousel-main-image { width: 100%; padding-top: 56.25%; position: relative; background-color: #f8f9fa; border-radius: 8px; }
.main-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
.carousel-nav { position: absolute; top: 50%; transform: translateY(calc(50% + 25px)); background-color: rgba(0, 0, 0, 0.4); color: white; border: none; cursor: pointer; padding: 10px; width: 40px; height: 40px; border-radius: 50%; z-index: 10; display: flex; align-items: center; justify-content: center; transition: background-color 0.3s ease; }
.carousel-nav:hover { background-color: rgba(0, 0, 0, 0.7); }
.prev { left: 15px; }
.next { right: 15px; }
.carousel-thumbnails { display: flex; justify-content: center; gap: 10px; margin: 15px; }
.thumbnail { width: 80px; height: 50px; object-fit: cover; cursor: pointer; border-radius: 4px; border: 2px solid #ddd; transition: all 0.3s ease; opacity: 0.7; }
.thumbnail:hover { opacity: 1; border-color: #007bff; }
.thumbnail.active { opacity: 1; border-color: #0056b3; transform: scale(1.05); box-shadow: 0 0 8px rgba(0, 86, 179, 0.5); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease-in-out; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>