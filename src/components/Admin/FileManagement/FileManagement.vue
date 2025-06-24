<template>
  <div class="content-container">
    <div class="content-header">
      <h1><i class="fas fa-tools"></i> Data Integrity & File Management</h1>
      <p>Tools for finding and fixing orphaned files and broken database links.</p>
    </div>

    <div class="tool-grid">
      <!-- Orphaned Files Card -->
      <div class="tool-card">
        <div class="card-title">
          <h3><i class="fas fa-file-excel"></i> Orphaned Files</h3>
          <p>Files on disk that are not linked to any database record. These can be safely deleted.</p>
        </div>
        <button @click="findOrphanedFiles" :disabled="isLoading" class="button action-button scan-button">
          <i class="fas fa-search"></i> Scan for Orphaned Files
        </button>
        <div v-if="orphanedFiles" class="results-container">
          <h4>Scan Results:</h4>
          <div v-for="(files, folder) in orphanedFiles" :key="folder">
            <div class="folder-header">
              <h5>Folder: `{{ folder }}` ({{ files.length }} found)</h5>
              <button v-if="files.length > 0" @click="confirmDeleteAllOrphaned(folder, files)" class="button delete-button small" :disabled="isDeleting">
                <i class="fas fa-trash-alt"></i> Delete All
              </button>
            </div>
            <!-- Displaying images instead of just filenames -->
            <div v-if="files.length > 0" class="image-grid">
              <div v-for="file in files" :key="file" class="image-card">
                <img :src="getOrphanedFileUrl(folder, file)" alt="Orphaned file" class="thumbnail-preview" @error="onImageError">
                <span class="filename" :title="file">{{ file }}</span>
                <button @click="confirmDeleteSingleFile(folder, file)" class="button delete-button x-small" :disabled="isDeleting">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <p v-else class="no-items">No orphaned files found in this folder.</p>
          </div>
        </div>
      </div>

      <!-- Broken Image Links Card -->
      <div class="tool-card">
        <div class="card-title">
          <h3><i class="fas fa-link-slash"></i> Broken Image Links</h3>
          <p>Database records that point to image files that do not exist.</p>
        </div>
        <button @click="findBrokenImageLinks" :disabled="isLoading" class="button action-button scan-button">
          <i class="fas fa-search"></i> Scan for Broken Links
        </button>
        <div v-if="brokenImageLinks" class="results-container">
          <h4>Scan Results: ({{ brokenImageLinks.length }} found)</h4>
          <ul v-if="brokenImageLinks.length > 0" class="link-list">
            <li v-for="image in brokenImageLinks" :key="image.uuid">
              <div class="link-info">
                <i class="fas fa-image-slash broken-icon"></i>
                <div>
                  <span><strong>Car:</strong> {{ image.car?.make }} {{ image.car?.model }}</span>
                  <small>Missing File: {{ image.fileName }}</small>
                </div>
              </div>
              <div class="link-actions">
                <input type="file" :id="'upload-' + image.uuid" @change="uploadReplacement($event, image.car.uuid)" style="display: none;" accept="image/jpeg, image/png, image/gif"/>
                <label :for="'upload-' + image.uuid" class="button action-button x-small">
                  <i class="fas fa-upload"></i> Upload Replacement
                </label>
                <button @click="confirmDeleteImageRecord(image)" class="button delete-button x-small">
                  <i class="fas fa-trash"></i> Delete Record
                </button>
              </div>
            </li>
          </ul>
          <p v-else class="no-items">No broken image links found.</p>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <LoadingModal :show="isLoading || isDeleting" :message="loadingMessage"/>
    <SuccessModal :show="successModal.show" :message="successModal.message" @close="successModal.show = false"/>
    <FailureModal :show="failModal.show" :message="failModal.message" @close="failModal.show = false"/>
    <ConfirmationModal :show="confirmation.show" :title="confirmation.title" @cancel="cancelConfirmation" @confirm="executeConfirmedAction">
      <p v-html="confirmation.message"></p>
    </ConfirmationModal>
  </div>
