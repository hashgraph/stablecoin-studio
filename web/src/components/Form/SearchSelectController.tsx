import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Icon from '../Icon';
import { SelectController } from './SelectController';

const SearchSelectController = () => {
	const [isMenuOpened, setIsMenuOpened] = useState(false);

	const { control } = useForm();

	return (
		<SelectController
			control={control}
			name='Prueba'
			isSearchable
			id='prueba'
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
			addonDown={
				isMenuOpened ? (
					<Icon name='MagnifyingGlass' w={5} h={5} />
				) : (
					<Icon name='CaretDown' w={4} h={4} />
				)
			}
			data-testid='prueba'
			onMenuOpen={() => setIsMenuOpened(true)}
			onMenuClose={() => setIsMenuOpened(false)}
			overrideStyles={{
				wrapper: !isMenuOpened ? { borderColor: 'transparent' } : {},
				menuList: { maxH: '400px', overflowY: 'scroll' },
			}}
		/>
	);
};

export default SearchSelectController;
