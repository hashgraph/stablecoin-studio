import { useSelector } from 'react-redux';
import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import Layout from '../layout/Layout';
import { RootState } from '../store/store';
import Dashboard from '../views/Dashboard';
import StableCoinNotSelected from '../views/ErrorPage/StableCoinNotSelected';
import Login from '../views/Login';
import Operations from '../views/Operations';
import CashInOperation from '../views/Operations/CashIn';
import StableCoinCreation from '../views/StableCoinCreation/StableCoinCreation';
import Roles from '../views/Roles';
import { RoutesMappingUrl } from './RoutesMappingUrl';

const PrivateRoute = () => {
	// TODO: change logic when it is paired w/ account ?
	const user = useSelector((state: RootState) => state.user.user.username);
	return <Layout>{user ? <Outlet /> : <Navigate to={RoutesMappingUrl.login} replace />}</Layout>;
};

const OnboardingRoute = () => {
	// TODO: change logic when it is paired w/ account ?
	const user = useSelector((state: RootState) => state.user.user.username);
	return !user ? <Outlet /> : <Navigate to={RoutesMappingUrl.dashboard} replace />;
};

const Router = () => {
	return (
		<main>
			<Routes>
				{/* Public routes */}
				<Route element={<OnboardingRoute />}>
					<Route path={RoutesMappingUrl.login} element={<Login />} />
				</Route>
				{/* Private routes */}
				<Route element={<PrivateRoute />}>
					<Route path={RoutesMappingUrl.cashIn} element={<CashInOperation />} />
					<Route path={RoutesMappingUrl.dashboard} element={<Dashboard />} />
					<Route path={RoutesMappingUrl.operations} element={<Operations />} />
					<Route path={RoutesMappingUrl.roles} element={<Roles />} />
					<Route path={RoutesMappingUrl.stableCoinCreation} element={<StableCoinCreation />} />
					<Route
						path={RoutesMappingUrl.stableCoinNotSelected}
						element={<StableCoinNotSelected />}
					/>
					<Route path='*' element={<Navigate to={RoutesMappingUrl.dashboard} />} />
				</Route>
			</Routes>
		</main>
	);
};

export default Router;
