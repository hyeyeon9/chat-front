<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="text-h5 text-center"> 채팅</v-card-title>
          <v-card-text>
            <div class="chat-box">
              <div
                v-for="(msg, index) in messages"
                :key="index"
                :class="[
                  `chat-message`,
                  msg.senderEmail === this.senderEmail ? 'sent' : 'received',
                ]"
              >
                <strong> {{ msg.senderEmail }} : </strong> {{ msg.message }}
              </div>
            </div>
            <!-- 메시지 입력란 -->
            <v-text-field
              v-model="newMessage"
              label="메시지 입력"
              @keyup.enter="sendMessage"
            />
            <v-btn color="primary" block @click="sendMessage">전송</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";
import SockJS from "sockjs-client";
import Stomp from "webstomp-client";

export default {
  data() {
    return {
      messages: [],
      newMessage: "",
      stompClient: null,
      token: "",
      senderEmail: null,
      roomId: null,
    };
  },
  // 화면이 실행되자마자 실행되는 훅 함수 => created
  async created() {
    this.senderEmail = localStorage.getItem("email");
    this.roomId = this.$route.params.roomId; // url로 넘어오는 파람 변수를 받을 것

    // 이전 메시지 불러오기
    const res = await axios.get(
      `${process.env.VUE_APP_API_BASE_URL}/chat/history/${this.roomId}`
    );

    this.messages = res.data;
    this.connectWebSocket();
  },
  // 사용자가 현재 라우트에서 다른 라우트로 이동하려고 할 때 호출되는 훅함수
  beforeRouteLeave(to, from, next) {
    this.disconnectWebSockrt();
    next();
  },
  // 화면이 사라지기 직전에 = beforeUnMounted
  // 화면을 완전히 꺼버렸을때
  beforeUnmount() {
    this.disconnectWebSockrt();
  },
  methods: {
    connectWebSocket() {
      // 새로고침 등.. stompClient객체가 있는데 다시 만들지 않도록 아래 조건문 하나 추가
      if (this.stompClient && this.stompClient.connected) return;

      // sockjs는 웹소켓을 내장한 향상된 js 라이브러리이다. http 엔드포인트 사용
      const sockJs = new SockJS(`${process.env.VUE_APP_API_BASE_URL}/connect`);
      this.stompClient = Stomp.over(sockJs); // Stomp 객체 만듦
      this.token = localStorage.getItem("token");
      this.stompClient.connect(
        {
          Authorization: `Bearer ${this.token}`,
        }, // 헤더값이 들어감
        () => {
          this.stompClient.subscribe(
            `/topic/${this.roomId}`,
            (message) => {
              const parseMessage = JSON.parse(message.body);

              this.messages.push(parseMessage); // 메시지를 넣음
              this.scrollToBottom(); // 메시지 올때마다 같이 내려가게
            },
            {
              Authorization: `Bearer ${this.token}`,
            }
          );
        }
      );
    },

    sendMessage() {
      if (this.newMessage.trim() === "") return;
      const message = {
        senderEmail: this.senderEmail,
        message: this.newMessage,
      };
      this.stompClient.send(`/publish/${this.roomId}`, JSON.stringify(message));

      this.newMessage = ""; // 보낸 이후 필드값 초기화
    },

    // 스크롤 아래로 내리기
    scrollToBottom() {
      this.$nextTick(() => {
        const chatBox = this.$el.querySelector(".chat-box");
        chatBox.scrollTop = chatBox.scrollHeight;
      });
    },

    disconnectWebSockrt() {
      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.unsubscribe(`/topic/${this.roomId}`);
        this.stompClient.disconnect();
      }
    },
  },
};
</script>

<style>
.chat-box {
  height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  margin-bottom: 10px;
}

.chat-message {
  margin-bottom: 10px;
}

.sent {
  text-align: right;
}

.received {
  text-align: left;
}
</style>
