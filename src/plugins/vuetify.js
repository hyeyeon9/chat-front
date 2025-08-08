import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import { aliases, mdi } from 'vuetify/iconsets/mdi' // ← 이거 중요
import '@mdi/font/css/materialdesignicons.css'       // ← 폰트도 불러오기!

export default createVuetify({
  components,
  icons: {
    defaultSet: 'mdi',   // 기본 아이콘 세트 설정
    aliases,             // mdi-alias들 연결
    sets: {
      mdi,               // mdi 세트 사용
    },
  },
});
