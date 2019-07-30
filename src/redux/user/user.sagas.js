import {
  all,
  takeLatest,
  put,
  call
} from 'redux-saga/effects';
import {
  auth,
  createUserProfileDocument,
  getCurrentUser,
  googleProvider,
} from '../../utils/firebase.utils';
import {
  UserTypes,
  signInSuccess,
  signInFail
} from './user.actions';

function* getUserSnapshot(user) {
  const userReference = yield createUserProfileDocument(user);
  const userSnapshot = yield userReference.get();
  yield put(signInSuccess({ id: userSnapshot.id, ...userSnapshot.data() }));
}

function* signInWithGoogleAsync() {
  try {
    const { user } = yield auth.signInWithPopup(googleProvider);
    yield getUserSnapshot(user);
  } catch (error) {
    yield put(signInFail(error.message));
  }

}

function* watchSignInWithGoogle() {
  yield takeLatest(UserTypes.SIGN_IN_WITH_GOOGLE, signInWithGoogleAsync);
}

function* signInWithEmailAndPasswordAsync({ payload: { email, password } }) {
  try {
    const { user } = yield auth.signInWithEmailAndPassword(email, password);
    yield getUserSnapshot(user);
  } catch (error) {
    yield put(signInFail(error.message));
  }
}

function* watchSignInWithEmailAndPassword() {
  yield takeLatest(UserTypes.SIGN_IN_WITH_EMAIL_AND_PASSWORD, signInWithEmailAndPasswordAsync)
}

function* checkUserSessionAsync() {
  try {
    const authenticatedUser = yield getCurrentUser();
    if (!authenticatedUser) return;
    yield getUserSnapshot(authenticatedUser);
  } catch (error) {
    yield put(signInFail(error.message));
  }
}

function* watchCheckUserSession() {
  yield takeLatest(UserTypes.CHECK_USER_SESSION, checkUserSessionAsync);
}

export function* userSagas() {
  yield all([
    call(watchSignInWithGoogle),
    call(watchSignInWithEmailAndPassword),
    call(watchCheckUserSession)
  ]);
}