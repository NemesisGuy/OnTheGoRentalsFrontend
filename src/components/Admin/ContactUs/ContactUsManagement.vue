<template>
  <div class="content-container">
    <div class="content-header">
      <h1><i class="fas fa-envelope"></i> Contact Us Management</h1>
      <div class="search-bar-container">
        <div class="search-bar">
          <div class="search-input">
            <input v-model="searchQuery" placeholder="Search..." type="text" />
            <button class="read-button button" @click="resetSearch">
              <i class="fas fa-search"></i> Reset
            </button>
          </div>
          <router-link class="add-button button" :to="{ name: 'CreateContactUs' }">
            <i class="fas fa-user"></i> Add Query
          </router-link>
        </div>
      </div>
    </div>
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
        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody v-if="!loading">
      <!-- Changed to filteredContacts -->
      <tr v-for="contact in filteredContacts" :key="contact.id">
        <td v-if="!contact.editing">{{ contact.id }}</td>
        <td v-else>
          <input v-model="contact.id" disabled type="text" />
        </td>
        <td v-if="!contact.editing">{{ contact.title }}</td>
        <td v-else>
          <input v-model="contact.title" type="text" required />
        </td>
        <td v-if="!contact.editing">{{ contact.firstName }}</td>
        <td v-else>
          <input v-model="contact.firstName" type="text" required />
        </td>
        <td v-if="!contact.editing">{{ contact.lastName }}</td>
        <td v-else>
          <input v-model="contact.lastName" type="text" required />
        </td>
        <td v-if="!contact.editing">{{ contact.email }}</td>
        <td v-else>
          <input v-model="contact.email" type="email" required />
        </td>
        <td v-if="!contact.editing">{{ contact.subject }}</td>
        <td v-else>
          <input v-model="contact.subject" type="text" required />
        </td>
        <td v-if="!contact.editing">{{ contact.message }}</td>
        <td v-else>
          <textarea v-model="contact.message" required></textarea>
        </td>
        <td>
          <template v-if="!contact.editing">
            <button class="delete-button button" @click="initiateDeleteContact(contact)"> <!-- Changed to initiateDeleteContact -->
              <i class="fas fa-trash"></i> Delete
            </button>
            <button class="update-button button" @click="editContact(contact)">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="read-button button" @click="openContactView(contact.uuid)"> <!-- Use uuid for navigation -->
              <i class="fas fa-eye"></i> Read
            </button>
          </template>
          <template v-else>
            <button class="update-button button" @click="saveContact(contact)">
              <i class="fas fa-save"></i> Save
            </button>
            <button class="delete-button button" @click="cancelEdit(contact)">
              <i class="fas fa-times"></i> Cancel
            </button>
          </template>
        </td>
      </tr>
      </tbody>
    </table>
    <div v-if="loading" class="loading">Loading...</div>
    <loading-modal v-if="loading" :show="loading"></loading-modal>
    <confirmation-modal
        :show="showConfirmationModal"
        @cancel="cancelDeleteContact"
        @confirm="confirmDeleteContact"
    >
      <template v-if="contactToDelete">
        <div>
          <p>Are you sure you want to delete this query?</p>
          <hr>
          <p>ContactUs ID (UUID): {{ contactToDelete.uuid }}</p> <!-- Changed to uuid -->
          <p>Title: {{ contactToDelete.title }}</p>
          <p>First Name: {{ contactToDelete.firstName }}</p>
          <p>Last Name: {{ contactToDelete.lastName }}</p>
          <p>Email: {{ contactToDelete.email }}</p>
          <hr>
          <p><b>Warning!!!</b> This action cannot be undone.</p>
        </div>
      </template>
    </confirmation-modal>
    <SuccessModal
        v-if="successModal.show"
        :message="successModal.message"
        :show="successModal.show"
        @close="closeModal"
    />
    <FailureModal
        v-if="failModal.show"
        :message="failModal.message"
        :show="failModal.show"
        @close="closeModal"
    />
  </div>
</template>

<script>
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
import LoadingModal from "@/components/Main/Modals/LoadingModal.vue";
import SuccessModal from "@/components/Main/Modals/SuccessModal.vue";
import FailureModal from "@/components/Main/Modals/FailureModal.vue";
import api from "@/api";

/**
 * @file ContactUsManagement.vue
 * @description Admin component for managing "Contact Us" submissions.
 * Allows viewing, searching, sorting (by mutation), inline editing, and deleting submissions.
 * @component ContactUsManagement
 */
