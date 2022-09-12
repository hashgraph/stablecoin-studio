import { Box } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import SearchSelectController from '../../components/Form/SearchSelectController';

const CoinDropdown = () => {
	const { t } = useTranslation('global');
	const { control } = useForm();
	const styles = {
		menuList: { maxH: '220px', overflowY: 'auto', bg: 'brand.white' },
		wrapperOpened: { borderWidth: '0' },
	};

	return (
		<Box w={{ base: 'full', md: '250px' }}>
			<SearchSelectController
				control={control}
				styles={styles}
				name='coin-dropdown'
				options={[
					{
						label: 'uno',
						value: '1',
					},
					{
						label: 'dos',
						value: 2,
					},
					{
						label: 'dos',
						value: Math.random(),
					},
					{
						label: 'dos',
						value: Math.random(),
					},
					{
						label: 'dos',
						value: Math.random(),
					},
					{
						label: 'dos',
						value: Math.random(),
					},
					{
						label: 'dos',
						value: Math.random(),
					},
					{
						label: 'dos',
						value: Math.random(),
					},
					{
						label: 'dos',
						value: Math.random(),
					},
					{
						label: 'dos',
						value: Math.random(),
					},
					{
						label: 'dos',
						value: Math.random(),
					},
					{
						label: 'dos',
						value: Math.random(),
					},
					{
						label: 'dos',
						value: Math.random(),
					},
					{
						label: 'dos',
						value: Math.random(),
					},
					{
						label: 'ult',
						value: Math.random(),
					},
				]}
				placeholder={t('sidebar.coinDropdown.placeholder')}
			/>
		</Box>
	);
};

export default CoinDropdown;
