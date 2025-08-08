<template>
  <v-container fluid class="fill-height pa-0 chat-background">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" md="8" lg="6" class="d-flex justify-center align-center">
        <v-card class="chat-card flex-grow-1">
          <!-- Header -->
          <v-toolbar flat class="chat-toolbar" color="transparent">
            <v-avatar size="40" class="mr-3 elevation-2">
              <img :src="profileImageUrl || '/default.png'" alt="내 프로필" />
            </v-avatar>
            <v-toolbar-title
              class="text-h6 font-weight-bold text-grey-darken-4"
            >
              채팅
            </v-toolbar-title>
            <v-spacer />
          </v-toolbar>

          <v-divider class="border-opacity-50" />

          <v-card-text class="pa-0 flex-grow-1 d-flex flex-column">
            <div
              class="chat-box flex-grow-1"
              role="log"
              aria-live="polite"
              aria-label="메시지 목록"
            >
              <div v-if="messages.length === 0" class="empty-state">
                <v-icon
                  icon="mdi-message-text-outline"
                  size="48"
                  class="mb-4 text-grey-lighten-1"
                />
                <p class="text-h6 font-weight-medium text-grey-darken-1">
                  아직 메시지가 없습니다.
                </p>
                <p class="text-body-2 text-grey-darken-1">
                  첫 메시지를 보내 대화를 시작해보세요!
                </p>
              </div>

              <div
                v-else
                v-for="(msg, index) in messages"
                :key="index"
                :class="[
                  'message-row',
                  msg.senderEmail === senderEmail ? 'sent' : 'received',
                ]"
              >
                <v-avatar size="45" class="message-avatar elevation-1">
                  <img
                    :src="msg.profileImageUrl || '/default.png'"
                    :alt="`${msg.senderEmail} 프로필`"
                  />
                </v-avatar>

                <div class="message-content">
                  <div
                    class="sender text-caption text-grey-darken-1 font-weight-medium"
                    :title="msg.senderEmail"
                  >
                    {{ msg.senderName }}
                  </div>
                  <div class="message-bubble elevation-1">
                    {{ msg.message }}
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>

          <v-divider class="border-opacity-50" />

          <v-card-actions class="pa-4 composer">
            <v-text-field
              v-model="newMessage"
              placeholder="메시지를 입력하세요..."
              variant="solo"
              density="comfortable"
              class="flex-grow-1 message-input"
              hide-details
              rounded="pill"
              flat
              @keyup.enter="sendMessage"
              aria-label="메시지 입력"
            >
              <template v-slot:append-inner>
                <v-icon
                  icon="mdi-emoticon-outline"
                  class="text-grey-darken-1"
                />
              </template>
            </v-text-field>
            <v-btn
              color="secondary"
              class="ml-3 send-button"
              height="48"
              variant="flat"
              elevation="2"
              @click="sendMessage"
            >
              <v-icon icon="mdi-send" size="24" />
            </v-btn>
          </v-card-actions>
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
      senderName: null,
      roomId: null,
      profileImageUrl: "",
      name: "",
    };
  },

  async created() {
    this.senderEmail = localStorage.getItem("email");
    this.roomId = this.$route.params.roomId;

    const ImgRes = await axios.get(
      `${process.env.VUE_APP_API_BASE_URL}/member/me`
    );
    this.profileImageUrl = ImgRes.data.profileImageUrl;
    this.name = ImgRes.data.name;

    const res = await axios.get(
      `${process.env.VUE_APP_API_BASE_URL}/chat/history/${this.roomId}`
    );
    this.messages = res.data;

    this.connectWebSocket();
  },

  beforeRouteLeave(to, from, next) {
    this.disconnectWebSocket();
    next();
  },

  beforeUnmount() {
    this.disconnectWebSocket();
  },

  methods: {
    connectWebSocket() {
      if (this.stompClient && this.stompClient.connected) return;

      const sockJs = new SockJS(`${process.env.VUE_APP_API_BASE_URL}/connect`);
      this.stompClient = Stomp.over(sockJs);
      this.token = localStorage.getItem("token");

      this.stompClient.connect(
        { Authorization: `Bearer ${this.token}` },
        () => {
          this.stompClient.subscribe(
            `/topic/${this.roomId}`,
            (message) => {
              const parseMessage = JSON.parse(message.body);
              this.messages.push(parseMessage);
              this.scrollToBottom();
            },
            { Authorization: `Bearer ${this.token}` }
          );
        }
      );
    },

    sendMessage() {
      if (this.newMessage.trim() === "") return;

      const message = {
        senderEmail: this.senderEmail,
        message: this.newMessage,
        profileImageUrl: this.profileImageUrl,
      };

      this.stompClient.send(`/publish/${this.roomId}`, JSON.stringify(message));
      this.newMessage = "";
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const chatBox = this.$el.querySelector(".chat-box");
        if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
      });
    },

    async disconnectWebSocket() {
      await axios.post(
        `${process.env.VUE_APP_API_BASE_URL}/chat/room/${this.roomId}/read`
      );

      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.unsubscribe(`/topic/${this.roomId}`);
        this.stompClient.disconnect();
      }
    },
  },
};
</script>

