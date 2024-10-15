import { Grid, GridItem } from '@chakra-ui/react';
import DirectAccess from './DirectAccess';
import type { DirectAccessProps } from './DirectAccess';

interface GridDirectAccessProps {
	directAccesses: DirectAccessProps[];
}

type Sizes = 'base' | 'md' | 'lg' | 'xl';

const grids: Record<Sizes, string> = {
	base: 'repeat(1, 1fr)',
	md: 'repeat(2, 1fr)',
	lg: 'repeat(3, 1fr)',
	xl: 'repeat(5, 1fr)',
};

const GridDirectAccess = (props: GridDirectAccessProps) => {
	const { directAccesses } = props;

	return (
		<Grid templateColumns={grids} w='full'>
			{directAccesses.map(
				({ icon, route, title, isDisabled, customHandleClick }: DirectAccessProps) => (
					<GridItem key={title} w='full' mb='45px'>
						<DirectAccess
							icon={icon}
							route={route}
							title={title}
							isDisabled={isDisabled}
							customHandleClick={customHandleClick}
						/>
					</GridItem>
				),
			)}
		</Grid>
	);
};

export default GridDirectAccess;
