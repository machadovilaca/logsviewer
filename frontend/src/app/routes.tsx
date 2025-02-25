import * as React from 'react';
import { Route, RouteComponentProps, Switch, useLocation } from 'react-router-dom';
import { Dashboard } from '@app/Dashboard/Dashboard';
import { Nodes } from '@app/Nodes/Nodes';
import { ImportLogs } from '@app/Import/Logs/ImportLogs';
import { ImportDatabase } from '@app/Import/Logs/ImportDatabase';
import { VirtualMachines } from '@app/Workloads/VirtualMachines/VirtualMachines';
import { VirtualMachineInstances } from '@app/Workloads/VirtualMachineInstances/VirtualMachineInstances';
import { Migrations } from '@app/Workloads/Migrations/Migrations';
import { Pods } from '@app/Workloads/Pods/Pods';
import { NotFound } from '@app/NotFound/NotFound';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { PersistentVolumeClaims } from '@app/Storage/PVC/PersistentVolumeClaims';

let routeFocusTimer: number;
export interface IAppRoute {
  label?: string; // Excluding the label will exclude the route from the nav sidebar in AppLayout
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  exact?: boolean;
  path: string;
  title: string;
  routes?: undefined;
}

export interface IAppRouteGroup {
  label: string;
  routes: IAppRoute[];
}

export type AppRouteConfig = IAppRoute | IAppRouteGroup;

const routes: AppRouteConfig[] = [
  {
    component: Dashboard,
    exact: true,
    label: 'Dashboard',
    path: '/',
    title: 'LogsViewer | Main Dashboard',
  },
  {
    label: 'Import',
    routes: [
      {
        component: ImportLogs,
        exact: true,
        label: 'Logs',
        path: '/import/logs',
        title: 'LogsViewer | Import Logs',
      },
      {
        component: ImportDatabase,
        exact: true,
        label: 'Database',
        path: '/import/database',
        title: 'LogsViewer | Import Database',
      },
    ],
  },
  {
    label: 'Workloads',
    routes: [
      {
        component: VirtualMachines,
        exact: true,
        label: 'VirtualMachines',
        path: '/workloads/virtualmachines',
        title: 'PatternFly Seed | Virtual Machines View',
      },
      {
        component: VirtualMachineInstances,
        exact: true,
        label: 'VirtualMachineIntances',
        path: '/workloads/virtualmachineinstances',
        title: 'PatternFly Seed | Virtual Machine Instances View',
      },
      {
        component: Migrations,
        exact: true,
        label: 'Migrations',
        path: '/workloads/migrations',
        title: 'PatternFly Seed | Migrations View',
      },
      {
        component: Pods,
        exact: true,
        label: 'Pods',
        path: '/workloads/pods',
        title: 'LogsViewer | Pods View',
      },
    ],
  },
  {
    label: 'Storage',
    routes: [
      {
        component: PersistentVolumeClaims,
        exact: true,
        label: 'PersistentVolumeClaims',
        path: '/storage/pvcs',
        title: 'PatternFly Seed | PersistentVolumeClaims View',
      },
    ],
  },
  {
    component: Nodes,
    exact: true,
    label: 'Nodes',
    path: '/nodes',
    title: 'LogsViewer | Nodes View',
  },
];

// a custom hook for sending focus to the primary content container
// after a view has loaded so that subsequent press of tab key
// sends focus directly to relevant content
// may not be necessary if https://github.com/ReactTraining/react-router/issues/5210 is resolved
const useA11yRouteChange = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    routeFocusTimer = window.setTimeout(() => {
      const mainContainer = document.getElementById('primary-app-container');
      if (mainContainer) {
        mainContainer.focus();
      }
    }, 50);
    return () => {
      window.clearTimeout(routeFocusTimer);
    };
  }, [pathname]);
};

const RouteWithTitleUpdates = ({ component: Component, title, ...rest }: IAppRoute) => {
  useA11yRouteChange();
  useDocumentTitle(title);

  function routeWithTitle(routeProps: RouteComponentProps) {
    return <Component {...rest} {...routeProps} />;
  }

  return <Route render={routeWithTitle} {...rest} />;
};

const PageNotFound = ({ title }: { title: string }) => {
  useDocumentTitle(title);
  return <Route component={NotFound} />;
};

const flattenedRoutes: IAppRoute[] = routes.reduce(
  (flattened, route) => [...flattened, ...(route.routes ? route.routes : [route])],
  [] as IAppRoute[]
);

const AppRoutes = (): React.ReactElement => (
  <Switch>
    {flattenedRoutes.map(({ path, exact, component, title }, idx) => (
      <RouteWithTitleUpdates path={path} exact={exact} component={component} key={idx} title={title} />
    ))}
    <PageNotFound title="404 Page Not Found" />
  </Switch>
);

export { AppRoutes, routes };
