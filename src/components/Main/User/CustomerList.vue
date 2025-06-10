<template>
  <div class="content-container">
    <div class="card-container">
      <h1>Customers</h1>
      <table>
        <thead>
        <tr>
          <th @click="sortColumn('name')">Name</th>
          <th @click="sortColumn('contactInfo')">Contact Info</th>
          <th @click="sortColumn('borrowingHistory')">Borrowing History</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="customer in sortedCustomers" :key="customer.customerId">
          <td>{{ customer.name }}</td>
          <td>{{ customer.contactInfo }}</td>
          <td>{{ customer.borrowingHistory }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
// import axios from 'axios'; // Unused, api instance is used
import api from "@/api";

/**
 * @file CustomerList.vue
 * @description This component displays a sortable list of customers.
 * It fetches customer data from an API and presents it in a table format,
 * allowing users to sort the list by name, contact information, or borrowing history.
 * @component CustomerList
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'CustomerList',
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} customers - An array to store the fetched customer objects.
   * @property {string} sortColumn - The key of the customer object property currently used for sorting. Defaults to 'name'.
   * @property {string} sortDirection - The current direction of sorting ('asc' or 'desc'). Defaults to 'asc'.
   */
  data() {
    return {
      customers: [],
      sortColumn: 'name',
      sortDirection: 'asc'
    };
  },
  /**
   * Lifecycle hook that is called after the component has been mounted to the DOM.
   * It triggers the fetching of customer data.
   */
  mounted() {
    this.fetchCustomers();
  },
  /**
   * Computed properties for the component.
   * @type {object}
   * @property {Array<object>} sortedCustomers - Returns a sorted version of the `customers` array
   *                                            based on the current `sortColumn` and `sortDirection`.
   *                                            Sorts strings case-insensitively.
   */
  computed: {
    sortedCustomers() {
      let sorted = [...this.customers];

      sorted.sort((a, b) => {
        // Ensure properties exist and default to empty string if not, then convert to string for robust comparison
        const fieldA = (a[this.sortColumn] === null || a[this.sortColumn] === undefined) ? "" : String(a[this.sortColumn]).toLowerCase();
        const fieldB = (b[this.sortColumn] === null || b[this.sortColumn] === undefined) ? "" : String(b[this.sortColumn]).toLowerCase();

        let comparison = 0;
        if (fieldA > fieldB) {
          comparison = 1;
        } else if (fieldA < fieldB) {
          comparison = -1;
        }

        return this.sortDirection === 'asc' ? comparison : -comparison;
      });

      return sorted;
    }
  },
  // Watchers for sortColumn and sortDirection are removed as they are redundant.
  // The computed property `sortedCustomers` will automatically re-evaluate when these data properties change.
  methods: {
    /**
     * Fetches the list of customers from the backend API.
     * Updates the `customers` data property upon successful retrieval.
     * Logs an error to the console and clears customers list if the fetch fails.
     * @async
     * @returns {void}
     */
    fetchCustomers() {
      api
          .get('/api/customers') // Assuming this is the correct endpoint for fetching customers
          .then(response => {
            // Ensure response.data is an array; adjust if API returns object with a customers array
            if (Array.isArray(response.data)) {
              this.customers = response.data;
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
              this.customers = response.data.data;
            } else {
              console.warn("fetchCustomers: API response was not in expected array format. Data:", response.data);
              this.customers = []; // Default to empty array if structure is not as expected
            }
          })
          .catch(error => {
            console.error('Error fetching customers:', error.response || error);
            this.customers = []; // Clear customers on error
            // Optionally, show a user-facing error message here
          });
    },
    /**
     * Updates the sort column and toggles the sort direction.
     * Called when a table header is clicked.
     * @param {string} column - The key of the customer object property to sort by.
     * @returns {void}
     */
    sortColumn(column) {
      if (column === this.sortColumn) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
    },
    // The sortCustomers() method was removed as it was empty and redundant.
  }
};
</script>

<style scoped>
/* Add custom styles for the component */
</style>
