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
        <th @click="sortContact('id')">ID <i class="fas fa-sort"></i></th>
        <th @click="sortContact('title')">Title <i class="fas fa-sort"></i></th>
        <th @click="sortContact('firstName')">First Name <i class="fas fa-sort"></i></th>
        <th @click="sortContact('lastName')">Last Name <i class="fas fa-sort"></i></th>
        <th @click="sortContact('email')">Email <i class="fas fa-sort"></i></th>
        <th @click="sortContact('subject')">Subject <i class="fas fa-sort"></i></th>
        <th @click="sortContact('message')">Message <i class="fas fa-sort"></i></th>
        <th class="actions-column">Actions</th>
      </tr>
      </thead>
      <tbody v-if="!loading">
      <tr v-for="contact in filteredContact" :key="contact.id">
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
            <button class="delete-button button" @click="deleteContact(contact)">
              <i class="fas fa-trash"></i> Delete
            </button>
            <button class="update-button button" @click="editContact(contact)">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="read-button button" @click="openContactView(contact.id)">
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
          <p>ContactUs ID: {{ contactToDelete.id }}</p>
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

export default {
  name: "ContactUsManagement",
  components: {
    ConfirmationModal,
    LoadingModal,
    SuccessModal,
    FailureModal,
  },
  data() {
    return {
      contacts: [],
      searchQuery: "",
      sortKey: "",
      sortOrder: 1,
      loading: false,
      showConfirmationModal: false,
      contactToDelete: null,
      originalContacts: [],
      successModal: {
        show: false,
        message: "",
      },
      failModal: {
        show: false,
        message: "",
      },
    };
  },
  computed: {
    filteredContact() {
      if (!this.searchQuery) {
        return this.contacts;
      }
      const query = this.searchQuery.toLowerCase();
      return this.contacts.filter((contact) =>
          [
            contact.id.toString(),
            contact.title || "",
            contact.firstName || "",
            contact.lastName || "",
            contact.email || "",
            contact.subject || "",
            contact.message || "",
          ].some((field) => field.toLowerCase().includes(query))
      );
    },
  },
  created() {
    this.getContacts();
  },
  methods: {
    getContacts() {
      this.loading = true;
      api
          .get("/api/v1/admin/contact-us-submissions", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          .then((response) => {
            const { data, errors, status } = response.data || {};
            console.log("API Response:", response.data); // Debug
            if (response.status === 204 || !data || data.length === 0) {
              this.contacts = [];
              this.originalContacts = [];
              this.loading = false;
              this.showSuccessModal("No contact submissions found.");
              return;
            }
            if (status !== "success" || (errors && errors.length > 0)) {
              throw new Error(errors?.join(", ") || "Invalid API response");
            }
            // Map uuid to id for frontend compatibility
            this.contacts = data.map((contact) => ({
              id: contact.uuid, // Map uuid to id
              uuid: contact.uuid, // Retain uuid for API calls
              title: contact.title,
              firstName: contact.firstName,
              lastName: contact.lastName,
              email: contact.email,
              subject: contact.subject,
              message: contact.message,
              editing: false,
            }));
            this.originalContacts = JSON.parse(JSON.stringify(this.contacts));
            console.log("Processed Contacts:", this.contacts); // Debug
            this.loading = false;
          })
          .catch((error) => {
            this.loading = false;
            const message = error.response?.status === 401
                ? "Unauthorized access. Please log in again."
                : error.message || "Failed to fetch contact submissions.";
            this.showFailureModal(message);
            console.error("Error fetching contacts:", error);
            if (error.response?.status === 401) {
              this.$router.push("/login");
            }
          });
    },
    sortContact(key) {
      if (this.sortKey === key) {
        this.sortOrder *= -1;
      } else {
        this.sortKey = key;
        this.sortOrder = 1;
      }
      this.contacts.sort((a, b) => {
        const aValue = a[key] || "";
        const bValue = b[key] || "";
        return aValue.toString().localeCompare(bValue.toString(), undefined, {
          numeric: true,
        }) * this.sortOrder;
      });
    },
    deleteContact(contact) {
      this.contactToDelete = contact;
      this.showConfirmationModal = true;
    },
    confirmDeleteContact() {
      if (this.contactToDelete) {
        this.loading = true;
        api
            .delete(`/api/v1/admin/contact-us-submissions/${this.contactToDelete.uuid}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            })
            .then((response) => {
              const { errors, status } = response.data || {};
              if (status !== "success" || (errors && errors.length > 0)) {
                throw new Error(errors?.join(", ") || "Failed to delete contact");
              }
              this.showSuccessModal("Contact submission deleted successfully.");
              this.getContacts();
            })
            .catch((error) => {
              this.showFailureModal(error.message || "Failed to delete contact submission.");
              console.error("Error deleting contact:", error);
            })
            .finally(() => {
              this.loading = false;
              this.showConfirmationModal = false;
              this.contactToDelete = null;
            });
      }
    },
    cancelDeleteContact() {
      this.contactToDelete = null;
      this.showConfirmationModal = false;
    },
    editContact(contact) {
      contact.editing = true;
    },
    saveContact(contact) {
      if (!contact.title || !contact.firstName || !contact.lastName || !contact.email || !contact.subject || !contact.message) {
        this.showFailureModal("All fields are required.");
        return;
      }
      this.loading = true;
      const payload = {
        uuid: contact.uuid,
        title: contact.title,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
      };
      api
          .put(`/api/v1/admin/contact-us-submissions/${contact.uuid}`, payload, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          .then((response) => {
            const { errors, status } = response.data || {};
            if (status !== "success" || (errors && errors.length > 0)) {
              throw new Error(errors?.join(", ") || "Failed to update contact");
            }
            this.showSuccessModal("Contact submission updated successfully.");
            contact.editing = false;
            this.getContacts();
          })
          .catch((error) => {
            this.showFailureModal(error.message || "Failed to update contact submission.");
            console.error("Error updating contact:", error);
          })
          .finally(() => {
            this.loading = false;
          });
    },
    cancelEdit(contact) {
      const original = this.originalContacts.find((c) => c.id === contact.id);
      if (original) {
        Object.assign(contact, { ...original, editing: false });
      }
    },
    openContactView(uuid) {
/*
      this.$router.push(`/admin/contact-us-submissions/read/${contactUuid}`);
      {
        path: 'contactUs/read/:uuid',
        name: 'ViewContactUs',
        components: {
            adminContent: ViewContactUs
        },
    },
      this.$router.push({ name: 'ViewCar', params: { uuid: uuid } });
*/
      this.$router.push ({name : 'ViewContactUs', params: { uuid: uuid } });
    },
    resetSearch() {
      this.searchQuery = "";
    },
    showSuccessModal(message) {
      this.successModal = { show: true, message };
    },
    showFailureModal(message) {
      this.failModal = { show: true, message };
    },
    closeModal() {
      this.successModal.show = false;
      this.failModal.show = false;
    },
  },
};
</script>

<style scoped>

</style>