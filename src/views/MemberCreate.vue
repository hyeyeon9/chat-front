<template>
  <v-container fluid class="signup-container">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <v-card class="signup-card pa-4" elevation="12">
          <v-card-text class="text-center pb-0">
            <v-avatar size="80" color="primary" class="mb-4">
              <v-icon icon="mdi-account-plus" size="40" color="white" />
            </v-avatar>
            <h1 class="text-h4 font-weight-bold text-grey-darken-3 mb-2">
              회원가입
            </h1>
            <p class="text-body-1 text-grey-darken-1 mb-6">
              새 계정을 만들어 채팅을 시작하세요
            </p>
          </v-card-text>

          <v-card-text>
            <v-form @submit.prevent="memberCreate" ref="signupForm">
              <v-text-field
                label="이름"
                v-model="name"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                :rules="nameRules"
                required
                class="mb-3"
                density="comfortable"
                counter="20"
              />

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
                class="mb-3"
                density="comfortable"
                counter="10"
              />

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                class="mb-4 signup-btn"
                :loading="loading"
                :disabled="!isFormValid"
              >
                <v-icon left>mdi-account-plus</v-icon>
                회원가입
              </v-btn>
            </v-form>
          </v-card-text>

          <v-card-actions class="justify-center pa-4 pt-0">
            <div class="text-center">
              <p class="text-caption text-grey-darken-1">
                이미 계정이 있으신가요?
                <v-btn
                  variant="text"
                  size="small"
                  color="primary"
                  class="pa-0 text-caption"
                  @click="$router.push('/login')"
                >
                  로그인
                </v-btn>
              </p>
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-overlay v-model="loading" class="align-center justify-center">
      <v-progress-circular color="primary" indeterminate size="64" />
      <p class="text-white mt-4">계정 생성 중...</p>
    </v-overlay>

    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="1000"
      location="top"
    >
      {{ successMessage }}
    </v-snackbar>

    <v-snackbar v-model="showError" color="error" timeout="1000" location="top">
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      showPassword: false,
      showConfirmPassword: false,
      agreeTerms: false,
      loading: false,
      showSuccess: false,
      showError: false,
      successMessage: "",
      errorMessage: "",
      nameRules: [
        (v) => !!v || "이름을 입력해주세요",
        (v) => (v && v.length >= 2) || "이름은 최소 2자 이상이어야 합니다",
        (v) => (v && v.length <= 20) || "이름은 20자 이하여야 합니다",
        (v) =>
          /^[가-힣a-zA-Z\s]+$/.test(v) || "이름은 한글, 영문만 입력 가능합니다",
      ],
      emailRules: [
        (v) => !!v || "이메일을 입력해주세요",
        (v) => /.+@.+\..+/.test(v) || "올바른 이메일 형식을 입력해주세요",
      ],
      passwordRules: [
        (v) => !!v || "비밀번호를 입력해주세요",
        (v) => (v && v.length >= 4) || "비밀번호는 최소 4자 이상이어야 합니다",
        (v) => (v && v.length <= 10) || "비밀번호는 10자 이하여야 합니다",
      ],
    };
  },

  computed: {
    isFormValid() {
      return (
        this.name &&
        this.email &&
        this.password &&
        this.name.length >= 2 &&
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
    async memberCreate() {
      if (!this.isFormValid) {
        this.showErrorMessage("입력 정보를 확인해주세요.");
        return;
      }

      this.loading = true;

      try {
        const data = {
          name: this.name.trim(),
          email: this.email.trim().toLowerCase(),
          password: this.password,
        };

        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/member/create`,
          data
        );

        this.showSuccessMessage(
          "회원가입이 완료되었습니다! 로그인 페이지로 이동합니다."
        );

        // 2초 후 로그인 페이지로 이동
        setTimeout(() => {
          this.$router.push("/login");
        }, 2000);
      } catch (error) {
        console.error("회원가입 실패:", error);

        if (error.response?.status === 409) {
          this.showErrorMessage("이미 존재하는 이메일입니다.");
        } else if (error.response?.status === 400) {
          this.showErrorMessage("입력 정보가 올바르지 않습니다.");
        } else {
          this.showErrorMessage(
            "회원가입 중 오류가 발생했습니다. 다시 시도해주세요."
          );
        }
      } finally {
        this.loading = false;
      }
    },

    showSuccessMessage(message) {
      this.successMessage = message;
      this.showSuccess = true;
    },

    showErrorMessage(message) {
      this.errorMessage = message;
      this.showError = true;
    },
  },
};
</script>

<style scoped>
.signup-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.signup-card {
  border-radius: 20px !important;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
}

.signup-btn {
  border-radius: 12px !important;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
}

.benefits-card {
  border-radius: 12px !important;
  border: 1px dashed #4caf50;
}

/* 입력 필드 포커스 효과 */
.v-text-field--focused {
  transform: scale(1.02);
  transition: transform 0.2s ease;
}

/* 애니메이션 효과 */
.signup-card {
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

/* 체크박스 커스텀 스타일 */
.v-checkbox .v-selection-control__input {
  border-radius: 4px;
}
</style>