export default {
  /**
   * The registered name of the component.
   * @type {string}
   */
  name: "ContactUsManagement",
  components: {
    ConfirmationModal,
    LoadingModal,
    SuccessModal,
    FailureModal,
  },
  /**
   * The reactive data properties for the component.
   * @returns {object}
   * @property {Array<object>} contacts - Stores all fetched contact submission objects. Each is augmented with `id` (mapped from `uuid`), `uuid`, and `editing` flag.
   * @property {string} searchQuery - Current search query for filtering submissions.
   * @property {string} sortKey - The key of the submission property currently used for sorting.
   * @property {number} sortOrder - The direction of sorting (1 for 'asc', -1 for 'desc').
   * @property {boolean} loading - Indicates if data is being fetched or an operation is in progress.
   * @property {boolean} showConfirmationModal - Controls visibility of the delete confirmation modal.
   * @property {object|null} contactToDelete - Stores the submission object marked for deletion.
   * @property {Array<object>} originalContacts - Stores a deep copy of fetched contacts to allow reverting edits.
   * @property {object} successModal - Controls the success modal state.
   * @property {object} failModal - Controls the failure modal state.
   */
  data() {
    return {
      contacts: [],
      searchQuery: "",
      sortKey: "id", // Default sort key
      sortOrder: 1,  // Default sort order (asc)
      loading: false,
      showConfirmationModal: false,
      contactToDelete: null,
      originalContacts: [], // To store original state for cancelling edits
      successModal: { show: false, message: "" },
      failModal: { show: false, message: "" },
    };
  },
  computed: {
    /**
     * Filters the `contacts` array based on the `searchQuery`.
     * The search is case-insensitive and checks multiple fields of each submission.
     * (Note: Sorting is applied directly to `this.contacts` by the `sortContacts` method).
     * @returns {Array<object>} Filtered list of contact submissions.
     */
    filteredContacts() { // Renamed from filteredContact
      if (!this.searchQuery) {
        return this.contacts; // Returns the (potentially already sorted) contacts list
      }
      const query = this.searchQuery.toLowerCase().trim();
      return this.contacts.filter((contact) =>
          [
            contact.id?.toString().toLowerCase(), // Mapped from uuid
            contact.title?.toLowerCase(),
            contact.firstName?.toLowerCase(),
            contact.lastName?.toLowerCase(),
            contact.email?.toLowerCase(),
            contact.subject?.toLowerCase(),
            contact.message?.toLowerCase(),
          ].some((field) => field?.includes(query))
      );
    },
  },
  /**
   * Lifecycle hook called when the component is created.
   * Fetches the initial list of contact submissions.
   */
  created() {
    this.getContacts();
  },
  methods: {
    /**
     * Fetches contact submissions from the admin API.
     * Maps `uuid` to `id` for frontend consistency and stores original data for edit cancellation.
     * Handles loading states and displays feedback via modals.
     * @async
     * @returns {void}
     */
    getContacts() {
      this.loading = true;
      // Manual Authorization header removed, relying on `api` instance interceptor.
      api.get("/api/v1/admin/contact-us-submissions")
          .then((response) => {
            const { data, errors, status } = response.data || {};
            console.log("ContactUsManagement - API Response:", response.data);
            if (response.status === 204 || !data || data.length === 0) {
              this.contacts = [];
              this.originalContacts = [];
              this.loading = false;
              // this.showSuccessModal("No contact submissions found at the moment."); // Avoid success for empty
              return;
            }
            if (status !== "success" || (errors && errors.length > 0)) {
              throw new Error(errors?.map(e => e.message).join(", ") || "Invalid API response structure while fetching contact submissions.");
            }
            this.contacts = data.map((contact) => ({
              id: contact.uuid, // Use uuid as the primary key 'id' for consistency in table
              uuid: contact.uuid,
              title: contact.title,
              firstName: contact.firstName,
              lastName: contact.lastName,
              email: contact.email,
              subject: contact.subject,
              message: contact.message,
              editing: false, // Initialize editing state
            }));
            this.originalContacts = JSON.parse(JSON.stringify(this.contacts)); // Deep copy for reverting edits
            console.log("ContactUsManagement - Processed Contacts:", this.contacts);
            this.loading = false;
          })
          .catch((error) => {
            this.loading = false;
            const message = error.response?.status === 401
                ? "Unauthorized. Please log in again."
                : error.message || "Failed to fetch contact submissions. Please try again.";
            this.showFailureModal(message);
            console.error("Error fetching contact submissions:", error.response || error);
            if (error.response?.status === 401) {
              this.$router.push("/login"); // Consider global auth handling
            }
          });
    },
    /**
     * Sorts the `contacts` array directly based on the provided key and current sortOrder.
     * (Note: This method mutates the `contacts` array. The `filteredContacts` computed property
     * will then use this sorted array for filtering.)
     * @param {string} key - The property key to sort by.
     * @returns {void}
     */
    sortContacts(key) { // Renamed from sortContact
      if (this.sortKey === key) {
        this.sortOrder *= -1; // Toggle direction
      } else {
        this.sortKey = key;
        this.sortOrder = 1; // Default to ascending for new column
      }
      this.contacts.sort((a, b) => {
        const valA = a[key] === null || a[key] === undefined ? "" : a[key];
        const valB = b[key] === null || b[key] === undefined ? "" : b[key];
        // localeCompare for robust string sorting, including numbers within strings
        let comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
        return comparison * this.sortOrder;
      });
      // No need to re-assign this.contacts as sort() mutates in place.
      // The filteredContacts computed property will update automatically.
    },
    /**
     * Initiates the deletion process for a contact submission.
     * Sets `contactToDelete` and shows the confirmation modal.
     * @param {object} contact - The contact submission object to delete.
     * @returns {void}
     */
    initiateDeleteContact(contact) { // Renamed from deleteContact to avoid conflict with actual delete
      this.contactToDelete = contact;
      this.showConfirmationModal = true;
    },
    /**
     * Executes the deletion of the contact submission after user confirmation.
     * Makes an API call and refreshes the list on success. Manages loading and feedback.
     * @async
     * @returns {void}
     */
    confirmDeleteContact() {
      if (this.contactToDelete?.uuid) { // Use uuid for API call
        this.loading = true;
        api.delete(`/api/v1/admin/contact-us-submissions/${this.contactToDelete.uuid}`)
            .then((response) => {
              if (response.status === 200 || response.status === 204) {
                this.showSuccessModal("Contact submission deleted successfully.");
                this.getContacts(); // Refresh list
              } else {
                throw new Error(response.data?.errors?.map(e => e.message).join(", ") || `Delete operation responded with status: ${response.status}`);
              }
            })
            .catch((error) => {
              this.showFailureModal(error.response?.data?.message || error.message || "Failed to delete contact submission.");
              console.error("Error deleting contact submission:", error.response || error);
            })
            .finally(() => {
              this.loading = false;
              this.showConfirmationModal = false;
              this.contactToDelete = null;
            });
      } else {
         this.showConfirmationModal = false; // Hide if no valid contact to delete
         this.contactToDelete = null;
      }
    },
    /**
     * Cancels the deletion process and hides the confirmation modal.
     * @returns {void}
     */
    cancelDeleteContact() {
      this.contactToDelete = null;
      this.showConfirmationModal = false;
    },
    /**
     * Enables inline editing mode for a contact submission.
     * @param {object} contact - The contact submission object to edit.
     * @returns {void}
     */
    editContact(contact) {
      // originalContacts stores the state before edit, no need to create another copy here
      contact.editing = true;
    },
    /**
     * Saves the changes made to an inline-edited contact submission.
     * Validates required fields and makes a PUT API call. Refreshes list on success.
     * @param {object} contact - The contact submission object containing updated data.
     * @async
     * @returns {void}
     */
    saveContact(contact) {
      if (!contact.title || !contact.firstName || !contact.lastName || !contact.email || !contact.subject || !contact.message) {
        this.showFailureModal("All fields (Title, First/Last Name, Email, Subject, Message) are required.");
        return;
      }
      this.loading = true;
      const payload = { // Construct payload from the contact object, ensuring it matches DTO
        // Assuming 'id' is not part of update DTO, but 'uuid' is used in URL
        title: contact.title,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
      };
      // Manual Authorization header removed
      api.put(`/api/v1/admin/contact-us-submissions/${contact.uuid}`, payload)
          .then((response) => {
            const { errors, status } = response.data || {};
            if (status === "success") { // Check for actual success status from response body
              this.showSuccessModal("Contact submission updated successfully.");
              contact.editing = false; // Turn off editing mode
              this.getContacts(); // Refresh to get latest data and originalContacts updated
            } else {
              throw new Error(errors?.map(e => e.message).join(", ") || "Failed to update contact submission: Server responded with an error.");
            }
          })
          .catch((error) => {
            this.showFailureModal(error.response?.data?.message || error.message || "Failed to update contact submission.");
            console.error("Error updating contact submission:", error.response || error);
            // Optionally, keep editing mode true or revert if save fails
            // contact.editing = true;
          })
          .finally(() => {
            this.loading = false;
          });
    },
    /**
     * Cancels inline editing mode for a contact submission and reverts changes from `originalContacts`.
     * @param {object} contact - The contact submission object being edited.
     * @returns {void}
     */
    cancelEdit(contact) {
      const original = this.originalContacts.find((c) => c.uuid === contact.uuid); // Match by uuid
      if (original) {
        Object.assign(contact, original); // Revert data
        contact.editing = false; // Ensure editing flag is also reset from original
      } else {
        contact.editing = false; // If somehow not found, just turn off editing
      }
    },
    /**
     * Navigates to a detailed view page for a specific contact submission.
     * @param {string} uuid - The UUID of the submission to view.
     * @returns {void}
     */
    openContactView(uuid) {
      this.$router.push ({name : 'ViewContactUs', params: { uuid: uuid } }); // Ensure route name is correct
    },
    /** Resets the search query, effectively clearing filters. */
    resetSearch() { this.searchQuery = ""; /* filteredContacts will update */ },
    /** Shows success modal with a message. @param {string} message */
    showSuccessModal(message) { this.successModal = { show: true, message }; },
    /** Shows failure modal with a message. @param {string} message */
    showFailureModal(message) { this.failModal = { show: true, message }; },
    /** Closes active success or failure modals. */
    closeModal() { this.successModal.show = false; this.failModal.show = false; },
  },
};
</script>

<style scoped>

</style>