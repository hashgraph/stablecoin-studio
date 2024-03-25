import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../layout/Layout';
import { RoutesMappingUrl } from './RoutesMappingUrl';
import CashInOperation from '../views/Operations/CashIn';
import BurnOperation from '../views/Operations/Burn';
import GetBalanceOperation from '../views/Operations/GetBalance';
import RescueTokenOperation from '../views/Operations/RescueTokens';
import RescueHBAROperation from '../views/Operations/RescueHBAR';
import WipeOperation from '../views/Operations/Wipe';
import FreezeOperation from '../views/Operations/Freeze';
import UnfreezeOperation from '../views/Operations/Unfreeze';
import CheckFrozenOperation from '../views/Operations/CheckFrozen';
import Dashboard from '../views/Dashboard';
import HandleRoles from '../views/Roles/HandleRoles';
import { actions } from '../views/Roles/constants';
import Loading from '../views/Loading';
import Operations from '.';
import Roles from '../views/Roles';
import StableCoinCreation from '../views/StableCoinCreation/StableCoinCreation';
import StableCoinNotSelected from '../views/ErrorPage/StableCoinNotSelected';
import SDKService from '../services/SDKService';
import StableCoinDetails from '../views/StableCoinDetails';
import {
	MIRROR_LIST_LS,
	RPC_LIST_LS,
	SELECTED_MIRROR_LS,
	SELECTED_RPC_LS,
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_STATUS,
	SELECTING_WALLET_COIN,
	walletActions,
} from '../store/slices/walletSlice';
import ImportedTokenCreation from '../views/ImportedToken/ImportedTokenCreation';
import DangerZoneOperations from '../views/Operations/DangerZone';
import type { EventParameter, WalletEvent } from '@hashgraph/stablecoin-npm-sdk';
import { Account, ConnectionState, LoggerTransports, SDK } from '@hashgraph/stablecoin-npm-sdk';
import StableCoinProof from '../views/StableCoinProof';
import FeesManagement from '../views/FeesManagement';
import GrantKycOperation from '../views/Operations/GrantKyc';
import RevokeKycOperation from '../views/Operations/RevokeKyc';
import CheckKycOperation from '../views/Operations/CheckKyc';
import Settings from '../views/Settings';
import StableCoinSettings from '../views/Settings/StableCoin';
import FactorySettings from '../views/Settings/Factory';
import ModalWalletConnect from '../components/ModalWalletConnect';
import AppSettings from '../views/AppSettings';
import { cleanLocalStorage } from '../utils/cleanStorage';
import MultiSigTransactions from '../views/Multisig/MultisigTransactions';

const LoginOverlayRoute = ({ show, loadingSC }: { show: boolean; loadingSC: boolean }) => {
	return (
		<>
			{show && <ModalWalletConnect />}
			{loadingSC && <Loading />}
			<Layout>
				<Outlet />
			</Layout>
		</>
	);
};

