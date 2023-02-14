import type { SystemStyleObject, IconProps as ChakraIconProps } from '@chakra-ui/react';
import { forwardRef, useMemo, useState } from 'react';
import type { Ref } from 'react';
import type { Control } from 'react-hook-form';

import type { GroupBase, SelectInstance } from 'chakra-react-select';
import { useCreatable } from 'chakra-react-select';
import type {
	SelectControllerProps,
	SelectOption,
	SelectThemeStyle,
} from '../../../components/Form/SelectController';
import { SelectController } from '../../../components/Form/SelectController';

export interface FeesSelectControllerProps
	extends Omit<SelectControllerProps, 'overrideStyles' | 'id' | 'variant'> {
	control: Control<Record<string, SelectOption['value']>>;
	styles: Partial<SelectThemeStyle>;
}
const FeesSelectController = forwardRef(
	(
		{ control, styles, name, 'data-testid': dataTestId, ...props }: FeesSelectControllerProps,
		ref: Ref<SelectInstance<unknown, boolean, GroupBase<unknown>>>,
	) => {
		return (
			<SelectController
				control={control}
				name={name}
				data-testid={dataTestId}
				overrideStyles={styles}
				addonLeft={true}
				{...props}
				variant='unstyled'
				ref={ref}
			/>
		);
	},
);

FeesSelectController.displayName = 'FeesSelectController';

export default FeesSelectController;
