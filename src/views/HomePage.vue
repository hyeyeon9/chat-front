<template>
  <v-container class="py-8">
    <div class="text-center mb-12">
      <h1 class="text-h2 font-weight-bold text-grey-darken-3 mb-4 mt-15">
        CHAT 서비스에 오신 것을
        <span class="text-primary">환영합니다!</span>
        🎉
      </h1>
      <h3 class="text-h5 text-grey-darken-1 font-weight-regular mb-8">
        실시간 채팅으로 친구들과 소통하고, 새로운 사람들과 만나보세요.
      </h3>
    </div>

    <v-row justify="center" class="mb-8">
      <v-col
        cols="12"
        sm="6"
        md="6"
        lg="3"
        v-for="(menu, index) in menuItems"
        :key="index"
        class="mt-12"
      >
        <v-card
          class="menu-card text-center pa-4 "
          elevation="4"
          hover
          @click="navigateTo(menu.path)"
        >
          <v-card-text class="pa-6">
            <v-avatar :color="menu.color" size="80" class="mb-4 menu-avatar">
              <v-icon :icon="menu.icon" size="40" color="white" />
            </v-avatar>

            <v-card-title
              class="text-h5 font-weight-bold text-grey-darken-3 pa-0 mb-2"
            >
              {{ menu.title }}
            </v-card-title>

            <v-card-subtitle class="text-body-1 text-grey-darken-1 pa-0">
              {{ menu.description }}
            </v-card-subtitle>
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
      menuItems: [
        {
          icon: "mdi-account-group",
          title: "회원목록",
          description: "새로운 사람들과 만나보세요",
          color: "blue",
          path: "/member/list",
        },
        {
          icon: "mdi-forum",
          title: "채팅방목록",
          description: "다양한 주제의 채팅방들",
          color: "green",
          path: "/groupchatting/list",
        },
        {
          icon: "mdi-plus-circle",
          title: "새 채팅방",
          description: "나만의 채팅방을 만들어보세요",
          color: "purple",
          path: "/groupchatting/list",
        },
        {
          icon: "mdi-chat",
          title: "내 채팅방",
          description: "참여 중인 채팅방 관리",
          color: "orange",
          path: "/my/chat/page",
        },
      ],
      todayMessages: [
        "오늘도 즐거운 하루 되세요! ☀️",
        "새로운 친구들과 대화해보세요 💬",
        "채팅방에서 재미있는 이야기를 나눠보세요 🎉",
        "프로필을 업데이트해보는 건 어떨까요? ✨",
        "오늘 날씨가 좋네요! 기분 좋은 대화 나누세요 🌤️",
      ],
    };
  },

  computed: {
    todayMessage() {
      return this.todayMessages[
        Math.floor(Math.random() * this.todayMessages.length)
      ];
    },
  },

  async created() {
    // 필요한 초기화 로직
  },

  methods: {
    navigateTo(path) {
      this.$router.push(path);
    },
  },
};
</script>

<style scoped>

.menu-card {
  border-radius: 16px !important;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
}

.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.menu-avatar {
  transition: transform 0.3s ease;
}

.menu-card:hover .menu-avatar {
  transform: scale(1.1);
}

.today-message-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border-radius: 20px !important;
}

.stat-item {
  padding: 16px 8px;
  border-radius: 12px;
  transition: background-color 0.2s ease;
}

.stat-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* 반응형 조정 */
@media (max-width: 600px) {
  .menu-card {
    margin-bottom: 16px;
  }

  .search-field {
    margin: 0 16px;
  }
}
</style>
