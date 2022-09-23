/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import SearchSelectController from '../../components/Form/SearchSelectController';
import type { Option } from '../../components/Form/SelectController';
import SDKService from '../../services/SDKService';

const CoinDropdown = () => {
	const [stableCoins, setStableCoins] = useState<Option[]>([]);
	// TODO onchange add to redux selected coin
	useEffect(() => {
		getStableCoins();
	}, []);

	const getStableCoins = async () => {
		const coins = await SDKService.getStableCoins({
			privateKey:
				'302e020100300506032b6570042204201713ea5a2dc0287b11a6f25a1137c0cad65fb5af52706076de9a9ec5a4b7f625',
		});

		if (coins) {
			const options = coins.map(({ id, symbol }) => ({ label: `${id} - ${symbol}`, value: id }));
			setStableCoins(options);
		}
	};

	const { t } = useTranslation('global');
	const { control } = useForm();
	const styles = {
		menuList: {
			maxH: '244px',
			overflowY: 'auto',
			bg: 'brand.white',
			boxShadow: 'down-black',
			p: 4,
		},
		wrapperOpened: { borderWidth: '0' },
	};

	return (
		<Box w={{ base: 'full', md: '280px' }} data-testid='coin-dropdown'>
			<SearchSelectController
				control={control}
				styles={styles}
				name='coin-dropdown'
				options={stableCoins}
				placeholder={t('topbar.coinDropdown.placeholder')}
				iconStyles={{ color: 'brand.primary200' }}
				onChangeAux={() => {
					console.log('changes');
				}}
			/>
		</Box>
	);
};

export default CoinDropdown;
