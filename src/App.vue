<template>
  <v-app>
    <HeaderComponent />
    <v-main>
      <router-view />
      <v-snackbar
        v-model="toast.show"
        :color="toast.color"
        timeout="1000"
        location="top right"
        
   
      >
        {{ toast.message }}
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script>
import HeaderComponent from "./components/HeaderComponent.vue";
import { toast } from "./utils/toast";

export default {
  name: "App",
  components: {
    HeaderComponent,
  },
  data() {
    return {
      toast,
    };
  },
};
</script>

<style></style>
