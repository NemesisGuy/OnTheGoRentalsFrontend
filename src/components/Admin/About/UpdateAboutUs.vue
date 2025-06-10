<template>
  <div class="content-container">
    <div class="card-container">
      <h1>Update About Us</h1>
      <table>
        <thead>
        <tr>
          <th @click="sortAboutUs('id')">ID <i class="fas fa-sort"></i></th>
          <th @click="sortAboutUs('address')">Address <i class="fas fa-sort"></i></th>
          <th @click="sortAboutUs('officeHours')">Office Hours <i class="fas fa-sort"></i></th>
          <th @click="sortAboutUs('email')">Email <i class="fas fa-sort"></i></th>
          <th @click="sortAboutUs('telephone')">Telephone <i class="fas fa-sort"></i></th>
          <th @click="sortAboutUs('whatsapp')">WhatsApp <i class="fas fa-sort"></i></th>
          <th>Edit/Save</th>
          <th>Delete</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="entry in sortedAbout" :key="entry.id"> <!-- Assuming 'id' is the unique key -->
          <td>{{ entry.id }}</td>
          <td>
            <input v-model="entry.address" :disabled="!entry.editMode"/>
          </td>
          <td>
            <input v-model="entry.officeHours" :disabled="!entry.editMode"/>
          </td>
          <td>
            <input v-model="entry.email" :disabled="!entry.editMode"/>
          </td>
          <td>
            <input v-model="entry.telephone" :disabled="!entry.editMode"/>
          </td>
          <td>
            <input v-model="entry.whatsapp" :disabled="!entry.editMode"/> <!-- Ensure 'whatsapp' matches data property -->
          </td>
          <td>
            <button class="btn-small" @click="toggleEditMode(entry)">
              {{ entry.editMode ? 'Save' : 'Edit' }}
            </button>
          </td>
          <td>
            <button class="btn-small" @click="deleteAboutEntry(entry.id)">Delete</button> <!-- Renamed method -->
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
 * @file UpdateAboutUs.vue
 * @description Admin component for listing, inline editing, and deleting "About Us" entries.
 * Displays entries in a sortable table. Allows toggling edit mode for each entry to update its details.
 * @component UpdateAboutUs
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: 'UpdateAboutUs', // Renamed for consistency
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} aboutEntries - Stores the list of "About Us" entries, each augmented with an `editMode` flag.
   * @property {string} sortColumn - The key of the entry property currently used for sorting.
   * @property {string} sortDirection - The current direction of sorting ('asc' or 'desc').
   */
  data() {
    return {
      aboutEntries: [], // Renamed from 'user'
      sortColumn: 'id',    // Default sort column
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
     * Initializes an `editMode: false` property for each fetched entry.
     * Populates the `aboutEntries` data property.
     * @async
     * @returns {void}
     */
    fetchAboutEntries() { // Renamed for clarity
      api.get('/api/admin/aboutUs/all')
          .then((response) => {
            const responseData = response.data?.data || response.data; // Handle potential nesting
            if (Array.isArray(responseData)) {
              this.aboutEntries = responseData.map(entry => ({ ...entry, editMode: false }));
            } else {
              this.aboutEntries = [];
              console.warn("UpdateAboutUs - fetchAboutEntries: API response was not an array. Data:", responseData);
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
    sortAboutUs(column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
    },
    /**
     * Deletes an "About Us" entry by its ID.
     * Makes an API call to delete the entry and then re-fetches the list.
     * @param {string|number} entryId - The ID of the "About Us" entry to delete.
     * @async
     * @returns {void}
     */
    deleteAboutEntry(entryId) { // Renamed for clarity
      // Optional: Add confirmation modal before deleting
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
    /**
     * Toggles the edit mode for an "About Us" entry.
     * If switching from edit mode to view mode (i.e., saving), it calls `updateAboutEntry`.
     * @param {object} entry - The "About Us" entry object whose edit mode is being toggled.
     * @returns {void}
     */
    toggleEditMode(entry) {
      if (entry.editMode) { // If currently in edit mode, means user clicked "Save"
        this.updateAboutEntry(entry);
      }
      entry.editMode = !entry.editMode;
    },
    /**
     * Updates an "About Us" entry with the edited data.
     * Makes a PUT API call with the entry's current data (which includes inline edits).
     * @param {object} entryData - The "About Us" entry object containing the updated data.
     *                             The payload for the API should match the expected DTO.
     * @async
     * @returns {void}
     */
    updateAboutEntry(entryData) { // Renamed for clarity
      // Construct payload based on what the backend expects for an update.
      // Assuming backend expects all fields from the 'entryData' object, excluding 'editMode' or other UI state.
      const payload = {
        address: entryData.address,
        officeHours: entryData.officeHours,
        email: entryData.email,
        telephone: entryData.telephone,
        // Ensure 'whatsapp' or 'whatsApp' matches the DTO expected by the backend.
        // Template uses 'whatsapp', so we use that here.
        whatsapp: entryData.whatsapp
      };
      api.put(`/api/admin/aboutUs/update/${entryData.id}`, payload)
          .then((response) => {
            console.log('About Us details updated successfully:', response);
            // Optionally, update the specific entry in `aboutEntries` with response data
            // or simply rely on a re-fetch if needed, though not strictly necessary if PUT returns updated object.
            // For now, we assume the inline edit is reflected, and editMode is toggled.
            // e.g., Object.assign(entryData, response.data.data);
          })
          .catch((error) => {
            console.error('Error updating About Us details:', error.response || error);
            // Optionally, revert changes or show an error message
            // To revert, you might need to store original state before editing.
            this.fetchAboutEntries(); // Re-fetch to revert or get latest state on error
          });
    },
  },
  computed: {
    /**
     * Returns a sorted version of the `aboutEntries` array based on `sortColumn` and `sortDirection`.
     * @returns {Array<object>} The sorted array of "About Us" entries.
     */
    sortedAbout() {
      // Corrected to use this.aboutEntries
      let sorted = [...this.aboutEntries];
      if (this.sortColumn) {
        sorted.sort((a, b) => {
          let valA = a[this.sortColumn];
          let valB = b[this.sortColumn];

          valA = (valA === null || valA === undefined) ? "" : valA;
          valB = (valB === null || valB === undefined) ? "" : valB;

          let comparison = 0;
          if (typeof valA === 'string' && typeof valB === 'string') {
            comparison = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
          } else if (typeof valA === 'number' && typeof valB === 'number') {
            comparison = valA - valB;
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
</style>
