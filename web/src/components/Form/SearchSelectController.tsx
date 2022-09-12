import { SystemStyleObject } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { Control } from 'react-hook-form';
import Icon from '../Icon';
import {
	SelectController,
	SelectControllerProps,
	SelectOption,
	SelectThemeStyle,
} from './SelectController';

export interface SearchSelectControllerProps
	extends Omit<SelectControllerProps, 'overrideStyles' | 'id' | 'variant'> {
	control: Control<Record<string, SelectOption['value']>>;
	styles: Partial<SelectThemeStyle> & {
		wrapperOpened?: SystemStyleObject;
		wrapperClosed?: SystemStyleObject;
	};
}
const SearchSelectController = ({
	control,
	styles,
	name,
	'data-testid': dataTestId,
	...props
}: SearchSelectControllerProps) => {
	const [isMenuOpened, setIsMenuOpened] = useState(false);

	const { wrapperOpened, wrapperClosed, ...restStyles } = styles;
	const overrideStyles = useMemo(
		() => ({
			...restStyles,
			wrapper: !isMenuOpened ? wrapperClosed : wrapperOpened,
		}),
		[isMenuOpened],
	);

	return (
		<SelectController
			control={control}
			name={name}
			isSearchable
			addonDown={
				isMenuOpened ? (
					<Icon name='MagnifyingGlass' w={5} h={5} />
				) : (
					<Icon name='CaretDown' w={4} h={4} />
				)
			}
			data-testid={dataTestId}
			id={name}
			onMenuOpen={() => setIsMenuOpened(true)}
			onMenuClose={() => setIsMenuOpened(false)}
			overrideStyles={overrideStyles}
			{...props}
			variant='unstyled'
		/>
	);
};

export default SearchSelectController;
