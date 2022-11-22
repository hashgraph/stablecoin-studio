import { Grid, GridItem } from '@chakra-ui/react';
import DirectAction from './DirectAction';
import type { DirectActionProps } from './DirectAction';

interface GridDirectActionProps {
	directActions: DirectActionProps[];
}

type Sizes = 'base' | 'md' | 'lg' | 'xl';

const grids: Record<Sizes, string> = {
	base: 'repeat(1, 1fr)',
	md: 'repeat(2, 1fr)',
	lg: 'repeat(3, 1fr)',
	xl: 'repeat(5, 1fr)',
};

const GridDirectAction = (props: GridDirectActionProps) => {
	const { directActions } = props;

	return (
		<Grid templateColumns={grids} w='full'>
			{directActions.map((directAction: DirectActionProps) => (
				<GridItem key={directAction.title} w='full' mb='45px'>
					<DirectAction
						icon={directAction.icon}
						handleAction={directAction.handleAction}
						title={directAction.title}
						isDisabled={directAction.isDisabled}
						errorNotification={directAction.errorNotification}
						errorTransactionUrl={directAction.errorTransactionUrl}
						operationTranslate={directAction.operationTranslate}
					/>
				</GridItem>
			))}
		</Grid>
	);
};

export default GridDirectAction;
