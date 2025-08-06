<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title class="text-center text-h5">
            내 채팅방 목록
          </v-card-title>
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
                      :disabled="(chat.isGroupChat === 'N')"
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
import axios from "axios";

export default {
  data() {
    return {
      chatList: [],
    };
  },
  async created() {
    // axios는 자동으로 json 객체로 변환해줌
    const res = await axios.get(
      `${process.env.VUE_APP_API_BASE_URL}/chat/my/rooms`
    );
    this.chatList = res.data;
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
  },
};
</script>
