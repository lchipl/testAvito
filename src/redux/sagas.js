import { put, call, all, takeLatest, select } from "redux-saga/effects";
import {
  FETCH_COMMENTS,
  FETCH_POSTS,
  GET_COMMENTS,
  GET_POSTS,
  HIDE_LOADER,
  SET_LOADING,
} from "./action/types";
import axios from "axios";
import { timestamp } from "../utils/timestamp";
function* sagaFetchPosts() {
  yield takeLatest(FETCH_POSTS, sagaWorkerPosts);
}

function* sagaWorkerPosts() {
  try {
    yield put({ type: SET_LOADING }); // показать loader
    const payload = yield call(fetchPosts);
    yield put({ type: GET_POSTS, payload });

    yield put({ type: HIDE_LOADER });
  } catch (e) {
    console.log("ошибОчка", e);
  }
}

function* sagaFetchComments() {
  yield takeLatest(FETCH_COMMENTS, sagaWorkerComments);
}

function* sagaWorkerComments() {
  try {
    //yield put({type:SET_LOADING})  // показать loader
    const { kids } = yield select((state) => state.post);

    const payload = yield call(fetchComments, kids);
    console.log("пейлоад", payload);

    yield put({ type: GET_COMMENTS, payload });

    yield put({ type: HIDE_LOADER });
  } catch (e) {
    console.log("ошибОчка", e);
  }
}

export default function* rootSaga() {
  yield all([sagaFetchPosts(), sagaFetchComments()]);
}

const initialUrl = `https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty&orderBy="$key"&limitToFirst=100`;
const fetchPosts = async (url = initialUrl) => {
  const response = await axios.get(url);
  let arrPosts = response.data;
  const sdvig = (pageNumber) => {
    if (pageNumber === 1) {
      return (arrPosts.length = 10);
    } else {
      // prettier-ignore
      return arrPosts = arrPosts.slice((pageNumber-1)*10,(pageNumber*10)+1);
    }
  };

  sdvig(10);

  const result = await Promise.all(
    arrPosts.map(async (postIndex) => {
      console.log(postIndex);
      const response = await axios.get(
        `https://hacker-news.firebaseio.com/v0/item/${postIndex}.json?print=pretty`
      );

      return { ...response.data, time: timestamp(response.data.time) };
    })
  );
  console.log(result);

  return result;
};

const fetchComments = async (kids) => {
  let result = [];
  if (kids) {
    result = await Promise.all(
      kids.map(async (commentsIndex) => {
        const response = await axios.get(
          `https://hacker-news.firebaseio.com/v0/item/${commentsIndex}.json?print=pretty`
        );
        console.log("к получен", response.data);
        return response.data;
      })
    );
  } else {
    console.log("коммент но пока пусто");
    return "комментариев пока нет";
  }
  console.log("коммент", result);

  return result;
};
