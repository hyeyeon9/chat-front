<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="4" md="6">
        <v-card>
          <v-card-title class="text-h5 text-center"> 회원가입 </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="memberCreate">
              <!-- v-model로 지정하면 아래 data의 변수와 자동 매핑돼서 변경되면 자동으로 변경된다.  -->
              <v-text-field label="이름" v-model="name" required>
              </v-text-field>

              <v-text-field
                label="이메일"
                v-model="email"
                type="email"
                required
              >
              </v-text-field>

              <v-text-field
                label="비밀번호"
                v-model="password"
                type="password"
                required
              ></v-text-field>
              <!-- primary는  Vuetify 기본 테마 색상중 하나-->
              <v-btn type="submit" color="primary" block>등록 </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
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
    };
  },
  created() {},
  methods: {
    async memberCreate() {
      const data = {
        name: this.name,
        email: this.email,
        password: this.password,
      };
      await axios.post(
        `${process.env.VUE_APP_API_BASE_URL}/member/create`,
        data
      );
      this.$router.push("/");
    },
  },
};
</script>
