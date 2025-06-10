<template>
  <div class="card-container">
    <h1>List All Details</h1> <!-- Consider more specific title like "Manage About Us Entries" -->
    <table>
      <thead>
      <tr>
        <!-- Assuming 'id' from backend is comparable; if it's UUID, string sort is fine -->
        <th @click="sortAboutUs('id')">ID <i class="fas fa-sort"></i></th>
        <th @click="sortAboutUs('address')">Address <i class="fas fa-sort"></i></th>
        <th @click="sortAboutUs('officeHours')">Office Hours <i class="fas fa-sort"></i></th>
        <th @click="sortAboutUs('email')">Email <i class="fas fa-sort"></i></th>
        <th @click="sortAboutUs('telephone')">Telephone Number <i class="fas fa-sort"></i></th>
        <th @click="sortAboutUs('whatsapp')">WhatsApp Number <i class="fas fa-sort"></i></th>
        <th>Delete</th>
      </tr>
      </thead>
      <tbody>
      <!-- Corrected v-for to use the computed property 'sortedAbout' -->
      <tr v-for="entry in sortedAbout" :key="entry.id"> <!-- Assuming 'id' is the unique key -->
        <td>{{ entry.id }}</td>
        <td>{{ entry.address }}</td>
        <td>{{ entry.officeHours }}</td>
        <td>{{ entry.email }}</td>
        <td>{{ entry.telephone }}</td>
        <td>{{ entry.whatsapp }}</td> <!-- Ensure backend property name matches if it's whatsApp vs whatsapp -->
        <td>
          <button @click="deleteAboutEntry(entry.id)">Delete</button> <!-- Renamed method for clarity -->
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
// import axios from 'axios'; // Unused
import api from "@/api";

/**
 * @file DeleteAboutUs.vue
 * @description Admin component to list and delete "About Us" entries.
 * Displays entries in a sortable table and provides a delete action for each.
 * @component DeleteAboutUs
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'DeleteAboutUs',
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} aboutEntries - Stores the list of "About Us" entries fetched from the API.
   * @property {string} sortColumn - The key of the entry property currently used for sorting.
   * @property {string} sortDirection - The current direction of sorting ('asc' or 'desc').
   */
  data() {
    return {
      aboutEntries: [], // Renamed from 'about'
      sortColumn: 'id',   // Default sort column
      sortDirection: 'asc', // Default sort direction
    };
  },
  /**
   * Lifecycle hook that is called after the component has been mounted.
   * Fetches the initial list of "About Us" entries.
   */
  mounted() {
    this.fetchAboutEntries(); // Renamed for clarity
  },
  methods: {
    /**
     * Fetches the list of "About Us" entries from the API.
     * Populates the `aboutEntries` data property.
     * @async
     * @returns {void}
     */
    fetchAboutEntries() { // Renamed for clarity
      // Corrected api().get to api.get
      api.get('/api/admin/aboutUs/all')
          .then((response) => {
            // Assuming API returns an array directly, or adjust if it's nested (e.g., response.data.data)
            this.aboutEntries = Array.isArray(response.data) ? response.data : (response.data?.data && Array.isArray(response.data.data) ? response.data.data : []);
             if (!Array.isArray(this.aboutEntries) && !(response.data?.data && Array.isArray(response.data.data))) {
               console.warn("DeleteAboutUs - fetchAboutEntries: API response was not in expected array format. Data:", response.data);
            }
          })
          .catch((error) => {
            console.error('Error fetching About Us entries:', error.response || error);
            this.aboutEntries = []; // Clear on error
            // Optionally show a user-facing error message
          });
    },
    /**
     * Sets the sort column and toggles the sort direction for the table.
     * The actual sorting is handled by the `sortedAbout` computed property.
     * @param {string} column - The key of the entry property to sort by.
     * @returns {void}
     */
    sortAboutUs(column) { // This method name matches the template @click handler
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
      // Computed property `sortedAbout` will react to these changes.
    },
    /**
     * Deletes an "About Us" entry by its ID.
     * Makes an API call to delete the entry and then re-fetches the list to update the UI.
     * @param {string|number} entryId - The ID of the "About Us" entry to delete.
     * @async
     * @returns {void}
     */
    deleteAboutEntry(entryId) { // Renamed for clarity
      // Optional: Add a confirmation modal here before deleting.
      api.delete(`/api/admin/aboutUs/delete/${entryId}`)
          .then((response) => {
            console.log('About Us entry deleted successfully:', response);
            this.fetchAboutEntries(); // Refresh the list
            // Optionally show a success message
          })
          .catch((error) => {
            console.error('Error deleting About Us entry:', error.response || error);
            // Optionally show a user-facing error message
          });
    },
  },
  computed: {
    /**
     * Returns a sorted version of the `aboutEntries` array based on `sortColumn` and `sortDirection`.
     * Handles both string and numeric comparisons.
     * @returns {Array<object>} The sorted array of "About Us" entries.
     */
    sortedAbout() {
      let sorted = [...this.aboutEntries];
      if (this.sortColumn) {
        sorted.sort((a, b) => {
          let valA = a[this.sortColumn];
          let valB = b[this.sortColumn];

          // Handle null/undefined gracefully for comparison
          valA = (valA === null || valA === undefined) ? "" : valA;
          valB = (valB === null || valB === undefined) ? "" : valB;

          let comparison = 0;
          // Note: The template uses 'whatsapp' (lowercase w). If data property is 'whatsApp' (camelCase),
          // ensure this.sortColumn matches the actual data property key.
          // For this example, assuming sortColumn string exactly matches data property keys.
          if (typeof valA === 'string' && typeof valB === 'string') {
            comparison = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
          } else if (typeof valA === 'number' && typeof valB === 'number') {
            comparison = valA - valB;
          } else { // Fallback for mixed types or other types - convert to string
            comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
          }
          return this.sortDirection === 'asc' ? comparison : -comparison;
        });
      }
      return sorted;
    },
  },
};
</script>

<style>

</style>
