import Switch from './Switch';
import { Controller } from 'react-hook-form';
import type { Control, FieldValues } from 'react-hook-form';

export interface SwitchControllerProps {
	control: Control<FieldValues>;
	defaultValue?: boolean;
	disabled?: boolean;
	name: string;
}

const SwitchController = (props: SwitchControllerProps) => {
	const { control, defaultValue = true, disabled, name } = props;

	return (
		<Controller
			control={control}
			defaultValue={defaultValue}
			name={name}
			render={({ field: { onChange, value } }) => (
				<Switch checked={value} disabled={disabled} onChange={() => onChange(!value)} />
			)}
		/>
	);
};

export default SwitchController;
