import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import Layout from '../layout/Layout';
import Dashboard from '../views/Dashboard';
import StableCoinNotSelected from '../views/ErrorPage/StableCoinNotSelected';
import Login from '../views/Login';
import Operations from '../views/Operations';
import CashInOperation from '../views/Operations/CashIn';
import StableCoinCreation from '../views/StableCoinCreation/StableCoinCreation';
import Roles from '../views/Roles';
import { RoutesMappingUrl } from './RoutesMappingUrl';
import SDKService, { HashConnectConnectionState } from '../services/SDKService';
import { useEffect, useState } from 'react';

const PrivateRoute = ({ status }: { status?: HashConnectConnectionState }) => {
	return (
		<Layout>
			{status === HashConnectConnectionState.Paired ? (
				<Outlet />
			) : (
				<Navigate to={RoutesMappingUrl.login} replace />
			)}
		</Layout>
	);
};

const OnboardingRoute = ({ status }: { status?: HashConnectConnectionState }) => {
	return status !== HashConnectConnectionState.Paired ? (
		<Outlet />
	) : (
		<Navigate to={RoutesMappingUrl.dashboard} replace />
	);
};

const Router = () => {
	const [status, setStatus] = useState<HashConnectConnectionState>();

	const getStatus = async () => {
		const status = await SDKService.getStatus();
		setStatus(status);
	};
	useEffect(() => {
		getStatus();
	}, []);

	return (
		<main>
			<Routes>
				{/* Public routes */}
				<Route element={<OnboardingRoute status={status} />}>
					<Route path={RoutesMappingUrl.login} element={<Login />} />
				</Route>
				{/* Private routes */}
				<Route element={<PrivateRoute status={status} />}>
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
