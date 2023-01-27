import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { HStack } from '@chakra-ui/react';

interface HederaSpinnerProps {
	children?: ReactNode;
}

const transition = {
	duration: 1,
	ease: 'easeInOut',
	times: [0, 0.2, 0.5, 0.8, 1],
	repeat: Infinity,
	repeatDelay: 1,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HederaSpinner = ({ ...props }: HederaSpinnerProps) => {
	return (
		<HStack gap='10px'>
			<motion.svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2500 2500' width='48px'>
				<motion.g data-name='Layer 2'>
					<motion.g
						data-name='Layer 1'
						animate={{
							rotate: [0, 360],
						}}
						transition={transition}
					>
						<motion.path d='M1250 0C559.64 0 0 559.64 0 1250s559.64 1250 1250 1250 1250-559.64 1250-1250S1940.36 0 1250 0'></motion.path>
						<motion.path
							d='M1758.12 1790.62h-158.74v-337.49H900.62v337.49H741.87V696.25h158.75v329.37h698.76V696.25h158.75zm-850-463.75h698.75V1152.5H908.12z'
							fill='#fff'
						></motion.path>
					</motion.g>
				</motion.g>
			</motion.svg>
		</HStack>
	);
};

export default HederaSpinner;
