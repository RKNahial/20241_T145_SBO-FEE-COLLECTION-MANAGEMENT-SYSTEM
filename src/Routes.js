// src/Routes.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AdminLogin from './features/admin/AdminLogin';

const Routes = () => {
  return (
    <Router>
      <Switch>
        {/* ADMIN ROUTE */}
        <Route path="/admin/login" component={AdminLogin} />
        {/* You can add more routes here in the future */}
      </Switch>
    </Router>
  );
};

export default Routes;