<template>
  <v-app-bar app dark>
    <v-container>
      <v-row align="center">
        <v-col class="d-flex justify-start">
          <v-btn :to="{ path: '/member/list' }"> 회원목록 </v-btn>
          <v-btn :to="{ path: '/groupchatting/list' }"> 채팅방목록 </v-btn>
        </v-col>
        <v-col class="text-center">
          <v-btn :to="{ path: '/' }"> chat 서비스 </v-btn>
        </v-col>
        <v-col class="d-flex justify-end">
          <v-btn v-if="isLogin" :to="{ path: '/my/chat/page' }">
            MychatPage
          </v-btn>
          <v-btn v-if="!isLogin" :to="{ path: '/member/create' }">
            회원가입
          </v-btn>
          <v-btn v-if="!isLogin" :to="{ path: '/login' }"> 로그인 </v-btn>
          <v-btn v-if="isLogin" @click="doLogout"> 로그아웃 </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script>
export default {
  // 전역변수 정의
  data() {
    return {
      isLogin: false,
    };
  },
  // 화면이 열릴때 바로 시작할 함수 (훅 함수들)
  created() {
    // 토큰이 있는지 확인하고, 있으면 로그인 처리하겠다.
    const token = localStorage.getItem("token");
    if (token) {
      this.isLogin = true;
    }
  },

  // 내가 정의한 메서드들은 methods 안에 정의
  methods: {
    doLogout() {
      localStorage.clear();
      window.location.reload();
    },
  },
};
</script>
