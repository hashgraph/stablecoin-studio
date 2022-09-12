import { Box } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import SearchSelectController from '../../components/Form/SearchSelectController';

const CoinDropdown = () => {
	// TODO: integrate get coins from sdk
	const { t } = useTranslation('global');
	const { control } = useForm();
	const styles = {
		menuList: {
			maxH: '220px',
			overflowY: 'auto',
			bg: 'brand.white',
			boxShadow: 'down-black',
			p: 4,
		},
		wrapperOpened: { borderWidth: '0' },
	};

	return (
		<Box w={{ base: 'full', md: '250px' }}>
			<SearchSelectController
				control={control}
				styles={styles}
				name='coin-dropdown'
				options={[]}
				placeholder={t('sidebar.coinDropdown.placeholder')}
			/>
		</Box>
	);
};

export default CoinDropdown;
