<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <!-- <v-card-title class="text-center text-h5"> 마이페이지 </v-card-title> -->
          <div class="d-flex align-center justify-center px-4 pb-4">
            <div class="d-flex flex-column">
              <v-avatar
                size="200"
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
              <v-text-field
                label="닉네임"
                v-model="nickname"
                @keyup.enter="updateNickname"
                class="mt-4"
              ></v-text-field>
              <v-btn @click="updateNickname" class="secondary"
                >닉네임 수정</v-btn
              >
            </div>
          </div>

          <v-card-title class="text-center text-h5 border-t mt-4 pt-4">
            내 채팅방 목록</v-card-title
          >
          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>채팅방 이름</th>
                  <th>읽지 않은 메시지</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="chat in chatList" :key="chat.roomId">
                  <td>{{ chat.roomName }}</td>
                  <td>{{ chat.unReadCount }}</td>
                  <td>
                    <v-btn color="primary" @click="enterChatRoom(chat.roomId)"
                      >입장</v-btn
                    >
                    <v-btn
                      color="secondary"
                      :disabled="chat.isGroupChat === 'N'"
                      @click="leaveChatRoom(chat.roomId)"
                      >나가기</v-btn
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
import { showToast } from "@/utils/toast";
import axios from "axios";

export default {
  data() {
    return {
      chatList: [],
      profileImageUrl: "",
      nickname: "",
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

    console.log(member);

    this.nickname = member.data.name;
    this.profileImageUrl = member.data.profileImageUrl;
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
          {
            params: { name: this.nickname },
          }
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
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("이미지");
        console.log(res);
        this.profileImageUrl = res.data.profileImageUrl;
        showToast("프로필 수정 완료", "success");
      } catch (error) {
        showToast("프로필 수정 실패", "error");
      }
    },
  },
};
</script>

<style>
.profile-avatar {
  position: relative;
  cursor: pointer;
  overflow: hidden; /* 이거 없으면 overlay가 삐져나올 수 있음 */
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
  background-color: #00000066;
  opacity: 0;
  transition: 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  color: white;
  font-size: xx-large;
}

.profile-avatar:hover .overlay {
  opacity: 1;
}
</style>
