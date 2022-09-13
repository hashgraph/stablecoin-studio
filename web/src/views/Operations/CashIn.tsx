import { Heading, Input, Text, Box } from '@chakra-ui/react';
import OperationLayout from './OperationLayout';

const CashInOperation = () => {
	return (
		<OperationLayout
			LeftContent={
				<>
					<Heading size='sm'> Cash in operation </Heading>
					<Text>Operation details</Text>
					<Input></Input>
					<Input></Input>
				</>
			}
			RightContent={
				<>
					<Detail />
				</>
			}
		/>
	);
};

const Detail = () => {
	return <Box></Box>;
};

export default CashInOperation;
