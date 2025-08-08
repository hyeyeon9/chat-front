<template>
  <v-container fluid class="login-container">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <v-card class="login-card pa-4" elevation="12">
          <v-card-text class="text-center pb-0">
            <v-avatar size="80" color="primary" class="mb-4">
              <v-icon icon="mdi-chat" size="40" color="white" />
            </v-avatar>
            <h1 class="text-h4 font-weight-bold text-grey-darken-3 mb-2">
              CHAT 서비스
            </h1>
            <p class="text-body-1 text-grey-darken-1 mb-6">
              계정에 로그인하여 채팅을 시작하세요
            </p>
          </v-card-text>

          <v-card-text>
            <v-form @submit.prevent="doLogin" ref="loginForm">
              <v-text-field
                label="이메일"
                v-model="email"
                type="email"
                variant="outlined"
                prepend-inner-icon="mdi-email"
                :rules="emailRules"
                required
                class="mb-3"
                density="comfortable"
              />

              <v-text-field
                label="비밀번호"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                :rules="passwordRules"
                required
                class="mb-4"
                density="comfortable"
              />

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                class="mb-4 login-btn"
                :loading="loading"
                :disabled="!isFormValid"
              >
                <v-icon left>mdi-login</v-icon>
                로그인
              </v-btn>
            </v-form>
          </v-card-text>

          <v-card-actions class="justify-center pa-4 pt-0">
            <div class="text-center">
              <v-divider class="my-2" />
              <p class="text-caption text-grey-darken-1">
                계정이 없으신가요?
                <v-btn
                  variant="text"
                  size="small"
                  color="primary"
                  class="pa-0 text-caption"
                  @click="$router.push('/member/create')"
                >
                  회원가입
                </v-btn>
              </p>
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-overlay v-model="loading" class="align-center justify-center">
      <v-progress-circular color="primary" indeterminate size="64" />
      <p class="text-white mt-4">로그인 중...</p>
    </v-overlay>

    <v-snackbar v-model="showError" color="error" timeout="1000" location="top">
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default {
  data() {
    return {
      email: "",
      password: "",
      showPassword: false,
      loading: false,
      showError: false,
      errorMessage: "",
      emailRules: [
        (v) => !!v || "이메일을 입력해주세요",
        (v) => /.+@.+\..+/.test(v) || "올바른 이메일 형식을 입력해주세요",
      ],
      passwordRules: [
        (v) => !!v || "비밀번호를 입력해주세요",
        (v) => (v && v.length >= 4) || "비밀번호는 최소 4자 이상이어야 합니다",
      ],
    };
  },

  computed: {
    isFormValid() {
      return (
        this.email &&
        this.password &&
        /.+@.+\..+/.test(this.email) &&
        this.password.length >= 4
      );
    },
  },

  created() {
    // 이미 로그인된 상태라면 홈으로 리다이렉트
    if (localStorage.getItem("token")) {
      this.$router.push("/");
    }
  },

  methods: {
    async doLogin() {
      if (!this.isFormValid) {
        this.showErrorMessage("입력 정보를 확인해주세요.");
        return;
      }

      this.loading = true;

      try {
        const loginData = {
          email: this.email,
          password: this.password,
        };

        const res = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/member/doLogin`,
          loginData
        );

        const token = res.data.token;
        const role = jwtDecode(token).role;
        const email = jwtDecode(token).sub;

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("email", email);

        // 성공 메시지 표시 후 리다이렉트
        this.$router.push("/");
      } catch (error) {
        console.error("로그인 실패:", error);

        if (error.response?.status === 401) {
          this.showErrorMessage("이메일 또는 비밀번호가 올바르지 않습니다.");
        } else if (error.response?.status === 404) {
          this.showErrorMessage("존재하지 않는 계정입니다.");
        } else {
          this.showErrorMessage(
            "로그인 중 오류가 발생했습니다. 다시 시도해주세요."
          );
        }
      } finally {
        this.loading = false;
      }
    },

    showErrorMessage(message) {
      this.errorMessage = message;
      this.showError = true;
    },
  },
};
</script>

<style scoped>
.login-container {
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  border-radius: 20px !important;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
}

.login-btn {
  border-radius: 12px !important;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
}

.demo-card {
  border-radius: 12px !important;
  border: 1px dashed #90a4ae;
}

/* 입력 필드 포커스 효과 */
.v-text-field--focused {
  transform: scale(1.02);
  transition: transform 0.2s ease;
}

/* 애니메이션 효과 */
.login-card {
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
