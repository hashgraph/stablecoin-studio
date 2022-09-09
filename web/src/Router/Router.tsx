import { useSelector } from 'react-redux';
import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import Layout from '../layout/Layout';
import { RootState } from '../store/store';
import Dashboard from '../views/Dashboard';
import Login from '../views/Login';
import { RoutesMappingUrl } from './RoutesMappingUrl';

const PrivateRoute = () => {
	// TODO: change logic when it is paired w/ account ?
	const user = useSelector((state: RootState) => state.user.user);
	return (
		<Layout>
			{user ? (
				<Outlet />
			) : (
				<Navigate to={RoutesMappingUrl.login} replace state={{ from: location }} />
			)}
		</Layout>
	);
};

const Router = () => {
	return (
		<main>
			<Routes>
				{/* Public routes */}
				<Route path='/' element={<Login />} />
				<Route path={RoutesMappingUrl.login} element={<Login />} />

				{/* Private routes */}
				<Route element={<PrivateRoute />}>
					<Route path={RoutesMappingUrl.dashboard} element={<Dashboard />} />
					<Route path='*' element={<Navigate to={RoutesMappingUrl.dashboard} />} />
				</Route>
			</Routes>
		</main>
	);
};

export default Router;