</template>

<script>
import api from '@/api';
import LoadingModal from '@/components/Main/Modals/LoadingModal.vue';
import SuccessModal from '@/components/Main/Modals/SuccessModal.vue';
import FailureModal from '@/components/Main/Modals/FailureModal.vue';
import ConfirmationModal from "@/components/Main/Modals/ConfirmationModal.vue";
import defaultImage from '@/assets/Images/Defaults/default-car-image.png';

export default {
  name: 'FileManagement',
  components: { ConfirmationModal, LoadingModal, SuccessModal, FailureModal },
  data() {
    return {
      isLoading: false,
      isDeleting: false,
      loadingMessage: 'Scanning...',
      orphanedFiles: null,
      brokenImageLinks: null,
      successModal: { show: false, message: '' },
      failModal: { show: false, message: '' },
      confirmation: { show: false, title: '', message: '', action: null },
    };
  },
  methods: {
    async findOrphanedFiles() {
      this.isLoading = true;
      this.loadingMessage = "Scanning for orphaned files...";
      this.brokenImageLinks = null;
      try {
        const response = await api.get('/api/v1/admin/data-tools/files/orphaned');
        this.orphanedFiles = response.data.data;
      } catch (error) {
        this.failModal = { show: true, message: 'Failed to scan for orphaned files.' };
      } finally {
        this.isLoading = false;
      }
    },
    async findBrokenImageLinks() {
      this.isLoading = true;
      this.loadingMessage = "Scanning for broken links...";
      this.orphanedFiles = null;
      try {
        const response = await api.get('/api/v1/admin/data-tools/associations/broken-image-links');
        this.brokenImageLinks = response.data.data;
      } catch (error) {
        this.failModal = { show: true, message: 'Failed to scan for broken image links.' };
      } finally {
        this.isLoading = false;
      }
    },
    getOrphanedFileUrl(folder, filename) {
      // Use the existing public file endpoint to create a preview URL
      return `${api.defaults.baseURL}/api/v1/files/${folder}/${filename}`;
    },
    onImageError(event) {
      event.target.src = defaultImage; // Fallback for broken image previews
    },
    confirmDeleteSingleFile(folder, filename) {
      this.confirmation = {
        show: true,
        title: 'Confirm File Deletion',
        message: `Are you sure you want to permanently delete the file <strong>"${filename}"</strong>? This cannot be undone.`,
        action: () => this.executeDeleteFile(folder, filename)
      };
    },
    confirmDeleteAllOrphaned(folder, files) {
      this.confirmation = {
        show: true,
        title: 'Confirm Bulk Deletion',
        message: `Are you sure you want to delete all <strong>${files.length}</strong> orphaned files in the "<strong>${folder}</strong>" folder? This is permanent.`,
        action: () => this.executeDeleteAllOrphaned(folder, files)
      };
    },
    confirmDeleteImageRecord(image) {
      this.confirmation = {
        show: true,
        title: 'Confirm DB Record Deletion',
        message: `This will delete the database entry for the missing file <strong>"${image.fileName}"</strong> from the car <strong>${image.car?.make} ${image.car?.model}</strong>.`,
        action: () => this.executeDeleteImageRecord(image.uuid)
      };
    },
    cancelConfirmation() {
      this.confirmation.show = false;
    },
    executeConfirmedAction() {
      if (typeof this.confirmation.action === 'function') {
        this.confirmation.action();
      }
      this.cancelConfirmation();
    },
    async executeDeleteFile(folder, filename) {
      this.isDeleting = true;
      try {
        const response = await api.delete(`/api/v1/admin/data-tools/files/${folder}/${filename}`);
        this.successModal = { show: true, message: response.data.data };
        await this.findOrphanedFiles();
      } catch (error) {
        this.failModal = { show: true, message: `Failed to delete "${filename}".` };
      } finally {
        this.isDeleting = false;
      }
    },
    async executeDeleteAllOrphaned(folder, files) {
      this.isDeleting = true;
      this.loadingMessage = `Deleting ${files.length} files...`;
      const deletePromises = files.map(file => api.delete(`/api/v1/admin/data-tools/files/${folder}/${file}`));
      const results = await Promise.allSettled(deletePromises);
      const successfulDeletes = results.filter(r => r.status === 'fulfilled').length;
      if (successfulDeletes > 0) {
        this.successModal = { show: true, message: `Successfully deleted ${successfulDeletes} orphaned files from "${folder}".`};
      }
      const failedDeletes = results.length - successfulDeletes;
      if (failedDeletes > 0) {
        this.failModal = { show: true, message: `Failed to delete ${failedDeletes} files. Please check server logs.`};
      }
      await this.findOrphanedFiles();
      this.isDeleting = false;
    },
    async executeDeleteImageRecord(imageUuid) {
      this.isDeleting = true;
      try {
        const response = await api.delete(`/api/v1/admin/data-tools/associations/car-image/${imageUuid}`);
        this.successModal = { show: true, message: response.data.data };
        await this.findBrokenImageLinks();
      } catch (error) {
        this.failModal = { show: true, message: 'Failed to delete image record.' };
      } finally {
        this.isDeleting = false;
      }
    },
    async uploadReplacement(event, carUuid) {
      const file = event.target.files[0];
      if (!file) return;

      this.isLoading = true;
      this.loadingMessage = "Uploading replacement image...";
      const formData = new FormData();
      formData.append('images', file); // Use the key your backend expects

      try {
        // This should be the endpoint for adding a new image to an existing car
        await api.post(`/api/v1/admin/cars/${carUuid}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        this.successModal = { show: true, message: "Replacement image uploaded. The broken link will be removed on the next scan." };
        // We don't refresh the list here, as the user might want to fix several before re-scanning.
      } catch (error) {
        this.failModal = { show: true, message: 'Failed to upload replacement image.' };
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.tool-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
.tool-card { color: var(--color-text-black); background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.08); }
.card-title { margin-bottom: 20px; }
.tool-card h3 { margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.tool-card p { color: var(--color-text-black); font-size: 0.9rem; }
.scan-button { width: 100%; margin-bottom: 15px; }
.results-container { margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; }
ul { list-style: none; padding: 0; max-height: 400px; overflow-y: auto; border-radius: 4px; }
li { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #f0f0f0; }
li:last-child { border-bottom: none; }
.button.small { padding: 4px 8px; font-size: 0.8rem; flex-shrink: 0; }
.button.x-small { padding: 3px 6px; font-size: 0.75rem; }
.refresh-button{ padding: 4px 8px; font-size: 0.8rem; background-color: #007bff; color: var(--color-text-black); border: none; border-radius: 4px; cursor: pointer; }
.folder-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.folder-header h5 { margin: 0; }
.no-items { color: #888; font-style: italic; text-align: center; padding: 20px; }

/* Image Grid for Orphaned Files */
.image-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 15px; }
.image-card { display: flex; flex-direction: column; align-items: center; border: 1px solid #eee; padding: 10px; border-radius: 4px; }
.thumbnail-preview { width: 100%; height: 80px; object-fit: cover; border-radius: 4px; margin-bottom: 5px; }
.filename { font-family: 'Courier New', Courier, monospace; font-size: 0.75rem; word-break: break-all; text-align: center; margin-bottom: 5px; }

/* Broken Link List Styles */
.link-list { border: 1px solid #eee; }
.link-info { display: flex; align-items: center; gap: 10px; }
.link-info small { font-size: 0.8em; color: #888; display: block; font-family: 'Courier New', Courier, monospace; }
.broken-icon { font-size: 1.5rem; color: #dc3545; }
.link-actions { display: flex; flex-direction: column; gap: 5px; }
</style>