<template>
  <v-container class="py-6">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="mx-auto chat-room-card" elevation="8">

          <v-card-title class="d-flex align-center justify-space-between pa-6">
            <div class="d-flex align-center">
              <v-icon left size="28" class="mr-2">mdi-forum</v-icon>
              <span class="text-h5 font-weight-bold text-grey-darken-3">채팅방 목록</span>
            </div>
            <v-btn 
              color="primary" 
              @click="showCreateRoomModal = true"
              class="create-room-btn"
            >
              <v-icon left>mdi-plus</v-icon>
              채팅방 생성
            </v-btn>
          </v-card-title>

          <v-divider></v-divider>


          <v-card-text class="pb-0">
            <v-text-field
              v-model="search"
              label="방제목을 검색하세요"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              class="search-field"
            />
          </v-card-text>

          <v-card-text class="pa-0">
            <v-list lines="one" class="chat-room-list">
        
              <div v-if="filteredMemberList.length === 0" class="empty-chat-room-list text-center py-8">
                <v-icon size="64" color="grey-lighten-1">
                  {{ search ? 'mdi-forum-remove' : 'mdi-forum-plus' }}
                </v-icon>
                <p class="text-subtitle-1 text-grey-darken-1 mt-4">
                  {{ search ? '검색 결과가 없습니다.' : '생성된 채팅방이 없습니다.' }}
                </p>
                <p class="text-body-2 text-grey-lighten-1" v-if="search">
                  다른 검색어를 시도해보세요.
                </p>
                <v-btn 
                  v-else
                  color="primary" 
                  variant="outlined" 
                  @click="showCreateRoomModal = true"
                  class="mt-4"
                >
                  <v-icon left>mdi-plus</v-icon>
                  첫 번째 채팅방 만들기
                </v-btn>
              </div>


              <v-list-item
                v-else
                v-for="chat in filteredMemberList"
                :key="chat.roomId"
                class="chat-room-item"
              >
                <template v-slot:prepend>
                  <v-avatar color="primary" size="48" class="text-white font-weight-bold">
                    <v-icon size="24">mdi-forum</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-medium text-body-1">
                  {{ chat.roomName }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-grey-darken-1">
                  <v-icon size="16" class="mr-1">mdi-pound</v-icon>
                  방번호: {{ chat.roomId }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-btn
                    color="primary"
                    @click="joinChatRoom(chat.roomId)"
                    class="join-button"
                  >
    
                    참여하기
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>

          <v-card-actions class="justify-center pa-4" v-if="chatRoomList.length > 0">
            <v-chip color="grey-lighten-1" size="small" class="font-weight-medium">
              총 {{ filteredMemberList.length }}개의 채팅방
            </v-chip>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showCreateRoomModal" max-width="500px" persistent>
      <v-card class="create-room-modal">
        <v-card-title class="d-flex align-center pa-6">
          <v-icon left size="24" class="mr-2">mdi-forum-plus</v-icon>
          <span class="text-h6 font-weight-bold">채팅방 생성</span>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-6">
          <v-text-field
            label="방제목"
            v-model="newRoomTitle"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-format-title"
            placeholder="채팅방 이름을 입력하세요"
            @keyup.enter="createChatRoom"
            :rules="[v => !!v || '방제목을 입력해주세요']"
            hide-details="auto"
          />
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn 
            color="grey-darken-1" 
            variant="text" 
            @click="cancelCreateRoom"
            class="mr-2"
          >
            취소
          </v-btn>
          <v-btn 
            color="primary" 
            variant="flat" 
            @click="createChatRoom"
            :disabled="!newRoomTitle.trim()"
          >
            <v-icon left>mdi-check</v-icon>
            생성
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      chatRoomList: [],
      showCreateRoomModal: false,
      newRoomTitle: "",
      search: "",
    };
  },

  async created() {
    // axios는 자동으로 json 객체로 변환해줌
    this.loadChatRooms();
  },

  computed: {
    filteredMemberList() {
      if (!this.search) {
        return this.chatRoomList;
      }
      return this.chatRoomList.filter((c) => 
        c.roomName.toLowerCase().includes(this.search.toLowerCase())
      );
    },
  },

  methods: {
    // 채팅방 참여하기
    async joinChatRoom(roomId) {
      try {
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/chat/room/group/${roomId}/join`
        );
        this.$router.push(`/chatpage/${roomId}`);
      } catch (error) {
        console.error('채팅방 참여 실패:', error);
        // 에러 처리 로직 추가 가능
      }
    },

    async createChatRoom() {
      if (!this.newRoomTitle.trim()) {
        return;
      }

      try {
        // post 요청에 body를 기대하는데 없으니까 null 넣어줌
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/chat/room/group/create?roomName=${this.newRoomTitle}`,
          null
        );
        this.showCreateRoomModal = false; // 모달 닫기
        this.newRoomTitle = ""; // 입력 필드 초기화
        this.loadChatRooms(); // 채팅방 추가 후 재로드
      } catch (error) {
        console.error('채팅방 생성 실패:', error);
        // 에러 처리 로직 추가 가능
      }
    },

    // 모달 취소
    cancelCreateRoom() {
      this.showCreateRoomModal = false;
      this.newRoomTitle = "";
    },

    // 채팅방 목록 가져오기
    async loadChatRooms() {
      try {
        const res = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/chat/room/group/list`
        );
        this.chatRoomList = res.data;
      } catch (error) {
        console.error('채팅방 목록 로드 실패:', error);
        // 에러 처리 로직 추가 가능
      }
    },
  },
};
</script>

<style scoped>
.chat-room-card {
  border-radius: 16px;
  background: #ffffff;
  max-height: 80vh;
  overflow: hidden;
}

.create-room-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.search-field {
  margin: 16px;
}

.chat-room-list {
  background: none;
  max-height: 50vh;
  overflow-y: auto;
}

/* Custom scrollbar for chat room list */
.chat-room-list::-webkit-scrollbar {
  width: 6px;
}

.chat-room-list::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 10px;
}

.chat-room-list::-webkit-scrollbar-thumb {
  background: #bdbdbd;
  border-radius: 10px;
}

.chat-room-list::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}

.chat-room-item {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
  padding: 12px 16px;
}

.chat-room-item:last-child {
  border-bottom: none;
}

.chat-room-item:hover {
  background-color: #f8f9fa;
}

.join-button {
  min-width: 100px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.empty-chat-room-list {
  color: #757575;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin: 16px;
  padding: 32px 16px;
  border: 1px dashed #e0e0e0;
}

.create-room-modal {
  border-radius: 12px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .chat-room-card {
    margin: 8px;
    border-radius: 12px;
  }
  
  .create-room-btn {
    min-width: auto;
    padding: 0 12px;
  }
  
  .create-room-btn .v-btn__content {
    font-size: 0.875rem;
  }
  
  .join-button {
    min-width: 80px;
    font-size: 0.875rem;
  }
  
  .chat-room-item {
    padding: 8px 12px;
  }
  
  .search-field {
    margin: 12px;
  }
}
</style>
