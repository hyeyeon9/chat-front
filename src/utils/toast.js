import { reactive } from "vue";

export const toast = reactive({
  show: false,
  message: "",
  color: "success", //  'error', 'warning', etc.
});

export function showToast(message, color = "success") {
  toast.message = message;
  toast.color = color;
  toast.show = true;
}
