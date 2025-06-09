<template>
  <div class="content-container">
    <div>
      <h1>{{ car.name }}</h1>
      <p>{{ car.description }}</p>
      <p>Price: {{ car.pricegroup }}</p>

    </div>
  </div>

</template>

<script>
// import Carousel from '...'; // Carousel component should be imported if used.
                               // Assuming it's not used based on current template and lack of import.

/**
 * @file CarDetail.vue
 * @description This component is intended to display detailed information about a specific car.
 * Currently, it displays hardcoded sample car data. In a production scenario,
 * this data would typically be fetched from an API based on a route parameter (e.g., car ID).
 * @component CarDetail
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'CarDetail',
  /**
   * Components registered for use within this component.
   * @type {object}
   * @property {Component} Carousel - (Note: Registered but not imported or used in the current template. Consider removing if not needed.)
   */
  components: {
    // Carousel // Removed as it's not imported and not used in the template.
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {object} car - Object containing details of the car.
   * @property {number} car.id - The ID of the car.
   * @property {string} car.name - The name of the car (e.g., 'Toyota Corolla').
   * @property {number} car.price - The numeric price of the car.
   * @property {string} car.pricegroup - The price group or category of the car (e.g., 'Premium Sedan').
   * @property {string} car.description - A description of the car.
   * @property {Array<string>} car.images - An array of URLs for car images. (Note: Defined in data but not currently used in the template.)
   */
  data() {
    return {
      car: {
        id: 1,
        name: 'Toyota Corolla',
        price: 2500, // This is 'price'
        pricegroup: 'Premium Sedan', // Added for consistency with template usage
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        images: [
          'https://via.placeholder.com/800x400/FF5733/FFFFFF?text=Image+1',
          'https://via.placeholder.com/800x400/333333/FFFFFF?text=Image+2',
          'https://via.placeholder.com/800x400/7B2FBE/FFFFFF?text=Image+3',
          'https://via.placeholder.com/800x400/0099CC/FFFFFF?text=Image+4'
        ]
      }
    }
  }
};
</script>
