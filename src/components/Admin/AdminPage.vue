<!--AdimnPage.vue-->
<!--This is the Admin dashboard-->
<template>

  <div class="content-container">
    <AdminSidebar />
    <div class="main-content">
      <div class="content">
        <div class="admin-content-container"> <!-- Content area that gets updated based on the current route -->
          <router-view name="adminContent"></router-view>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import AdminSidebar from "./AdminSidebar.vue"
import Cars from "@/components/Admin/Car/Cars.vue";
import CarList  from "@/components/Car/CarList.vue";
import CarCreate  from "/src/components/Admin/Car/CreateCar.vue"
import CarSelect  from "/src/components/Admin/Car/SelectCar.vue";
import CarUpdate  from "/src/components/Admin/Car/UpdateCar.vue";
import CarDelete  from "/src/components/Admin/Car/DeleteCar.vue";


export default {
  components: {
    AdminSidebar,Cars, CarList, CarCreate, CarSelect, CarUpdate, CarDelete,
  },
};
</script>

<style scoped>
/* Add custom styles for the component */
</style>
