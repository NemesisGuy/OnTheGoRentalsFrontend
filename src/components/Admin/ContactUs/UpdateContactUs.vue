<template>
  <div class="content-container">
    <div class="card-container">
      <h1>Manage Contact Submissions</h1> <!-- More descriptive title -->
      <table>
        <thead>
        <tr>
          <th @click="sortContacts('id')">ID <i class="fas fa-sort"></i></th>
          <th @click="sortContacts('title')">Title <i class="fas fa-sort"></i></th>
          <th @click="sortContacts('firstName')">First Name <i class="fas fa-sort"></i></th>
          <th @click="sortContacts('lastName')">Last Name <i class="fas fa-sort"></i></th>
          <th @click="sortContacts('email')">Email <i class="fas fa-sort"></i></th>
          <th @click="sortContacts('subject')">Subject <i class="fas fa-sort"></i></th>
          <th @click="sortContacts('message')">Message <i class="fas fa-sort"></i></th>
          <th>Edit/Save</th>
          <th>Delete</th>
        </tr>
        </thead>
        <tbody>
        <!-- Corrected v-for and method calls -->
        <tr v-for="entry in sortedContacts" :key="entry.id">
          <td>{{ entry.id }}</td>
          <td>
            <input v-model="entry.title" :disabled="!entry.editMode"/>
          </td>
          <td>
            <input v-model="entry.firstName" :disabled="!entry.editMode"/>
          </td>
          <td>
            <input v-model="entry.lastName" :disabled="!entry.editMode"/>
          </td>
          <td>
            <input v-model="entry.email" :disabled="!entry.editMode"/>
          </td>
          <td>
            <input v-model="entry.subject" :disabled="!entry.editMode"/>
          </td>
          <td>
            <!-- Use textarea for message for better multiline editing -->
            <textarea v-model="entry.message" :disabled="!entry.editMode" rows="3"></textarea>
          </td>
          <td>
            <button class="btn-small" @click="toggleEditMode(entry)">
              {{ entry.editMode ? 'Save' : 'Edit' }}
            </button>
          </td>
          <td>
            <!-- Added Delete button -->
            <button class="btn-small delete-button" @click="deleteContactSubmission(entry.id)">Delete</button>
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
 * @file UpdateContactUs.vue
 * @description Admin component for listing, inline editing, and deleting "Contact Us" submissions.
 * Displays submissions in a sortable table. Allows toggling edit mode for each entry to update its details.
 * (Note: User feedback for operations like delete/update is currently limited to console logs. Consider adding modals.)
 * @component AdminUpdateContactUs
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'AdminUpdateContactUs', // Renamed for consistency
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} contacts - Stores the list of contact submissions, each augmented with an `editMode` flag.
   * @property {string} sortColumn - The key of the submission property currently used for sorting.
   * @property {string} sortDirection - The current direction of sorting ('asc' or 'desc').
   */
  data() {
    return {
      contacts: [], // Renamed from 'contact'
      sortColumn: 'id',    // Default sort column
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
     * Initializes an `editMode: false` property for each fetched submission.
     * Populates the `contacts` data property.
     * @async
     * @returns {void}
     */
    fetchContacts() { // Renamed method
      api.get('/api/admin/contactUs/all') // Assuming this is an admin endpoint
          .then((response) => {
            const responseData = response.data?.data || response.data;
            if (Array.isArray(responseData)) {
              this.contacts = responseData.map(c => ({ ...c, id: c.uuid, uuid: c.uuid, editMode: false })); // Map uuid to id and add editMode
            } else {
              this.contacts = [];
              console.warn("AdminUpdateContactUs - fetchContacts: API response was not in expected array format.", responseData);
            }
          })
          .catch((error) => {
            console.error('Error fetching contact submissions:', error.response || error.message || error);
            this.contacts = []; // Clear on error
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
    },
    /**
     * Deletes a contact submission by its ID (which is the UUID).
     * Makes an API call and re-fetches the list on success.
     * (Note: No user confirmation modal before deletion in this version.)
     * @param {string} submissionUuid - The UUID of the contact submission to delete. (Note: template passes entry.id which is mapped uuid)
     * @async
     * @returns {void}
     */
    deleteContactSubmission(submissionUuid) { // Renamed method, param is uuid (mapped from id)
      // Optional: Add confirmation modal here.
      api.delete(`/api/admin/contactUs/delete/${submissionUuid}`)
          .then((response) => {
            console.log('Contact submission deleted successfully:', response);
            this.fetchContacts(); // Refresh list
          })
          .catch((error) => {
            console.error('Error deleting contact submission:', error.response || error.message || error);
          });
    },
    /**
     * Toggles the edit mode for a contact submission.
     * If saving (i.e., `editMode` was true), it calls `updateContactSubmission`.
     * @param {object} contactEntry - The submission object whose edit mode is being toggled.
     * @returns {void}
     */
    toggleEditMode(contactEntry) {
      if (contactEntry.editMode) {
        this.updateContactSubmission(contactEntry);
      }
      contactEntry.editMode = !contactEntry.editMode;
    },
    /**
     * Updates a contact submission with the edited data.
     * Makes a PUT API call. The payload excludes UI-specific properties like `editMode` and `id`.
     * Uses `uuid` for the API path.
     * @param {object} contactEntry - The submission object containing updated data.
     * @async
     * @returns {void}
     */
    updateContactSubmission(contactEntry) { // Renamed method
      const payload = {
        title: contactEntry.title,
        firstName: contactEntry.firstName,
        lastName: contactEntry.lastName,
        email: contactEntry.email,
        subject: contactEntry.subject,
        message: contactEntry.message,
      };
      api.put(`/api/admin/contactUs/update/${contactEntry.uuid}`, payload) // Use contactEntry.uuid
          .then((response) => {
            console.log('Contact submission updated successfully:', response);
            // Optionally update entry with response.data.data if backend returns updated object
            // For now, editMode is toggled by toggleEditMode. A fetchContacts() could also be called for consistency.
          })
          .catch((error) => {
            console.error('Error updating contact submission:', error.response || error.message || error);
            // Optionally, revert changes or show error. For now, re-fetch to get consistent state.
            this.fetchContacts();
          });
    },
  },
  computed: {
    /**
     * Returns a sorted version of the `contacts` array based on `sortColumn` and `sortDirection`.
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
          // Ensure 'id' (mapped from uuid) is treated as string for sorting, or handle numeric if it's truly numeric
          if (this.sortColumn === 'id' || (!isNaN(Number(valA)) && !isNaN(Number(valB)) && typeof valA !== 'string' && typeof valB !== 'string')) {
            comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
          } else {
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
/* Styles from DeleteContactUs.vue may be relevant here if not global */
/* Consider scoping styles if they are component-specific */
.btn-small { /* Example if not globally defined */
  padding: 5px 10px;
  font-size: 0.8em;
  margin-right: 5px;
}
.delete-button { /* Example if not globally defined */
  background-color: #dc3545;
  color: white;
}
</style>
