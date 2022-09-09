import { useForm } from 'react-hook-form';
import { SelectController } from '../components/Form/SelectController';

const Dashboard = () => {
	const { control } = useForm();
	return (
		<div>
			Dashboard
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
						value: '2',
					},
				]}
				data-testid='prueba'
			/>
		</div>
	);
};

export default Dashboard;
