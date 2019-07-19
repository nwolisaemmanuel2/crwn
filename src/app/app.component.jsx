import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Header } from '../components/header/header.component';
import { Homepage } from '../pages/homepage/homepage.component';
import { ShopPage } from '../pages/shop/shop.component';
import { ContactPage } from '../pages/contact/contact.component';
import { SignInPage } from '../pages/sign-in/sign-in.component';
import { SignUpPage } from '../pages/sign-up/sign-up.component';
import { Footer } from '../components/footer/footer.component';
import { auth, createUserProfileDocument } from '../utils/firebase.utils';
import { setCurrentUser } from '../redux/user/user.actions';
import { selectCurrentUser } from '../redux/user/user.selectors';
import './app.style.scss';


class App extends React.Component {
  unsubscribeFromAuth = null;

  componentDidMount() {
    const { setCurrentUser } = this.props;

    this.unsubscribeFromAuth = auth.onAuthStateChanged(
      async authicatedUser => {
        if (authicatedUser) {
          const userReference = await createUserProfileDocument(authicatedUser);
          userReference.onSnapshot(snapshot => {
            setCurrentUser({
              id: snapshot.id,
              ...snapshot.data()
            });
          });
        };

        setCurrentUser(null);
      }
    );
  }

  componentWillUnmount() {
    this.unsubscribeFromAuth();
  }

  render() {
    const { currentUser } = this.props;
    return (
      <div className="app">
        <Header />
        <Switch>
          <Route exact path='/' component={Homepage} />
          <Route path='/shop' component={ShopPage} />
          <Route path='/contact' component={ContactPage} />
          <Route exact path='/login' render={() => currentUser === null ? <SignInPage /> : <Redirect to='/' />} />
          <Route exact path='/register' render={() => currentUser === null ? <SignUpPage /> : <Redirect to='/' />} />
        </Switch>
        <Footer />
      </div>
    );
  }
};

const mapStateToProps = createStructuredSelector({
  currentUser: selectCurrentUser
});

const mapDispatchToProps = dispatch => ({
  setCurrentUser: user => dispatch(setCurrentUser(user))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
