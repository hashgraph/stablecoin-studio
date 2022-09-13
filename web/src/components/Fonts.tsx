import { Global } from '@emotion/react';

export const Fonts = ({ assetsUrl }: { assetsUrl: string }) => (
	<Global
		styles={`

  @font-face {
    font-family: 'Mulish Bold';
    src: url('${assetsUrl}/fonts/Mulish-Bold.ttf') format("truetype");
    font-weight: 700;
    font-style: normal;
  }

  @font-face {
    font-family: 'Mulish Semibold';
    src: url('${assetsUrl}/fonts/Mulish-SemiBold.ttf') format("truetype");
    font-weight: 600;
    font-style: normal;
  }

  @font-face {
    font-family: 'Mulish Medium';
    src: url('${assetsUrl}/fonts/Mulish-Medium.ttf') format("truetype");
    font-weight: 500;
    font-style: normal;
  }

  @font-face {
    font-family: 'Mulish Regular';
    src: url('${assetsUrl}/fonts/Mulish-Regular.ttf') format("truetype");
    font-weight: 400;
    font-style: normal;
  }

  `}
	/>
);
