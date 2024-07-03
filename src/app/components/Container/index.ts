import React from 'react';

const DemographicsContainer = React.lazy(() => import('./DemographicsContainer/DemographicsContainer'));
const TabView = React.lazy(() => import('./TabView/TabView'));
const List = React.lazy(() => import('./ListContainer'));

const Container = {
  DemographicsContainer,
  TabView,
  List,
};

export default Container;
