<template>
  <v-container class="py-6">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="mx-auto my-8 pa-4 profile-card" elevation="8">
          <v-card-text class="text-center">
            <div class="profile-avatar-wrapper">
              <v-avatar
                size="160"
                class="profile-avatar"
                @click="triggerFileInput"
              >
                <img
                  :src="profileImageUrl || '/default.png'"
                  alt="프로필 사진"
                />
                <div class="overlay">📸</div>
              </v-avatar>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="updateProfileImg"
                style="display: none"
              />
            </div>

            <v-text-field
              label="닉네임"
              v-model="nickname"
              @keyup.enter="updateNickname"
              variant="outlined"
              density="compact"
              class="mt-6"
              append-inner-icon="mdi-pencil"
              @click:append-inner="updateNickname"
              hide-details
            ></v-text-field>
            <v-btn
              @click="updateNickname"
              color="primary"
              variant="flat"
              class="mt-3"
              block
            >
              닉네임 수정
            </v-btn>
          </v-card-text>

          <v-divider class="my-4"></v-divider>

          <v-card-title
            class="text-center text-h6 font-weight-bold text-grey-darken-3"
          >
            내 채팅방 목록
          </v-card-title>

          <v-card-text class="pa-0">
            <v-list lines="one" class="chat-room-list">
              <div
                v-if="chatList.length === 0"
                class="empty-chat-list text-center py-8"
              >
                <v-icon size="64" color="grey-lighten-1"
                  >mdi-forum-remove-outline</v-icon
                >
                <p class="text-subtitle-1 text-grey-darken-1 mt-4">
                  아직 참여 중인 채팅방이 없습니다.
                </p>
                <p class="text-body-2 text-grey-lighten-1">
                  새로운 채팅방을 만들어보세요!
                </p>
              </div>

              <v-list-item
                v-else
                v-for="chat in chatList"
                :key="chat.roomId"
                class="chat-list-item"
                @click="enterChatRoom(chat.roomId)"
                link
              >
                <template v-slot:prepend>
                  <v-avatar color="grey-lighten-3" size="48">
                    <v-icon color="grey-darken-1">mdi-forum</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-medium text-body-1">{{
                  chat.roomName
                }}</v-list-item-title>

                <template v-slot:append>
                  <v-chip
                    v-if="chat.unReadCount > 0"
                    size="small"
                    class="chip font-weight-bold mr-4"
                  >
                    <span class="unReadCount">{{ chat.unReadCount }} </span>
                  </v-chip>

                  <div class="d-flex">
                    <v-btn
                      color="primary"
                      class="me-2"
                      @click.stop="enterChatRoom(chat.roomId)"
                      label="채팅방 입장"
                      >입장</v-btn
                    >
                    <v-btn
                      color="error"
                      :disabled="chat.isGroupChat === 'N'"
                      @click.stop="leaveChatRoom(chat.roomId)"
                      label="채팅방 나가기"
                      >나가기</v-btn
                    >
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { connectSSE, disconnectSSE } from "@/utils/sse";
import { showToast } from "@/utils/toast";
import axios from "axios";
export default {
  data() {
    return {
      chatList: [],
      profileImageUrl: "",
      nickname: "",
      unreadCounts: {},
    };
  },
  async created() {
    // axios는 자동으로 json 객체로 변환해줌
    const res = await axios.get(
      `${process.env.VUE_APP_API_BASE_URL}/chat/my/rooms`
    );
    this.chatList = res.data;
    const member = await axios.get(
      `${process.env.VUE_APP_API_BASE_URL}/member/me`
    );
    this.nickname = member.data.name;
    this.profileImageUrl = member.data.profileImageUrl;

    connectSSE((data) => {
      // 예: { roomId: 5, unReadCount: 2 }
      const { roomId, unReadCount } = data;
      const targetChat = this.chatList.find((chat) => chat.roomId === roomId);
      if (targetChat) {
        targetChat.unReadCount = unReadCount;
      }
    });
  },
  beforeUnmount() {
    disconnectSSE();
  },
  methods: {
    // 채팅방 입장하기
    enterChatRoom(roomId) {
      this.$router.push(`/chatpage/${roomId}`);
    },
    // 채팅방 나가기
    async leaveChatRoom(roomId) {
      await axios.delete(
        `${process.env.VUE_APP_API_BASE_URL}/chat/room/group/${roomId}/leave`
      );
      // 방근 나간 채팅방 ID는 기존 채팅방 목록에서 삭제
      this.chatList = this.chatList.filter((chat) => chat.roomId !== roomId);
    },
    // 닉네임 수정하기
    async updateNickname() {
      try {
        await axios.patch(
          `${process.env.VUE_APP_API_BASE_URL}/member/name`,
          null,
          { params: { name: this.nickname } }
        );
        showToast("닉네임 수정 완료", "success");
      } catch (error) {
        showToast("닉네임 수정 실패", "error");
      }
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    // 프로필 사진 수정하기
    async updateProfileImg(event) {
      const file = event.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("image", file);
      try {
        const res = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/member/profile`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        this.profileImageUrl = res.data.profileImageUrl;
        showToast("프로필 수정 완료", "success");
      } catch (error) {
        showToast("프로필 수정 실패", "error");
      }
    },
  },
};
</script>

<style scoped>
.profile-card {
  border-radius: 16px;
  background: #ffffff;
}

.profile-avatar-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.profile-avatar img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  color: white;
  font-size: xx-large;
}

.profile-avatar-wrapper:hover .overlay {
  opacity: 1;
}

.chat-room-list {
  background: none; /* Remove default list background */
}

.chat-list-item {
  border-bottom: 1px solid #eee;
  margin-bottom: 0px;
  transition: background-color 0.2s ease;
}

.chat-list-item:last-child {
  border-bottom: none;
}

.chat-list-item:hover {
  background-color: #f5f5f5;
}

.empty-chat-list {
  color: #757575;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin: 16px;
  padding: 24px;
  border: 1px dashed #e0e0e0;
}

/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.chip {
  background-color: rgb(224, 14, 14);
  border-radius: 50%;
  color: white;
}
</style>
