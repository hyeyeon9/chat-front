import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "@/router/index.js";
import axios from "axios";

const app = createApp(App);

// axios요청이 있을때 여기서 요청을 인터셉트(가로채기)해서 토큰을 가져오도록
// 요청을 보낼때 헤더에 토큰을 포함해서 서버에 보낼 수 있도록
axios.interceptors.request.use(
    // config: 요청 설정 객체 
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
        // Authorization라는 이름으로 헤더에 토큰을 추가
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  // error : 요청 보내기 전에 에러 발생 시
  (error) => {
    // 인터셉터를 무시하고 사용자의 본 요청인 화면으로 라우팅
    return Promise.reject(error);
  }
);

app.use(router);
app.use(vuetify);
app.mount("#app");