const Router = () => {
	const dispatch = useDispatch();

	const selectedWalletCoin = !!useSelector(SELECTED_WALLET_COIN);
	const selectingWalletCoin = useSelector(SELECTING_WALLET_COIN);
	const status = useSelector(SELECTED_WALLET_STATUS);

	useEffect(() => {
		instanceSDK();
		cleanLocalStorage([MIRROR_LIST_LS, SELECTED_MIRROR_LS, RPC_LIST_LS, SELECTED_RPC_LS]);
	}, []);

	const onLastWalletEvent = <T extends keyof WalletEvent>(
		event: EventParameter<T>,
		cll: CallableFunction,
	) => {
		const lastWallet = localStorage.getItem('lastWallet');
		if (event) {
			if (lastWallet && lastWallet === event.wallet) {
				cll(event);
			}
		}
	};

	const walletPaired = (event: EventParameter<'walletPaired'>) => {
		onLastWalletEvent(event, () => {
			dispatch(walletActions.setData(event.data));
			dispatch(walletActions.setStatus(ConnectionState.Paired));
			dispatch(walletActions.setNetwork(event.network.name));
			dispatch(walletActions.setNetworkRecognized(event.network.recognized));
			dispatch(walletActions.setFactoryId(event.network.factoryId));
			if (!event.data.account) dispatch(walletActions.setAccountRecognized(false));
			else
				dispatch(
					walletActions.setAccountRecognized(
						event.data.account.id !== Account.NullHederaAccount.id,
					),
				);
		});
	};

	const walletConnectionStatusChanged = (
		event: EventParameter<'walletConnectionStatusChanged'>,
	) => {
		onLastWalletEvent(event, () => {
			dispatch(walletActions.setStatus(event.status));
		});
	};

	const walletDisconnect = (event: EventParameter<'walletDisconnect'>) => {
		onLastWalletEvent(event, () => {
			dispatch(walletActions.setStatus(ConnectionState.Disconnected));
		});
	};

	const walletFound = (event: EventParameter<'walletFound'>) => {
		if (event) {
			dispatch(walletActions.setHasWalletExtension(event.name));
		}
	};

	const instanceSDK = async () => {
		SDK.appMetadata = {
			name: 'Hedera Stablecoin',
			description: 'An hedera dApp',
			icon: 'https://dashboard-assets.dappradar.com/document/15402/hashpack-dapp-defi-hedera-logo-166x166_696a701b42fd20aaa41f2591ef2339c7.png',
			url: '',
		};
		SDK.log = {
			level: process.env.REACT_APP_LOG_LEVEL ?? 'ERROR',
			transports: new LoggerTransports.Console(),
		};
		await SDKService.init({
			walletFound,
			walletPaired,
			walletConnectionStatusChanged,
			walletDisconnect,
		});
	};

	return (
		<main>
			<Routes>
				{/* Private routes */}
				<Route
					element={
						<LoginOverlayRoute
							show={Boolean(status !== ConnectionState.Paired)}
							loadingSC={selectingWalletCoin}
						/>
					}
				>
					{selectedWalletCoin && (
						<>
							<Route path={RoutesMappingUrl.balance} element={<GetBalanceOperation />} />
							<Route path={RoutesMappingUrl.cashIn} element={<CashInOperation />} />
							<Route path={RoutesMappingUrl.burn} element={<BurnOperation />} />
							<Route path={RoutesMappingUrl.rescueTokens} element={<RescueTokenOperation />} />
							<Route path={RoutesMappingUrl.rescueHBAR} element={<RescueHBAROperation />} />
							<Route path={RoutesMappingUrl.wipe} element={<WipeOperation />} />
							<Route path={RoutesMappingUrl.freeze} element={<FreezeOperation />} />
							<Route path={RoutesMappingUrl.unfreeze} element={<UnfreezeOperation />} />
							<Route path={RoutesMappingUrl.checkFrozen} element={<CheckFrozenOperation />} />
							<Route path={RoutesMappingUrl.dashboard} element={<Dashboard />} />
							<Route path={RoutesMappingUrl.editRole} element={<HandleRoles action='editRole' />} />
							<Route
								path={RoutesMappingUrl.getAccountsWithRoles}
								element={<HandleRoles action='getAccountsWithRole' />}
							/>
							<Route
								path={RoutesMappingUrl.multiSigTransactions}
								element={<MultiSigTransactions />}
							/>
							<Route path={RoutesMappingUrl.giveRole} element={<HandleRoles action='giveRole' />} />
							<Route path={RoutesMappingUrl.operations} element={<Operations />} />
							<Route path={RoutesMappingUrl.dangerZone} element={<DangerZoneOperations />} />
							<Route path={RoutesMappingUrl.grantKyc} element={<GrantKycOperation />} />
							<Route path={RoutesMappingUrl.revokeKyc} element={<RevokeKycOperation />} />
							<Route path={RoutesMappingUrl.checkKyc} element={<CheckKycOperation />} />
							<Route
								path={RoutesMappingUrl.revokeRole}
								element={<HandleRoles action='revokeRole' />}
							/>
							<Route
								path={RoutesMappingUrl.refreshRoles}
								element={<HandleRoles action={actions.refresh} />}
							/>
							<Route path={RoutesMappingUrl.roles} element={<Roles />} />
							<Route path={RoutesMappingUrl.stableCoinDetails} element={<StableCoinDetails />} />
							<Route path={RoutesMappingUrl.proofOfReserve} element={<StableCoinProof />} />
							<Route path={RoutesMappingUrl.feesManagement} element={<FeesManagement />} />
							<Route path={RoutesMappingUrl.stableCoinSettings} element={<StableCoinSettings />} />
						</>
					)}
					<Route path={RoutesMappingUrl.settings} element={<Settings />} />

					<Route path={RoutesMappingUrl.factorySettings} element={<FactorySettings />} />
					<Route path={RoutesMappingUrl.stableCoinCreation} element={<StableCoinCreation />} />
					<Route path={RoutesMappingUrl.importedToken} element={<ImportedTokenCreation />} />
					<Route
						path={RoutesMappingUrl.stableCoinNotSelected}
						element={<StableCoinNotSelected />}
					/>
					<Route path={RoutesMappingUrl.appSettings} element={<AppSettings />} />
					<Route path='*' element={<Navigate to={RoutesMappingUrl.stableCoinNotSelected} />} />
				</Route>
			</Routes>
		</main>
	);
};

export default Router;
