import { Global } from '@emotion/react';

export const Fonts = () => (
	<Global
		styles={`

  @font-face {
    font-family: 'Mulish';
    src: url('/fonts/Mulish-Bold.ttf') format("truetype");
    font-weight: 700;
    font-style: normal;
  }

  @font-face {
    font-family: 'Mulish';
    src: url('/fonts/Mulish-SemiBold.ttf') format("truetype");
    font-weight: 600;
    font-style: normal;
  }

  @font-face {
    font-family: 'Mulish';
    src: url('/fonts/Mulish-Medium.ttf') format("truetype");
    font-weight: 500;
    font-style: normal;
  }

  @font-face {
    font-family: 'Mulish';
    src: url('/fonts/Mulish-Regular.ttf') format("truetype");
    font-weight: 400;
    font-style: normal;
  }

  `}
	/>
);