<style scoped>
:root {
  --chat-bg-start: #f0f2f5;
  --chat-bg-end: #e0e2e5;
  --bubble-sent: #10b981; /* Emerald */
  --bubble-received: #ffffff; /* White */
  --text-primary: #212121; /* Dark Grey */
  --text-secondary: #757575; /* Medium Grey */
  --border-color: #e0e0e0;
}

.chat-background {
  background: linear-gradient(
    135deg,
    var(--chat-bg-start) 0%,
    var(--chat-bg-end) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh; /* Ensure it takes full viewport height */
}

.chat-card {
  margin-top: -70px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: min(90vh, 700px); /* Max height for the card */
  max-width: 100%; /* Ensure it doesn't overflow on small screens */
}

.chat-toolbar {
  background-color: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  padding: 12px 20px;
}

.chat-box {
  padding: 20px;
  background-color: #fcfcfc;
  overflow-y: auto;
  scroll-behavior: smooth;
  flex-grow: 1; /* Allow chat box to fill available space */
}

/* Custom scrollbar for Webkit browsers */
.chat-box::-webkit-scrollbar {
  width: 8px;
}

.chat-box::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 10px;
}

.chat-box::-webkit-scrollbar-thumb {
  background: #bdbdbd;
  border-radius: 10px;
}

.chat-box::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 20px;
}

.message-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 16px;
}

.message-row.sent {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 75%; /* Adjusted for better responsiveness */
}

.message-row.sent .message-content {
  align-items: flex-end;
}

.sender {
  margin-bottom: 4px;
  padding: 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-bubble {
  position: relative;
  padding: 12px 16px;
  border-radius: 18px;
  line-height: 1.4;
  word-break: break-word;
  font-size: 0.95rem;
  color: black;
  background: var(--bubble-received);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* 말풍선 꼬리 */
.message-row.received .message-bubble {
  border-bottom-left-radius: 4px;
}

/* 말풍선 꼬리 */
.message-row.sent .message-bubble {
  background: var(--bubble-sent);
  color: black;
  border-bottom-right-radius: 4px;
}

/* Composer */
.composer {
  background-color: #ffffff;
  /* border-top: 1px solid var(--border-color); */
  padding: 16px 20px !important;
}

.message-input .v-field__field {
  padding-left: 20px !important;
  padding-right: 20px !important;
}

.send-button {
  min-width: 48px !important;
  padding: 0 !important;
}

/* Responsive tweaks */
@media (max-width: 600px) {
  .chat-card {
    height: 95vh;
    border-radius: 0; /* Full width on small screens */
  }
  .message-content {
    max-width: 85%;
  }
  .chat-toolbar {
    padding: 10px 16px;
  }
  .composer {
    padding: 12px 16px !important;
  }
  .message-input {
    font-size: 0.9rem;
  }
  .send-button {
    height: 44px !important;
    min-width: 44px !important;
  }
}
</style>
