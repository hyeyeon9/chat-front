<template>
  <v-container class="py-6">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="mx-auto member-list-card" elevation="8">
          <v-card-title
            class="text-center text-h5 font-weight-bold text-grey-darken-3 py-6"
          >
            회원목록
          </v-card-title>

          <v-divider></v-divider>
          <v-card-text class="pb-0">
            <v-text-field
              v-model="search"
              label="회원을 검색하세요"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              class="search-field"
            />
          </v-card-text>

          <v-card-text class="pa-0">
            <v-list lines="two" class="member-list">
              <div
                v-if="filteredList.length === 0"
                class="empty-member-list text-center py-8"
              >
                <v-icon size="64" color="grey-lighten-1">
                  {{ search ? "mdi-account-search" : "mdi-account-off" }}
                </v-icon>
                <p class="text-subtitle-1 text-grey-darken-1 mt-4">
                  {{
                    search ? "검색 결과가 없습니다." : "등록된 회원이 없습니다."
                  }}
                </p>
                <p class="text-body-2 text-grey-lighten-1" v-if="search">
                  다른 검색어를 시도해보세요.
                </p>
              </div>
              <v-list-item
                v-else
                v-for="member in filteredList"
                :key="member.id"
                class="member-list-item"
              >
                <template v-slot:prepend>
                  <v-avatar size="45">
                    <img
                      :src="member.profileImageUrl || '/default.png'"
                      alt="프로필 사진"
                    />
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-medium text-body-1">
                  {{ member.name }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-grey-darken-1">
                  <v-icon size="16" class="mr-1">mdi-email</v-icon>
                  {{ member.email }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-btn
                    color="primary"
                    @click="startChat(member.id)"
                    class="chat-button"
                  >
                    채팅하기
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>

          <v-card-actions
            class="justify-center pa-4"
            v-if="memberList.length > 0"
          >
            <v-chip
              color="grey-lighten-1"
              size="small"
              class="font-weight-medium"
            >
              총 {{ filteredList.length }}명의 회원
            </v-chip>
          </v-card-actions>
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

    console.log(res.data);
  },

  computed: {
    filteredList() {
      if (!this.search) {
        return this.memberList;
      }
      return this.memberList.filter(
        (m) =>
          m.name.toLowerCase().includes(this.search.toLowerCase()) ||
          m.email.toLowerCase().includes(this.search.toLowerCase())
      );
    },
  },

  methods: {
    async startChat(otherMemberId) {
      try {
        // 기존의 채팅방이 있으면 그거 return 받고
        // 없으면 새롭게 생성된 roomId return 받기
        const res = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/chat/room/private/create?otherMemberId=${otherMemberId}`
        );
        const roomId = res.data;
        this.$router.push(`/chatpage/${roomId}`);
      } catch (error) {
        console.error("채팅방 생성 실패:", error);
        // 에러 처리 로직 추가 가능
      }
    },
  },
};
</script>

<style scoped>
.member-list-card {
  border-radius: 16px;
  background: #ffffff;
  max-height: 80vh;
  overflow: hidden;
}

.search-field {
  margin: 16px;
}

.member-list {
  background: none;
  max-height: 50vh;
  overflow-y: auto;
}

/* Custom scrollbar for member list */
.member-list::-webkit-scrollbar {
  width: 6px;
}

.member-list::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 10px;
}

.member-list::-webkit-scrollbar-thumb {
  background: #bdbdbd;
  border-radius: 10px;
}

.member-list::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}

.member-list-item {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
  padding: 12px 16px;
}

.member-list-item:last-child {
  border-bottom: none;
}

.member-list-item:hover {
  background-color: #f8f9fa;
}

.chat-button {
  min-width: 100px;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
}

.empty-member-list {
  color: #757575;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin: 16px;
  padding: 32px 16px;
  border: 1px dashed #e0e0e0;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .member-list-card {
    margin: 8px;
    border-radius: 12px;
  }

  .chat-button {
    min-width: 80px;
    font-size: 0.875rem;
  }

  .member-list-item {
    padding: 8px 12px;
  }

  .search-field {
    margin: 12px;
  }
}
</style>
