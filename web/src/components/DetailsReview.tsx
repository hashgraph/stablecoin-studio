import type { TextProps as ChakraTextProps } from '@chakra-ui/react';
import { Box, Divider, Flex, Text } from '@chakra-ui/react';

export interface Detail {
	label: string;
	labelInBold?: boolean;
	value: string;
	valueInBold?: boolean;
}

export interface DetailsReviewProps {
	details: Detail[];
	divider?: boolean;
	title?: string;
	titleProps?: ChakraTextProps;
}

const commonTextProps = {
	fontSize: '14px',
	fontWeight: 500,
	lineHeight: '17px',
	color: 'brand.gray',
};

const textInBoldProps = {
	...commonTextProps,
	fontWeight: 700,
	color: 'brand.black',
};

const DetailsReview = (props: DetailsReviewProps) => {
	const { details, divider = true, title, titleProps } = props;

	return (
		<Box textAlign='left'>
			{title && (
				<Text
					data-testid='details-review-title'
					fontSize='16px'
					fontWeight={600}
					color='brand.gray'
					mb={6}
					{...titleProps}
				>
					{title}
				</Text>
			)}
			<Box>
				{details.map((detail: Detail, index: number, details: Detail[]) => (
					<Box key={`details-review-detail-${index}`}>
						<Flex data-testid={`details-review-detail-${index}`} justifyContent='space-between'>
							<Text {...(detail.labelInBold ? textInBoldProps : commonTextProps)}>
								{detail.label}
							</Text>
							<Text {...(detail.valueInBold ? textInBoldProps : commonTextProps)}>
								{detail.value}
							</Text>
						</Flex>
						{divider && details.length !== index + 1 && (
							<Divider title='divider' mt='13px' mb='13px' />
						)}
					</Box>
				))}
			</Box>
		</Box>
	);
};

export default DetailsReview;
