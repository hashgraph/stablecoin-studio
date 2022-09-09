import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../layout/Layout';
import Dashboard from '../views/Dashboard';
import Login from '../views/Login';

interface Props {
	handleRoute: {
		component: React.FC;
		type?: string;
	};
	roleRoute: {
		component: React.FC;
		roles: string[];
	};
}

const HandleRoute = ({ component: Component, type = 'public' }: Props['handleRoute']) => {
	return <Component />;
};

const WrapperRoutesLayout = () => {
	return (
		<div>
			<Layout>
				<Routes>
					{/* Dashboard route */}
					<Route path='/dashboard' element={<Dashboard />} />

					{/* Default routes */}
					<Route path='*' element={<Navigate to='/dashboard' />} />
				</Routes>
			</Layout>
		</div>
	);
};

const Router = () => {
	return (
		<main>
			<Routes>
				{/* Public routes */}
				<Route path='/' element={<HandleRoute component={Login} />} />
				<Route path='/login' element={<HandleRoute component={Login} />} />

				{/* Private routes */}
				<Route path='/*' element={<HandleRoute component={WrapperRoutesLayout} type='private' />} />
			</Routes>
		</main>
	);
};

export default Router;
