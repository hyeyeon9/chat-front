<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title class="text-center text-h5"> 회원목록 </v-card-title>
          <v-text-field
            v-model="search"
            label="회원을 검색하세요."
            class="mx-4 mt-4"
          />
          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>이름</th>
                  <th>email</th>
                  <th>채팅</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in filteredList" :key="member.id">
                  <td>{{ member.id }}</td>
                  <td>{{ member.name }}</td>
                  <td>{{ member.email }}</td>
                  <td>
                    <v-btn color="primary" @click="startChat(member.id)"
                      >채팅하기</v-btn
                    >
                  </td>
                </tr>
              </tbody>
            </v-table>
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
      memberList: [],
      search: "",
    };
  },
  async created() {
    // axios는 자동으로 json 객체로 변환해줌
    const res = await axios.get(
      `${process.env.VUE_APP_API_BASE_URL}/member/list`
    );
    this.memberList = res.data;
  },
  computed: {
    filteredList() {
      return this.memberList.filter((m) => m.name.includes(this.search));
    },
  },
  methods: {
    async startChat(otherMemberId) {
      // 기존의 채팅방이 있으면 그거 return 받고
      // 없으면 새롭게 생성된 roomId return 받기
      const res = await axios.post(
        `${process.env.VUE_APP_API_BASE_URL}/chat/room/private/create?otherMemberId=${otherMemberId}`
      );
      const roomId = res.data;
      this.$router.push(`/chatpage/${roomId}`);
    },
  },
};
</script>
