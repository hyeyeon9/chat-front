import { EventSourcePolyfill } from "event-source-polyfill";

let eventSource = null;
const token = localStorage.getItem("token");

export function connectSSE(callback) {
  if (eventSource) {
    console.warn("이미 SSE 연결이 존재합니다.");
    return;
  }

  eventSource = new EventSourcePolyfill(
    `${process.env.VUE_APP_API_BASE_URL}/sse/subscribe`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    }
  );

  eventSource.addEventListener("unread-count", (event) => {
    try {
      const data = JSON.parse(event.data);
      callback(data);
      console.log("unread-count 이벤트 data:", data);
    } catch (error) {
      console.error("SSE unread-count 데이터 파싱 에러", error);
    }
  });

  eventSource.onerror = (error) => {
    console.error("SSE 연결 오류", error);
    disconnectSSE();
  };

  console.log("✅ SSE 연결 완료");
}

export function disconnectSSE() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
    console.log("SSE 연결 해제");
  }
}
