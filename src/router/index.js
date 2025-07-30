import GroupChattingList from "@/views/GroupChattingList.vue";
import LoginPage from "@/views/LoginPage.vue";
import MemberCreate from "@/views/MemberCreate.vue";
import MemberList from "@/views/MemberList.vue";
import SimpleWebSocket from "@/views/SimpleWebSocket.vue";
import StompChatPage from "@/views/StompChatPage.vue";
import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/member/create",
    name: "MemberCreate",
    component: MemberCreate,
  },
  {
    path: "/login",
    name: "LoginPage",
    component: LoginPage,
  },
  {
    path: "/member/list",
    name: "MemberList",
    component: MemberList,
  },
  {
    path: "/simple/chat",
    name: "SimpleWebSocket",
    component: SimpleWebSocket,
  },
  {
    path: "/chatpage/:roomId",
    name: "StompChatPage",
    component: StompChatPage,
  },
  {
    path: "/groupChatting/list",
    name: "GroupChattingList",
    component: GroupChattingList,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;

// 라우터 라이브러리를 쓸 것
