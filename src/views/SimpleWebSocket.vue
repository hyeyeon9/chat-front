<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="text-h5 text-center"> 채팅</v-card-title>
          <v-card-text>
            <div class="chat-box">
              <div v-for="(msg, index) in messages" :key="index">
                {{ msg }}
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
export default {
  data() {
    return {
      ws: null,
      messages: [],
      newMessage: "",
    };
  },
  // 화면이 실행되자마자 실행되는 훅 함수 => created
  created() {
    this.connectWebSocket();
  },
  // 화면이 사라지기 직전에 = beforeUnMounted
  beforeUnmount() {
    this.disconnectWebSockrt();
  },
  methods: {
    connectWebSocket() {
      // websocket 연결 라이브러리
      this.ws = new WebSocket("ws://localhost:8080/connect"); // ws에 연결 객체가 담김

      // 연결 성공하면
      this.ws.onopen = () => {
        console.log("successfully connected!!");
      };

      // 메시지가 들어오면
      this.ws.onmessage = (message) => {
        this.messages.push(message.data);
        this.scrollToBottom();
      };

      // 연결 끊기면
      this.ws.onclose = () => {
        console.log("disconnected!!");
      };
    },

    sendMessage() {
      if (this.newMessage.trim() === "") return;
      this.ws.send(this.newMessage); // 서버에 메시지 보냄, send라는 내장 함수 사용
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
      if (this.ws) {
        this.ws.close();
        console.log("disconnected!");
        this.ws = null;
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
</style>
