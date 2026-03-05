import Switch from './Switch';
import { Controller } from 'react-hook-form';
import type { Control, FieldValues } from 'react-hook-form';
import { Flex, FormControl, Link, Stack } from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

export interface SwitchControllerProps {
	control: Control<FieldValues>;
	defaultValue?: boolean;
	disabled?: boolean;
	name: string;
	link?: string | null;
}

const SwitchController = ({ link, ...props }: SwitchControllerProps) => {
	const { control, defaultValue = true, disabled, name } = props;

	return (
		<Controller
			control={control}
			defaultValue={defaultValue}
			name={name}
			render={({ field: { onChange, value } }) => (
				<Stack w='full'>
					<FormControl>
						<Flex justifyContent='start'>
							{link && (
								<Link href={link} isExternal>
									<InfoIcon />
								</Link>
							)}
						</Flex>
						<Switch checked={value} disabled={disabled} onChange={() => onChange(!value)} />
					</FormControl>
				</Stack>
			)}
		/>
	);
};

export default SwitchController;
