<template>
  <div class="content-container">
    <div class="card-container">
      <h1>List of Queries</h1>
      <table>
        <thead>
        <tr>
          <!-- Updated method call to sortContacts -->
          <th @click="sortContacts('id')">ID <i class="fas fa-sort"></i></th>
          <th @click="sortContacts('title')">Title <i class="fas fa-sort"></i></th>
          <th @click="sortContacts('firstName')">First Name <i class="fas fa-sort"></i></th>
          <th @click="sortContacts('lastName')">Last Name <i class="fas fa-sort"></i></th>
          <th @click="sortContacts('email')">Email <i class="fas fa-sort"></i></th>
          <th @click="sortContacts('subject')">Subject <i class="fas fa-sort"></i></th>
          <th @click="sortContacts('message')">Message <i class="fas fa-sort"></i></th>
          <th>Delete</th>
        </tr>
        </thead>
        <tbody>
        <!-- Updated v-for to use sortedContacts -->
        <tr v-for="contactEntry in sortedContacts" :key="contactEntry.id">
          <td>{{ contactEntry.id }}</td>
          <td>{{ contactEntry.title }}</td>
          <td>{{ contactEntry.firstName }}</td>
          <td>{{ contactEntry.lastName }}</td>
          <td>{{ contactEntry.email }}</td>
          <td>{{ contactEntry.subject }}</td>
          <td>{{ contactEntry.message }}</td>
          <td>
            <!-- Updated method call to deleteContactSubmission -->
            <button @click="deleteContactSubmission(contactEntry.id)">Delete</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
// import axios from 'axios'; // Unused
import api from "@/api";

/**
 * @file DeleteContactUs.vue
 * @description Admin component for listing and deleting "Contact Us" submissions.
 * Displays submissions in a sortable table and provides a delete action for each.
 * (Note: User feedback for delete success/failure is currently limited to console logs.)
 * @component AdminDeleteContactUs
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'AdminDeleteContactUs', // Renamed for consistency
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} contacts - Stores the list of contact submission objects.
   * @property {string} sortColumn - The key of the submission property currently used for sorting.
   * @property {string} sortDirection - The current direction of sorting ('asc' or 'desc').
   */
  data() {
    return {
      contacts: [], // Renamed from 'contact'
      sortColumn: 'id',   // Default sort column
      sortDirection: 'asc', // Default sort direction
    };
  },
  /**
   * Lifecycle hook that is called after the component has been mounted.
   * Fetches the initial list of contact submissions.
   */
  mounted() {
    this.fetchContacts(); // Renamed method
  },
  methods: {
    /**
     * Fetches contact submissions from the '/api/admin/contactUs/all' API endpoint.
     * (Note: Ensure this endpoint aligns with backend admin functionalities).
     * Populates the `contacts` data property.
     * @async
     * @returns {void}
     */
    fetchContacts() { // Renamed method
      api.get('/api/admin/contactUs/all') // Assuming this is an admin endpoint for all submissions
          .then((response) => {
            const responseData = response.data?.data || response.data;
            this.contacts = Array.isArray(responseData) ? responseData : [];
            if (!Array.isArray(responseData)) {
               console.warn("AdminDeleteContactUs - fetchContacts: API response was not in expected array format. Data:", responseData);
            }
          })
          .catch((error) => {
            console.error('Error fetching contact submissions:', error.response || error.message || error);
            this.contacts = []; // Clear on error
            // Optionally show a user-facing error message (e.g., via a modal)
          });
    },
    /**
     * Sets the sort column and toggles the sort direction for the submissions table.
     * @param {string} column - The key of the submission property to sort by.
     * @returns {void}
     */
    sortContacts(column) { // Renamed method
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
      // The `sortedContacts` computed property will react to these changes.
    },
    /**
     * Deletes a contact submission by its ID using an admin API endpoint.
     * Re-fetches the submissions list on successful deletion.
     * (Note: No user confirmation modal before deletion in this version.)
     * @param {string|number} submissionId - The ID of the contact submission to delete.
     * @async
     * @returns {void}
     */
    deleteContactSubmission(submissionId) { // Renamed method
      // Optional: Implement a confirmation modal before deleting.
      api.delete(`/api/admin/contactUs/delete/${submissionId}`) // Assuming this is the correct admin delete endpoint
          .then((response) => {
            console.log('Contact submission deleted successfully:', response);
            this.fetchContacts(); // Refresh the list
            // Optionally, show a success message (e.g., via a modal or toast)
          })
          .catch((error) => {
            console.error('Error deleting contact submission:', error.response || error.message || error);
            // Optionally, show a user-facing error message
          });
    },
  },
  computed: {
    /**
     * Returns a sorted version of the `contacts` array based on `sortColumn` and `sortDirection`.
     * Handles string and numeric comparisons robustly.
     * @returns {Array<object>} The sorted array of contact submissions.
     */
    sortedContacts() { // Renamed computed property
      let sorted = [...this.contacts]; // Use renamed 'contacts'
      if (this.sortColumn) {
        sorted.sort((a, b) => {
          let valA = a[this.sortColumn];
          let valB = b[this.sortColumn];

          valA = (valA === null || valA === undefined) ? "" : valA;
          valB = (valB === null || valB === undefined) ? "" : valB;

          let comparison = 0;
          // Basic numeric check for 'id' or other numeric fields
          if (this.sortColumn === 'id' || (!isNaN(Number(valA)) && !isNaN(Number(valB)) && typeof valA !== 'string' && typeof valB !== 'string')) {
            comparison = Number(valA) - Number(valB);
          } else { // Default to locale-aware string comparison
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
